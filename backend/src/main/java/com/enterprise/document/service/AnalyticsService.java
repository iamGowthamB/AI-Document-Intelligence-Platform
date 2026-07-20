package com.enterprise.document.service;

import com.enterprise.document.entity.Document;
import com.enterprise.document.repository.AuditLogRepository;
import com.enterprise.document.repository.DepartmentRepository;
import com.enterprise.document.repository.DocumentRepository;
import com.enterprise.document.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogRepository auditLogRepository;

    public Map<String, Object> getSystemAnalytics() {
        Map<String, Object> data = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalDepts = departmentRepository.count();
        List<Document> allDocs = documentRepository.findAll();
        long totalDocs = allDocs.size();

        long totalStorage = allDocs.stream()
                .mapToLong(d -> d.getFileSize() != null ? d.getFileSize() : 0L)
                .sum();

        long aiQueries = auditLogRepository.findAll().stream()
                .filter(log -> log.getAction().startsWith("AI_"))
                .count();

        data.put("totalUsers", totalUsers);
        data.put("totalDepartments", totalDepts);
        data.put("totalDocuments", totalDocs);
        data.put("storageUsage", totalStorage);
        data.put("aiUsageCount", aiQueries);

        Map<String, Long> categories = allDocs.stream()
                .collect(Collectors.groupingBy(Document::getCategory, Collectors.counting()));
        data.put("categories", categories);

        Map<String, Long> departments = allDocs.stream()
                .collect(Collectors.groupingBy(d -> d.getDepartment().getName(), Collectors.counting()));
        data.put("departmentDocs", departments);

        DateTimeFormatter df = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> trends = allDocs.stream()
                .collect(Collectors.groupingBy(d -> d.getCreatedAt().format(df), TreeMap::new, Collectors.counting()));
        data.put("uploadTrends", trends);

        return data;
    }

    public Map<String, Object> getDepartmentAnalytics(Long departmentId) {
        Map<String, Object> data = new HashMap<>();

        long totalUsersInDept = userRepository.findByDepartmentId(departmentId).size();
        List<Document> deptDocs = documentRepository.findByDepartmentId(departmentId);
        long totalDocs = deptDocs.size();

        long storageUsage = deptDocs.stream()
                .mapToLong(d -> d.getFileSize() != null ? d.getFileSize() : 0L)
                .sum();

        long pendingApprovals = deptDocs.stream()
                .filter(d -> d.getStatus() == com.enterprise.document.entity.DocumentStatus.PENDING)
                .count();

        data.put("totalUsers", totalUsersInDept);
        data.put("totalDocuments", totalDocs);
        data.put("storageUsage", storageUsage);
        data.put("pendingApprovals", pendingApprovals);

        Map<String, Long> categories = deptDocs.stream()
                .collect(Collectors.groupingBy(Document::getCategory, Collectors.counting()));
        data.put("categories", categories);

        return data;
    }
}
