package com.enterprise.document.service;

import com.enterprise.document.dto.DocumentDto;
import com.enterprise.document.entity.*;
import com.enterprise.document.exception.BadRequestException;
import com.enterprise.document.exception.ResourceNotFoundException;
import com.enterprise.document.exception.UnauthorizedException;
import com.enterprise.document.repository.DocumentRepository;
import com.enterprise.document.repository.DocumentVersionRepository;
import com.enterprise.document.repository.UserFavoriteRepository;
import com.enterprise.document.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public DocumentDto uploadDocument(MultipartFile file, String category, Set<String> tags, User user) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        // 1. Create upload folder if not exists
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            uploadFolder.mkdirs();
        }

        // 2. Format name and path
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String uniqueName = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetPath = Paths.get(uploadDir, uniqueName);
        Files.copy(file.getInputStream(), targetPath);

        // 3. Set initial approval status
        DocumentStatus status = (user.getRole() == Role.ADMIN || user.getRole() == Role.MANAGER) 
                ? DocumentStatus.APPROVED 
                : DocumentStatus.PENDING;

        // 4. Save Document Metadata
        Document doc = Document.builder()
                .name(originalFilename)
                .filePath(targetPath.toString())
                .fileSize(file.getSize())
                .fileType(extension.replace(".", "").toUpperCase())
                .owner(user)
                .department(user.getDepartment())
                .category(category)
                .tags(tags)
                .status(status)
                .version(1)
                .build();

        Document savedDoc = documentRepository.save(doc);

        // 5. Save Document Version Record
        DocumentVersion version = DocumentVersion.builder()
                .document(savedDoc)
                .version(1)
                .filePath(savedDoc.getFilePath())
                .fileSize(savedDoc.getFileSize())
                .build();
        versionRepository.save(version);

        // 6. Ingest file into Flask AI Engine vector DB
        aiService.ingestDocument(savedDoc.getFilePath(), uniqueName, savedDoc.getId(), user.getDepartment().getId(), user.getId());

        // 7. Audit log & Notifications
        auditLogService.log(user, "UPLOAD", "Uploaded document: " + originalFilename + " (Status: " + status.name() + ")");

        if (status == DocumentStatus.PENDING) {
            // Notify managers in the same department
            List<User> managers = userRepository.findByDepartmentId(user.getDepartment().getId()).stream()
                    .filter(u -> u.getRole() == Role.MANAGER)
                    .collect(Collectors.toList());
            for (User mgr : managers) {
                notificationService.createNotification(
                        mgr, 
                        "New document approval request: '" + originalFilename + "' uploaded by " + user.getFullName(), 
                        "APPROVAL_REQUEST"
                );
            }
        } else {
            notificationService.createNotification(
                    user, 
                    "Document '" + originalFilename + "' successfully uploaded and indexed.", 
                    "NEW_DOCUMENT"
            );
        }

        return mapToDto(savedDoc, user);
    }

    @Transactional
    public DocumentDto updateDocumentFile(Long documentId, MultipartFile file, User user) throws IOException {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));

        validateDepartmentAccess(user, doc.getDepartment().getId());

        if (user.getRole() == Role.EMPLOYEE && !doc.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to update this document.");
        }

        String originalFilename = file.getOriginalFilename();
        String uniqueName = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetPath = Paths.get(uploadDir, uniqueName);
        Files.copy(file.getInputStream(), targetPath);

        // Bump version number
        int newVersionNumber = doc.getVersion() + 1;
        doc.setVersion(newVersionNumber);
        doc.setFilePath(targetPath.toString());
        doc.setFileSize(file.getSize());
        
        // Reset status to pending if updated by employee
        if (user.getRole() == Role.EMPLOYEE) {
            doc.setStatus(DocumentStatus.PENDING);
        } else {
            doc.setStatus(DocumentStatus.APPROVED);
        }

        Document savedDoc = documentRepository.save(doc);

        // Record history version
        DocumentVersion version = DocumentVersion.builder()
                .document(savedDoc)
                .version(newVersionNumber)
                .filePath(savedDoc.getFilePath())
                .fileSize(savedDoc.getFileSize())
                .build();
        versionRepository.save(version);

        // Re-ingest new version
        aiService.ingestDocument(savedDoc.getFilePath(), uniqueName, savedDoc.getId(), doc.getDepartment().getId(), user.getId());

        auditLogService.log(user, "UPDATE_FILE", "Updated file content for document: " + doc.getName() + " to version " + newVersionNumber);
        
        if (doc.getStatus() == DocumentStatus.PENDING) {
            // Notify manager
            userRepository.findByDepartmentId(doc.getDepartment().getId()).stream()
                    .filter(u -> u.getRole() == Role.MANAGER)
                    .forEach(mgr -> notificationService.createNotification(
                            mgr, 
                            "Document version approval request: '" + doc.getName() + "' (v" + newVersionNumber + ") updated by " + user.getFullName(), 
                            "APPROVAL_REQUEST"
                    ));
        }

        return mapToDto(savedDoc, user);
    }

    @Transactional
    public DocumentDto approveDocument(Long id, User manager) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        if (manager.getRole() != Role.ADMIN && 
            (manager.getRole() != Role.MANAGER || !doc.getDepartment().getId().equals(manager.getDepartment().getId()))) {
            throw new UnauthorizedException("You are not authorized to approve documents for this department.");
        }

        doc.setStatus(DocumentStatus.APPROVED);
        Document saved = documentRepository.save(doc);

        auditLogService.log(manager, "APPROVE_DOCUMENT", "Approved document: " + doc.getName());
        notificationService.createNotification(
                doc.getOwner(), 
                "Your document '" + doc.getName() + "' has been approved by " + manager.getFullName(), 
                "APPROVED"
        );

        return mapToDto(saved, manager);
    }

    @Transactional
    public DocumentDto rejectDocument(Long id, User manager) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        if (manager.getRole() != Role.ADMIN && 
            (manager.getRole() != Role.MANAGER || !doc.getDepartment().getId().equals(manager.getDepartment().getId()))) {
            throw new UnauthorizedException("You are not authorized to reject documents for this department.");
        }

        doc.setStatus(DocumentStatus.REJECTED);
        Document saved = documentRepository.save(doc);

        auditLogService.log(manager, "REJECT_DOCUMENT", "Rejected document: " + doc.getName());
        notificationService.createNotification(
                doc.getOwner(), 
                "Your document '" + doc.getName() + "' was rejected by " + manager.getFullName(), 
                "REJECTED"
        );

        return mapToDto(saved, manager);
    }

    @Transactional
    public void deleteDocument(Long id, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        // Security check: Only Admin, manager of same dept, or document owner can delete
        if (user.getRole() != Role.ADMIN) {
            if (user.getRole() == Role.MANAGER && !doc.getDepartment().getId().equals(user.getDepartment().getId())) {
                throw new UnauthorizedException("You cannot delete documents from other departments.");
            }
            if (user.getRole() == Role.EMPLOYEE && !doc.getOwner().getId().equals(user.getId())) {
                throw new UnauthorizedException("You can only delete your own documents.");
            }
        }

        // Delete from favorites first to prevent database foreign key constraint error
        // Favorite repository delete queries can be written or handled, let's delete them
        userFavoriteRepository.findByUserId(user.getId()).stream()
                .filter(fav -> fav.getDocument().getId().equals(id))
                .forEach(userFavoriteRepository::delete);

        // Delete physical files
        List<DocumentVersion> versions = versionRepository.findByDocumentIdOrderByVersionDesc(id);
        for (DocumentVersion ver : versions) {
            try {
                Files.deleteIfExists(Paths.get(ver.getFilePath()));
            } catch (IOException e) {
                System.err.println("Could not delete physical file: " + ver.getFilePath());
            }
            versionRepository.delete(ver);
        }

        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException e) {
            System.err.println("Could not delete main physical file: " + doc.getFilePath());
        }

        documentRepository.delete(doc);
        auditLogService.log(user, "DELETE", "Deleted document: " + doc.getName());
    }

    @Transactional
    public void toggleFavorite(Long id, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        validateDepartmentAccess(user, doc.getDepartment().getId());

        Optional<UserFavorite> favoriteOpt = userFavoriteRepository.findByUserIdAndDocumentId(user.getId(), id);
        if (favoriteOpt.isPresent()) {
            userFavoriteRepository.delete(favoriteOpt.get());
            auditLogService.log(user, "FAVORITE_REMOVE", "Removed document from favorites: " + doc.getName());
        } else {
            UserFavorite fav = UserFavorite.builder()
                    .user(user)
                    .document(doc)
                    .build();
            userFavoriteRepository.save(fav);
            auditLogService.log(user, "FAVORITE_ADD", "Added document to favorites: " + doc.getName());
        }
    }

    public List<DocumentDto> getDocumentsForUser(User user) {
        List<Document> docs;
        if (user.getRole() == Role.ADMIN) {
            docs = documentRepository.findAll();
        } else {
            docs = documentRepository.findByDepartmentId(user.getDepartment().getId());
        }

        return docs.stream()
                .map(doc -> mapToDto(doc, user))
                .collect(Collectors.toList());
    }

    public Document getDocumentById(Long id, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        validateDepartmentAccess(user, doc.getDepartment().getId());
        return doc;
    }

    public File getPhysicalFile(Long id, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        validateDepartmentAccess(user, doc.getDepartment().getId());
        return new File(doc.getFilePath());
    }

    public List<DocumentDto> getFavoritesForUser(User user) {
        return userFavoriteRepository.findByUserId(user.getId()).stream()
                .map(UserFavorite::getDocument)
                .map(doc -> mapToDto(doc, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto renameDocument(Long id, String newName, User user) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        validateDepartmentAccess(user, doc.getDepartment().getId());

        if (user.getRole() == Role.EMPLOYEE && !doc.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to rename this document.");
        }

        String oldName = doc.getName();
        doc.setName(newName);
        Document saved = documentRepository.save(doc);

        auditLogService.log(user, "RENAME", "Renamed document '" + oldName + "' to '" + newName + "'");
        return mapToDto(saved, user);
    }

    public void validateDepartmentAccess(User user, Long deptId) {
        if (user.getRole() != Role.ADMIN && 
            (user.getDepartment() == null || !user.getDepartment().getId().equals(deptId))) {
            throw new UnauthorizedException("Access Denied: You do not have permission to view documents from other departments.");
        }
    }

    public DocumentDto mapToDto(Document doc, User user) {
        boolean isFav = userFavoriteRepository.existsByUserIdAndDocumentId(user.getId(), doc.getId());
        return DocumentDto.builder()
                .id(doc.getId())
                .name(doc.getName())
                .fileSize(doc.getFileSize())
                .fileType(doc.getFileType())
                .category(doc.getCategory())
                .tags(doc.getTags())
                .status(doc.getStatus().name())
                .version(doc.getVersion())
                .ownerId(doc.getOwner().getId())
                .ownerName(doc.getOwner().getFullName())
                .departmentId(doc.getDepartment().getId())
                .departmentName(doc.getDepartment().getName())
                .createdAt(doc.getCreatedAt())
                .isFavorite(isFav)
                .build();
    }
}
