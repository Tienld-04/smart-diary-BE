package com.project1.smart_diary.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project1.smart_diary.config.GeminiApiConfig;
import com.project1.smart_diary.enums.Emotion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class GeminiAPIService {
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private GeminiApiConfig geminiApiConfig;

    public Emotion predictTextEmotion(String input) {
        if (input == null || input.isBlank()) {
            log.error("Input is null or empty");
            throw new IllegalArgumentException("Input cannot be null or empty");
        }
        String prompt = String.format(
                "Phân tích cảm xúc của đoạn văn sau (có thể chứa emoji): \"%s\". " +
                        "Trả về một trong các từ: POSITIVE, NEGATIVE, NEUTRAL, ANXIOUS, ANGRY.",
                input
        );
        try {
            String response = callGeminiAPI(prompt);
            return parseEmotionFromResponse(response);
        } catch (Exception e) {
            log.error("Error predicting text emotion: {}", e.getMessage());
            throw new RuntimeException("Lỗi khi dự đoán cảm xúc: " + e.getMessage(), e);
        }
    }

    private Emotion parseEmotionFromResponse(String response) {
        if (response == null || response.isBlank()) {
            return Emotion.NEUTRAL; // fallback mặc định
        }
        response = response.toLowerCase();

        if (response.contains("positive") || response.contains("tích cực") || response.contains("vui") || response.contains("hạnh phúc")) {
            return Emotion.POSITIVE;
        } else if (response.contains("negative") || response.contains("tiêu cực") || response.contains("buồn") || response.contains("chán")) {
            return Emotion.NEGATIVE;
        } else if (response.contains("anxious") || response.contains("lo lắng") || response.contains("bồn chồn")) {
            return Emotion.ANXIOUS;
        } else if (response.contains("angry") || response.contains("tức giận") || response.contains("cáu") || response.contains("giận dữ")) {
            return Emotion.ANGRY;
        } else {
            return Emotion.NEUTRAL;
        }
    }

    private String callGeminiAPI(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // BỎ Authorization header - Gemini sử dụng query parameter
        String apiKey = geminiApiConfig.getKey();
        log.info("Using API key: {}", apiKey != null ? apiKey.substring(0, 10) + "..." : "NULL");
        String requestBody = String.format(
                "{\"contents\": [{\"parts\": [{\"text\": \"%s\"}]}]}",
                prompt.replace("\"", "\\\"")
        );
        log.info("Request body: {}", requestBody);
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        try {
            // Thêm API key vào query parameter thay vì header
            String urlWithKey = geminiApiConfig.getEndpoints().get("text-generation") + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(
                    urlWithKey,
                    request, String.class);
            log.info("Response status: {}", response.getStatusCode());
            log.info("Response body: {}", response.getBody());
            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            throw e;
        }
    }

    //    ----------------------------------------------------------------------------------------
    public String generateAdvice(String text, Emotion emotion) {
        String prompt = String.format("Tạo lời khuyên ngắn gọn và tích cực cho nội dung: '%s' với cảm xúc: %s. Trả về lời khuyên khoảng 2 dòng.",
                text, emotion.getDescription());

        try {
            String response = callGeminiAPI(prompt);
            String extractedText = extractTextFromResponse(response);
            return extractedText;
        } catch (Exception e) {
            log.error("Error generating advice: {}", e.getMessage());
            return "Hãy giữ tinh thần tích cực và tiếp tục cố gắng!";
        }
    }
    private final ObjectMapper objectMapper = new ObjectMapper();
    private String extractTextFromResponse(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            // Parse theo structure: candidates[0].content.parts[0].text
            JsonNode candidatesNode = rootNode.path("candidates");
            if (candidatesNode.isArray() && candidatesNode.size() > 0) {
                JsonNode firstCandidate = candidatesNode.get(0);
                JsonNode contentNode = firstCandidate.path("content");
                JsonNode partsNode = contentNode.path("parts");

                if (partsNode.isArray() && partsNode.size() > 0) {
                    JsonNode firstPart = partsNode.get(0);
                    JsonNode textNode = firstPart.path("text");

                    if (!textNode.isMissingNode()) {
                        String extractedText = textNode.asText().trim();
                        log.info("Extracted text: {}", extractedText);
                        return extractedText;
                    }
                }
            }

            log.warn("Could not extract text from response: {}", jsonResponse);
            return "Không thể trích xuất nội dung từ phản hồi AI.";

        } catch (Exception e) {
            log.error("Error parsing JSON response: {}", e.getMessage());
            return "Lỗi khi xử lý phản hồi từ AI: " + e.getMessage();
        }
    }
}
