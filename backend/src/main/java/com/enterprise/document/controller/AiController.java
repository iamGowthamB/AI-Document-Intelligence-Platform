package com.enterprise.document.controller;

import com.enterprise.document.dto.AiChatRequest;
import com.enterprise.document.dto.AiResponse;
import com.enterprise.document.entity.Document;
import com.enterprise.document.entity.User;
import com.enterprise.document.service.AiService;
import com.enterprise.document.service.AuditLogService;
import com.enterprise.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final DocumentService documentService;
    private final AuditLogService auditLogService;

    @PostMapping("/chat")
    public ResponseEntity<AiResponse> chat(
            @RequestBody AiChatRequest request,
            @AuthenticationPrincipal User user
    ) {
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        if (user.getRole() == com.enterprise.document.entity.Role.ADMIN) {
            deptId = null;
        }
        Long docId = request.getDocumentId();
        
        if (docId != null) {
            Document doc = documentService.getDocumentById(docId, user);
            documentService.validateDepartmentAccess(user, doc.getDepartment().getId());
        }

        String answer = aiService.chatWithDocs(request.getQuestion(), deptId, docId);
        
        auditLogService.log(user, "AI_CHAT", "Asked AI: '" + request.getQuestion() + "'" + 
                (docId != null ? " (On Document ID: " + docId + ")" : " (On Department ID: " + deptId + ")"));

        return ResponseEntity.ok(
                AiResponse.builder()
                        .answer(answer)
                        .fileIndexed(false)
                        .build()
        );
    }

    @PostMapping("/summarize/{docId}")
    public ResponseEntity<Map<String, String>> summarize(
            @PathVariable Long docId,
            @AuthenticationPrincipal User user
    ) {
        Document doc = documentService.getDocumentById(docId, user);
        String summary = aiService.summarizeDocument(doc.getFilePath());
        
        auditLogService.log(user, "AI_SUMMARY", "Generated AI Summary for document: " + doc.getName());

        return ResponseEntity.ok(Map.of(
                "filename", doc.getName(),
                "summary", summary
        ));
    }

    @PostMapping("/deadlines/{docId}")
    public ResponseEntity<Map<String, Object>> getDeadlines(
            @PathVariable Long docId,
            @AuthenticationPrincipal User user
    ) {
        Document doc = documentService.getDocumentById(docId, user);
        Object deadlines = aiService.extractDeadlines(doc.getFilePath());
        
        auditLogService.log(user, "AI_DEADLINE", "Extracted deadlines for document: " + doc.getName());

        return ResponseEntity.ok(Map.of(
                "filename", doc.getName(),
                "deadlines", deadlines
        ));
    }

    @PostMapping("/image-analysis")
    public ResponseEntity<Map<String, String>> analyzeImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("question") String question,
            @AuthenticationPrincipal User user
    ) throws IOException {
        String tempDir = System.getProperty("java.io.tmpdir");
        String uniqueName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path tempPath = Paths.get(tempDir, uniqueName);
        Files.copy(file.getInputStream(), tempPath);

        try {
            String answer = aiService.analyzeImage(tempPath.toString(), question);
            auditLogService.log(user, "AI_IMAGE", "Performed standard image analysis: '" + question + "'");
            return ResponseEntity.ok(Map.of(
                    "filename", file.getOriginalFilename(),
                    "answer", answer
            ));
        } finally {
            Files.deleteIfExists(tempPath);
        }
    }

    @PostMapping("/circuit-analysis")
    public ResponseEntity<Map<String, String>> analyzeCircuit(
            @RequestParam("file") MultipartFile file,
            @RequestParam("question") String question,
            @AuthenticationPrincipal User user
    ) throws IOException {
        String tempDir = System.getProperty("java.io.tmpdir");
        String uniqueName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path tempPath = Paths.get(tempDir, uniqueName);
        Files.copy(file.getInputStream(), tempPath);

        try {
            String answer = aiService.analyzeCircuit(tempPath.toString(), question);
            auditLogService.log(user, "AI_CIRCUIT", "Performed local Qwen circuit analysis: '" + question + "'");
            return ResponseEntity.ok(Map.of(
                    "filename", file.getOriginalFilename(),
                    "answer", answer
            ));
        } finally {
            Files.deleteIfExists(tempPath);
        }
    }

    @PostMapping("/search")
    public ResponseEntity<java.util.List<Map<String, Object>>> search(
            @RequestParam("query") String query,
            @AuthenticationPrincipal User user
    ) {
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        if (user.getRole() == com.enterprise.document.entity.Role.ADMIN) {
            deptId = null;
        }
        java.util.List<Map<String, Object>> results = aiService.semanticSearch(query, deptId);
        
        auditLogService.log(user, "AI_SEARCH", "Performed semantic search: '" + query + "'");
        return ResponseEntity.ok(results);
    }
}
