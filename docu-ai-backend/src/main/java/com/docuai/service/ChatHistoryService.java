package com.docuai.service;

import com.docuai.entity.*;
import com.docuai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository documentRepository;

    // ─── Write ────────────────────────────────────────────────────────────────

    public void saveMessage(Document document, User user, String question, String answer, String source) {
        chatMessageRepository.save(ChatMessage.builder()
                .document(document)
                .user(user)
                .question(question)
                .answer(answer)
                .source(source)
                .build());
    }

    // ─── Per-document history (AskAI page) ────────────────────────────────────

    @Transactional(readOnly = true)   // keeps session open so LAZY relations are safe to access
    public List<Map<String, Object>> getDocumentHistory(Long documentId, User user) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return chatMessageRepository
                .findByDocumentAndUserOrderByCreatedAtAsc(document, user)
                .stream()
                .map(msg -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", msg.getId());
                    m.put("documentId", msg.getDocument().getId());
                    m.put("documentName", msg.getDocument().getFileName());
                    m.put("question", msg.getQuestion());
                    m.put("answer", msg.getAnswer());
                    m.put("source", msg.getSource());
                    m.put("createdAt", msg.getCreatedAt().toString());
                    return m;
                })
                .toList();
    }

    // ─── All history across all documents (History page) ──────────────────────

    @Transactional(readOnly = true)   // keeps session open — required for LAZY document access
    public List<Map<String, Object>> getAllHistory(User user) {
        return chatMessageRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(msg -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", msg.getId());
                    m.put("documentId", msg.getDocument().getId());       // requires open session
                    m.put("documentName", msg.getDocument().getFileName()); // requires open session
                    m.put("question", msg.getQuestion());
                    m.put("answer", msg.getAnswer());
                    m.put("source", msg.getSource());
                    m.put("createdAt", msg.getCreatedAt().toString());
                    return m;
                })
                .toList();
    }

    // ─── Cascade delete ───────────────────────────────────────────────────────

    @Transactional
    public void deleteByDocument(Document document) {
        chatMessageRepository.deleteByDocument(document);
    }
}