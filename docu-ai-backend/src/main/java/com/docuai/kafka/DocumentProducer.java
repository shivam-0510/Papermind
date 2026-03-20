package com.docuai.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    /**
     * Fires a Kafka event when a document is uploaded.
     * The consumer will pick it up and process it asynchronously.
     * Message payload: document ID as string
     */
    public void sendDocumentUploadEvent(Long documentId) {
        log.info("Firing Kafka event for document id={}", documentId);
        kafkaTemplate.send("document-upload", documentId.toString());
    }
}