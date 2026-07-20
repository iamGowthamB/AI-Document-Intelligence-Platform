package com.enterprise.document.repository;

import com.enterprise.document.entity.Document;
import com.enterprise.document.entity.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByDepartmentId(Long departmentId);
    List<Document> findByOwnerId(Long ownerId);
    List<Document> findByDepartmentIdAndStatus(Long departmentId, DocumentStatus status);
}
