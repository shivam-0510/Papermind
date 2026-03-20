package com.docuai.repository;

import com.docuai.entity.ChatMessage;
import com.docuai.entity.Document;
import com.docuai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByDocumentAndUserOrderByCreatedAtAsc(Document document, User user);
    List<ChatMessage> findByUserOrderByCreatedAtDesc(User user);
    void deleteByDocument(Document document);
    long countByUser(User user);
    long count();
}