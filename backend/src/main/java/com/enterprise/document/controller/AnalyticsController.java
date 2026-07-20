package com.enterprise.document.controller;

import com.enterprise.document.entity.User;
import com.enterprise.document.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }

    @GetMapping("/department")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getMyDepartmentStats(@AuthenticationPrincipal User user) {
        if (user.getDepartment() == null) {
            return ResponseEntity.ok(Map.of(
                    "totalUsers", 0,
                    "totalDocuments", 0,
                    "storageUsage", 0,
                    "pendingApprovals", 0,
                    "categories", Map.of()
            ));
        }
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics(user.getDepartment().getId()));
    }

    @GetMapping("/department/{deptId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDepartmentStats(@PathVariable Long deptId) {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics(deptId));
    }
}
