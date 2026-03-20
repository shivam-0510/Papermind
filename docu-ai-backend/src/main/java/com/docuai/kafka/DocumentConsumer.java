package com.docuai.kafka;

import com.docuai.entity.Document;
import com.docuai.repository.DocumentRepository;
import com.docuai.service.PdfExtractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.listener.ConsumerSeekAware;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentConsumer implements ConsumerSeekAware {

    private final DocumentRepository documentRepository;
    private final PdfExtractionService pdfExtractionService;

    @Override
    public void onPartitionsAssigned(Map<TopicPartition, Long> assignments, ConsumerSeekCallback callback) {
        log.info("====== CONSUMER PARTITION ASSIGNED ======");
        assignments.forEach((tp, offset) ->
                log.info("Assigned: topic={}, partition={}, offset={}", tp.topic(), tp.partition(), offset));
        log.info("=========================================");
    }

    @KafkaListener(
            topics = "${kafka.topics.document-upload:document-upload}",
            groupId = "docuai-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void processDocument(ConsumerRecord<String, String> record, Acknowledgment ack) {
        log.info("====== KAFKA MESSAGE RECEIVED ======");
        log.info("Topic={}, Partition={}, Offset={}, Value={}",
                record.topic(), record.partition(), record.offset(), record.value());

        String documentIdStr = record.value();
        Long documentId;
        try {
            documentId = Long.parseLong(documentIdStr.trim());
        } catch (NumberFormatException e) {
            log.error("Invalid documentId received: {}", documentIdStr);
            ack.acknowledge(); // ack bad message so it doesn't block
            return;
        }

        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            log.error("Document not found in DB: id={}", documentId);
            ack.acknowledge();
            return;
        }

        log.info("Processing document: id={}, file={}", documentId, document.getFileName());

        try {
            document.setStatus("PROCESSING");
            documentRepository.save(document);

            byte[] fileBytes = Files.readAllBytes(Paths.get(document.getFilePath()));
            log.info("File read: {} bytes", fileBytes.length);

            String extractedText = pdfExtractionService.extractTextFromBytes(fileBytes, document.getFileName());
            log.info("Text extracted: {} characters", extractedText.length());

            if (extractedText.isBlank()) {
                throw new RuntimeException("No text extracted — PDF may be scanned/image-based");
            }

            document.setExtractedText(extractedText);
            document.setStatus("PROCESSED");
            documentRepository.save(document);

            log.info("Document PROCESSED successfully: id={}", documentId);
            ack.acknowledge(); // commit offset only on success

        } catch (Exception e) {
            log.error("Failed to process document id={}: {}", documentId, e.getMessage(), e);
            document.setStatus("FAILED");
            documentRepository.save(document);
            ack.acknowledge(); // ack even on failure to avoid infinite retry loop
        }
    }
}