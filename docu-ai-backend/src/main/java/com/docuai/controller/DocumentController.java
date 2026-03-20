package com.docuai.controller;

import com.docuai.dto.DocumentDTOs.*;
import com.docuai.entity.User;
import com.docuai.service.ChatHistoryService;
import com.docuai.service.DocumentService;
import com.docuai.service.ShareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;
    private final ChatHistoryService chatHistoryService;
    private final ShareService shareService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(documentService.uploadDocument(file, user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "File upload failed"));
        }
    }

    @PostMapping("/ask")
    public ResponseEntity<QuestionResponse> ask(
            @Valid @RequestBody QuestionRequest request,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(
                    documentService.askQuestion(request.getDocumentId(), request.getQuestion(), user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new QuestionResponse(request.getDocumentId(), request.getQuestion(),
                            e.getMessage(), "ERROR"));
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentListResponse>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentService.getAllDocuments(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(documentService.getDocument(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            documentService.deleteDocument(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<Map<String, Object>>> getDocHistory(
            @PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(chatHistoryService.getDocumentHistory(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> share(
            @PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(shareService.shareDocument(id, user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/share")
    public ResponseEntity<Void> revokeShare(
            @PathVariable Long id, @AuthenticationPrincipal User user) {
        try {
            shareService.revokeShare(id, user);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}