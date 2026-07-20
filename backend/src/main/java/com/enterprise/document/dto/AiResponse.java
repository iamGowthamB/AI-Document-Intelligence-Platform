package com.enterprise.document.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiResponse {
    private String answer;
    private boolean fileIndexed;
}
