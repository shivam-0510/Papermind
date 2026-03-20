package com.docuai.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// ---- Request DTOs ----

public class DocumentDTOs {

    @Data
    public static class QuestionRequest {
        @NotNull(message = "Document ID is required")
        private Long documentId;

        @NotBlank(message = "Question cannot be blank")
        private String question;
    }

    // ---- Response DTOs ----

    @Data
    public static class DocumentUploadResponse {
        private Long id;
        private String fileName;
        private String status;
        private String message;

        public DocumentUploadResponse(Long id, String fileName, String status, String message) {
            this.id = id;
            this.fileName = fileName;
            this.status = status;
            this.message = message;
        }
    }

    @Data
    public static class QuestionResponse {
        private Long documentId;
        private String question;
        private String answer;
        private String source; // "AI" or "CACHE" (for Phase 2 Redis)

        public QuestionResponse(Long documentId, String question, String answer, String source) {
            this.documentId = documentId;
            this.question = question;
            this.answer = answer;
            this.source = source;
        }
    }

    @Data
    public static class DocumentListResponse {
        private Long id;
        private String fileName;
        private String status;
        private String createdAt;

        public DocumentListResponse(Long id, String fileName, String status, String createdAt) {
            this.id = id;
            this.fileName = fileName;
            this.status = status;
            this.createdAt = createdAt;
        }
    }
}