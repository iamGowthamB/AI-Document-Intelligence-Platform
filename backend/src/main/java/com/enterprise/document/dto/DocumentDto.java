package com.enterprise.document.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class DocumentDto {
    private Long id;
    private String name;
    private Long fileSize;
    private String fileType;
    private String category;
    private Set<String> tags;
    private String status;
    private Integer version;
    private Long ownerId;
    private String ownerName;
    private Long departmentId;
    private String departmentName;
    private LocalDateTime createdAt;
    private boolean isFavorite;
}
