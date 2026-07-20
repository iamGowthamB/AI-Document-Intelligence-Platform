package com.enterprise.document.dto;

import lombok.Data;

@Data
public class AiChatRequest {
    private String question;
    private Long documentId; // optional, to chat with single document
}
