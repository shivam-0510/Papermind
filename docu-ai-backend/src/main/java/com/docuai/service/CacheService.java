package com.docuai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final StringRedisTemplate redis;

    @Value("${cache.ttl:3600}")
    private long ttlSeconds;

    private String key(Long documentId, String question) {
        // Normalize: lowercase + strip whitespace
        String normalized = question.trim().toLowerCase().replaceAll("\\s+", " ");
        return "qa:" + documentId + ":" + normalized.hashCode();
    }

    public String getAnswer(Long documentId, String question) {
        try {
            return redis.opsForValue().get(key(documentId, question));
        } catch (Exception e) {
            log.warn("Redis GET failed: {}", e.getMessage());
            return null;
        }
    }

    public void saveAnswer(Long documentId, String question, String answer) {
        try {
            redis.opsForValue().set(key(documentId, question), answer, Duration.ofSeconds(ttlSeconds));
            log.debug("Cached answer for doc={}", documentId);
        } catch (Exception e) {
            log.warn("Redis SET failed: {}", e.getMessage());
        }
    }

    public void clearDocumentCache(Long documentId) {
        try {
            Set<String> keys = redis.keys("qa:" + documentId + ":*");
            if (keys != null && !keys.isEmpty()) {
                redis.delete(keys);
                log.info("Cleared {} cache entries for document {}", keys.size(), documentId);
            }
        } catch (Exception e) {
            log.warn("Redis cache clear failed: {}", e.getMessage());
        }
    }
}