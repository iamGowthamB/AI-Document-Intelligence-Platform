package com.enterprise.document.service;

import com.enterprise.document.dto.AiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${app.ai-engine.base-url}")
    private String aiEngineUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void ingestDocument(String filePath, String fileName, Long docId, Long deptId, Long ownerId) {
        String url = aiEngineUrl + "/api/ingest";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(new File(filePath)));
        body.add("document_id", docId.toString());
        body.add("department_id", deptId.toString());
        body.add("owner_id", ownerId.toString());

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() != HttpStatus.OK) {
                System.err.println("Failed to ingest document in AI engine. Status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("Error calling AI Ingest endpoint: " + e.getMessage());
        }
    }

    public String chatWithDocs(String question, Long deptId, Long docId) {
        String url = aiEngineUrl + "/api/chat";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> filter = new HashMap<>();
        if (docId != null) {
            filter.put("document_id", docId.toString());
        } else if (deptId != null) {
            filter.put("department_id", deptId.toString());
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("question", question);
        if (!filter.isEmpty()) {
            requestBody.put("filter", filter);
        }

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("answer");
            }
        } catch (Exception e) {
            return "Failed to query the AI Engine: " + e.getMessage();
        }
        return "Failed to get an answer from the documents.";
    }

    public String summarizeDocument(String filePath) {
        String url = aiEngineUrl + "/api/summarize";
        return sendFileRequest(url, filePath, "summary");
    }

    public Object extractDeadlines(String filePath) {
        String url = aiEngineUrl + "/api/deadlines";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(new File(filePath)));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody().get("deadlines");
            }
        } catch (Exception e) {
            return "Failed to extract deadlines: " + e.getMessage();
        }
        return "Failed to get deadlines.";
    }

    public String analyzeImage(String filePath, String question) {
        String url = aiEngineUrl + "/api/image-analysis";
        return sendFileAndTextRequest(url, filePath, question);
    }

    public String analyzeCircuit(String filePath, String question) {
        String url = aiEngineUrl + "/api/circuit-analysis";
        return sendFileAndTextRequest(url, filePath, question);
    }

    public java.util.List<Map<String, Object>> semanticSearch(String query, Long deptId) {
        String url = aiEngineUrl + "/api/search";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> filter = new HashMap<>();
        if (deptId != null) {
            filter.put("department_id", deptId.toString());
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        if (!filter.isEmpty()) {
            requestBody.put("filter", filter);
        }

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (java.util.List<Map<String, Object>>) response.getBody().get("results");
            }
        } catch (Exception e) {
            System.err.println("Search failed: " + e.getMessage());
        }
        return java.util.Collections.emptyList();
    }

    private String sendFileRequest(String url, String filePath, String responseKey) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(new File(filePath)));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get(responseKey);
            }
        } catch (Exception e) {
            return "Error calling AI service: " + e.getMessage();
        }
        return "Failed to get results from the AI service.";
    }

    private String sendFileAndTextRequest(String url, String filePath, String question) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(new File(filePath)));
        body.add("question", question);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("answer");
            }
        } catch (Exception e) {
            return "Error calling AI analysis: " + e.getMessage();
        }
        return "Failed to get response from AI analysis.";
    }
}
