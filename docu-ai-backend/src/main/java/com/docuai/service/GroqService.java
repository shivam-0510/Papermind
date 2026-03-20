package com.docuai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.model}")
    private String model;

    @Value("${groq.api.max-tokens}")
    private int maxTokens;

    // Groq uses OpenAI-compatible API format
    private static final String GROQ_BASE_URL = "https://api.groq.com";

    public GroqService() {
        this.webClient = WebClient.builder()
                .baseUrl(GROQ_BASE_URL)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sends document text + question to Groq (LLaMA 3.3 70B) and returns the answer.
     * Groq uses the same request/response format as OpenAI — very easy to use.
     */
    public String askQuestion(String documentText, String question) {
        log.info("Sending question to Groq: {}", question);

        // OpenAI-compatible request format
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are a helpful document analysis assistant. " +
                                "Answer questions based ONLY on the provided document content. " +
                                "If the answer is not found in the document, say 'I could not find that information in the document.' " +
                                "Be concise, accurate, and helpful."),
                        Map.of("role", "user", "content",
                                "Document Content:\n---\n" + documentText + "\n---\n\nQuestion: " + question)
                ),
                "max_tokens", maxTokens,
                "temperature", 0.3
        );

        try {
            String responseBody = webClient.post()
                    .uri("/openai/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            String answer = extractAnswer(responseBody);
            log.info("Received answer from Groq (length: {} chars)", answer.length());
            return answer;

        } catch (WebClientResponseException e) {
            log.error("Groq API error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("Groq rate limit hit. Please wait a moment and try again.");
            }
            throw new RuntimeException("Groq API error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Groq call failed: {}", e.getMessage());
            throw new RuntimeException("Failed to get answer from Groq: " + e.getMessage());
        }
    }

    private String extractAnswer(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);

        if (root.has("error")) {
            throw new RuntimeException("Groq error: " + root.get("error").get("message").asText());
        }

        return root.get("choices")
                .get(0)
                .get("message")
                .get("content")
                .asText();
    }
}