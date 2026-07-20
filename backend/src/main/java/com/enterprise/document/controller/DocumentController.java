package com.enterprise.document.controller;

import com.enterprise.document.dto.DocumentDto;
import com.enterprise.document.entity.Document;
import com.enterprise.document.entity.User;
import com.enterprise.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentDto> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam(value = "tags", required = false) Set<String> tags,
            @AuthenticationPrincipal User user
    ) throws IOException {
        Set<String> parsedTags = tags != null ? tags : new java.util.HashSet<>();
        return ResponseEntity.ok(documentService.uploadDocument(file, category, parsedTags, user));
    }

    @PostMapping("/{id}/update-file")
    public ResponseEntity<DocumentDto> updateDocumentFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) throws IOException {
        return ResponseEntity.ok(documentService.updateDocumentFile(id, file, user));
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getDocuments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentService.getDocumentsForUser(user));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<DocumentDto>> getFavorites(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentService.getFavoritesForUser(user));
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<Map<String, String>> toggleFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        documentService.toggleFavorite(id, user);
        return ResponseEntity.ok(Map.of("message", "Document favorite status updated"));
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<DocumentDto> renameDocument(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(documentService.renameDocument(id, name, user));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<DocumentDto> approveDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(documentService.approveDocument(id, user));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DocumentDto> rejectDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(documentService.rejectDocument(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        documentService.deleteDocument(id, user);
        return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Document doc = documentService.getDocumentById(id, user);
        File file = new File(doc.getFilePath());
        Resource resource = new FileSystemResource(file);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getName() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewFile(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        Document doc = documentService.getDocumentById(id, user);
        File file = new File(doc.getFilePath());
        Resource resource = new FileSystemResource(file);
        
        String mimeType = "application/octet-stream";
        String ext = doc.getFileType().toUpperCase();
        switch (ext) {
            case "PDF" -> mimeType = "application/pdf";
            case "PNG" -> mimeType = "image/png";
            case "JPG", "JPEG" -> mimeType = "image/jpeg";
            case "GIF" -> mimeType = "image/gif";
            case "TXT" -> mimeType = "text/plain";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getName() + "\"")
                .body(resource);
    }
}
