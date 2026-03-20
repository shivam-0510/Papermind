package com.docuai.service;

import com.docuai.dto.DocumentDTOs.*;
import com.docuai.entity.Document;
import com.docuai.entity.User;
import com.docuai.kafka.DocumentProducer;
import com.docuai.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PdfExtractionService pdfExtractionService;
    private final GroqService groqService;
    private final CacheService cacheService;
    private final DocumentProducer documentProducer;
    private final ChatHistoryService chatHistoryService;
    private final RateLimitService rateLimitService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final int MAX_CHARS_FOR_AI = 50000;

    /**
     * UPLOAD FLOW (Phase 2 with Kafka):
     * 1. Save file to disk
     * 2. Save document record with status=UPLOADED
     * 3. Fire Kafka event → returns immediately to client
     * 4. Kafka consumer processes PDF asynchronously in background
     */
    public DocumentUploadResponse uploadDocument(MultipartFile file, User user) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }

        // Save file to disk
        byte[] fileBytes = file.getBytes();
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String uniqueFilename = System.currentTimeMillis() + "_" + originalFilename;
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.write(filePath, fileBytes);
        log.info("File saved: {}", filePath);

        // Save with UPLOADED status and link to user
        Document document = Document.builder()
                .fileName(originalFilename)
                .filePath(filePath.toString())
                .status("UPLOADED")
                .user(user)
                .build();

        Document saved = documentRepository.save(document);

        // Fire Kafka event — consumer will extract text asynchronously
        documentProducer.sendDocumentUploadEvent(saved.getId());

        return new DocumentUploadResponse(
                saved.getId(), saved.getFileName(), saved.getStatus(),
                "Document uploaded! Processing in background via Kafka...");
    }

    /**
     * ASK FLOW (Phase 2 with Redis):
     * 1. Check Redis cache → if HIT, return cached answer instantly
     * 2. If MISS → call Groq AI
     * 3. Save answer to Redis for future requests
     */
    public QuestionResponse askQuestion(Long documentId, String question, User user) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        if (!"PROCESSED".equals(document.getStatus())) {
            throw new RuntimeException("Document not ready yet. Current status: " + document.getStatus());
        }

        // ── Step 1: Check Redis cache FIRST (cache hits don't consume quota) ──
        String cached = cacheService.getAnswer(documentId, question);
        if (cached != null) {
            log.info("Cache HIT — returning cached answer, no rate limit consumed");
            chatHistoryService.saveMessage(document, user, question, cached, "CACHE");
            int remaining = rateLimitService.getRemainingRequests(user.getId());
            return new QuestionResponse(documentId, question, cached, "CACHE");
        }

        // ── Step 2: Pre-flight rate limit check (read-only, no increment yet) ──
        if (!rateLimitService.isAllowed(user.getId())) {
            int remaining = rateLimitService.getRemainingRequests(user.getId());
            throw new RuntimeException(
                    "Hourly AI request limit reached. Remaining: " + remaining +
                            ". Cached answers are still free — try rephrasing a previous question.");
        }

        // ── Step 3: Consume one quota slot and double-check (handles race conditions) ──
        if (!rateLimitService.consumeAndCheck(user.getId())) {
            int remaining = rateLimitService.getRemainingRequests(user.getId());
            throw new RuntimeException(
                    "Hourly AI request limit reached. Remaining: " + remaining +
                            ". Cached answers are still free.");
        }

        // ── Step 4: Call Groq AI ──────────────────────────────────────────────
        String textForAI = pdfExtractionService.truncateForAI(document.getExtractedText(), MAX_CHARS_FOR_AI);
        String answer = groqService.askQuestion(textForAI, question);

        // ── Step 5: Cache the answer + save to history ────────────────────────
        cacheService.saveAnswer(documentId, question, answer);
        chatHistoryService.saveMessage(document, user, question, answer, "AI");

        int remaining = rateLimitService.getRemainingRequests(user.getId());
        log.info("AI query completed for userId={}, remaining quota: {}", user.getId(), remaining);

        return new QuestionResponse(documentId, question, answer, "AI");
    }

    public List<DocumentListResponse> getAllDocuments(User user) {
        return documentRepository.findByUser(user).stream()
                .map(doc -> new DocumentListResponse(
                        doc.getId(), doc.getFileName(),
                        doc.getStatus(), doc.getCreatedAt().toString()))
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a single document owned by the given user.
     * Used by the controller when a client wants details for an
     * individual document (e.g. to display file metadata or link to
     * download).
     */
    public Document getDocument(Long documentId, User user) {
        return documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));
    }

    /**
     * Delete the document record and attempt to remove the underlying file.
     * Throws an exception if the document doesn't belong to the user.
     */
    public void deleteDocument(Long documentId, User user) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        // try removing the file from disk, but don't fail the operation if deletion
        // itself has an issue - just log a warning
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
            log.info("Deleted file for document {}: {}", documentId, document.getFilePath());
        } catch (IOException e) {
            log.warn("Unable to delete file {} for document {}", document.getFilePath(), documentId, e);
        }

        documentRepository.delete(document);
        log.info("Document {} deleted by user {}", documentId, user.getEmail());
    }
}