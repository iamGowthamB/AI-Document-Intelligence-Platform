package com.enterprise.document.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String tempToken;
    private String newPassword;
}
