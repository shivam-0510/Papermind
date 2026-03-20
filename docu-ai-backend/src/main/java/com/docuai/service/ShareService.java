package com.docuai.service;

import com.docuai.entity.*;
import com.docuai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShareService {

    private final SharedDocumentRepository sharedDocumentRepository;
    private final DocumentRepository documentRepository;

    @Transactional
    public Map<String, Object> shareDocument(Long documentId, User user) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!"PROCESSED".equals(document.getStatus())) {
            throw new RuntimeException("Only PROCESSED documents can be shared");
        }

        // Return existing share if already shared
        Optional<SharedDocument> existing = sharedDocumentRepository.findByDocument(document);
        if (existing.isPresent()) {
            String token = existing.get().getShareToken();
            return Map.of(
                    "shareToken", token,
                    "shareUrl", "/share/" + token,
                    "message", "Already shared"
            );
        }

        String token = UUID.randomUUID().toString();
        sharedDocumentRepository.save(SharedDocument.builder()
                .document(document)
                .shareToken(token)
                .build());

        log.info("Document {} shared by user {} with token {}", documentId, user.getEmail(), token);
        return Map.of(
                "shareToken", token,
                "shareUrl", "/share/" + token,
                "message", "Document shared successfully"
        );
    }

    @Transactional
    public void revokeShare(Long documentId, User user) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        sharedDocumentRepository.deleteByDocument(document);
        log.info("Share revoked for document {} by user {}", documentId, user.getEmail());
    }

    public Map<String, Object> getSharedDocument(String token) {
        SharedDocument shared = sharedDocumentRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Shared document not found or link expired"));
        Document doc = shared.getDocument();
        return Map.of(
                "id", doc.getId(),
                "fileName", doc.getFileName(),
                "status", doc.getStatus(),
                "sharedAt", shared.getCreatedAt().toString(),
                "sharedBy", doc.getUser().getName()
        );
    }

    public List<Map<String, Object>> getUserShares(User user) {
        return sharedDocumentRepository.findByDocument_User_Id(user.getId())
                .stream()
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("documentId", s.getDocument().getId());
                    m.put("fileName", s.getDocument().getFileName());
                    m.put("shareToken", s.getShareToken());
                    m.put("shareUrl", "/share/" + s.getShareToken());
                    m.put("sharedAt", s.getCreatedAt().toString());
                    return m;
                })
                .toList();
    }
}