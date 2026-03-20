package com.docuai.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class PdfExtractionService {

    /**
     * Extracts plain text from PDF bytes.
     * Accepts byte[] directly to avoid MultipartFile stream being consumed twice.
     */
    public String extractTextFromBytes(byte[] fileBytes, String fileName) throws IOException {
        log.info("Extracting text from PDF: {}", fileName);

        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.info("Extracted {} characters from {}", text.length(), fileName);
            return text;

        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}", fileName, e);
            throw new IOException("Could not extract text from PDF: " + e.getMessage());
        }
    }

    /**
     * Truncates text to stay within Gemini token limits.
     * Rough estimate: 1 token ≈ 4 characters.
     */
    public String truncateForAI(String text, int maxChars) {
        if (text.length() <= maxChars) {
            return text;
        }
        log.warn("Text truncated from {} to {} characters for AI processing", text.length(), maxChars);
        return text.substring(0, maxChars) + "[... Document truncated for processing ...]";
    }
}