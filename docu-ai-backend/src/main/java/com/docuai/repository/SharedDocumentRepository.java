package com.docuai.repository;

import com.docuai.entity.Document;
import com.docuai.entity.SharedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SharedDocumentRepository extends JpaRepository<SharedDocument, Long> {
    Optional<SharedDocument> findByShareToken(String shareToken);
    Optional<SharedDocument> findByDocument(Document document);
    List<SharedDocument> findByDocument_User_Id(Long userId);
    void deleteByDocument(Document document);
    boolean existsByDocument(Document document);
}