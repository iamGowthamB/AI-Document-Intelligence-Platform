package com.enterprise.document.controller;

import com.enterprise.document.entity.AuditLog;
import com.enterprise.document.entity.User;
import com.enterprise.document.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }

    @GetMapping("/my")
    public ResponseEntity<List<AuditLog>> getMyLogs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(user.getId()));
    }
}
