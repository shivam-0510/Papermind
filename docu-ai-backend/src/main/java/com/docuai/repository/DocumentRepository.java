package com.docuai.repository;

import com.docuai.entity.Document;
import com.docuai.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUser(User user);
    Optional<Document> findByIdAndUser(Long id, User user);
    List<Document> findByUserOrderByCreatedAtDesc(User user);
    long countByUser(User user);
    long countByStatus(String status);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = 'PROCESSED'")
    long countProcessed();

    @Query("SELECT COUNT(d) FROM Document d WHERE d.status = 'FAILED'")
    long countFailed();
}