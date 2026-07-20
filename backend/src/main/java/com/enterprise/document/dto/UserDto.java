package com.enterprise.document.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Long departmentId;
    private String departmentName;
    private boolean active;
}
