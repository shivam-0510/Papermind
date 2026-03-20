package com.docuai.service;

import com.docuai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SharedDocumentRepository sharedDocumentRepository;

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDocuments", documentRepository.count());
        stats.put("processedDocuments", documentRepository.countProcessed());
        stats.put("failedDocuments", documentRepository.countFailed());
        stats.put("totalQuestions", chatMessageRepository.count());
        stats.put("totalShares", sharedDocumentRepository.count());
        return stats;
    }

    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getName());
                    m.put("email", u.getEmail());
                    m.put("role", u.getRole());
                    m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
                    m.put("documentCount", documentRepository.countByUser(u));
                    m.put("questionCount", chatMessageRepository.countByUser(u));
                    return m;
                })
                .toList();
    }

    public List<Map<String, Object>> getAllDocuments() {
        return documentRepository.findAll().stream()
                .map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", d.getId());
                    m.put("fileName", d.getFileName());
                    m.put("status", d.getStatus());
                    m.put("ownerEmail", d.getUser().getEmail());
                    m.put("ownerName", d.getUser().getName());
                    m.put("createdAt", d.getCreatedAt().toString());
                    return m;
                })
                .toList();
    }
}