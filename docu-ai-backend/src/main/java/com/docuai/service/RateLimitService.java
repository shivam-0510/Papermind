package com.docuai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-based hourly rate limiter.
 *
 * Key format : rate_limit:{userId}:{hourBucket}
 * Bucket     : epoch-millis / 3_600_000  (increments every hour)
 * TTL        : 1 hour — key auto-expires so counter resets each hour
 *
 * Two separate operations:
 *   isAllowed()          — checks current count WITHOUT incrementing (use for cache-hit path)
 *   consumeAndCheck()    — increments then checks (use for real AI calls only)
 *   getRemainingRequests() — read-only view for the Profile page
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.rate-limit.requests-per-hour:20}")
    private int requestsPerHour;

    private static final String PREFIX = "rate_limit:";

    /**
     * Check current usage WITHOUT incrementing.
     * Returns true if the user has quota remaining.
     * Used to pre-flight check before deciding to call Groq.
     */
    public boolean isAllowed(Long userId) {
        String key = PREFIX + userId + ":" + hourBucket();
        try {
            String val = redisTemplate.opsForValue().get(key);
            int used = val == null ? 0 : Integer.parseInt(val);
            return used < requestsPerHour;
        } catch (Exception e) {
            log.error("Rate limit check error for userId={}: {}", userId, e.getMessage());
            return true; // fail open — don't block on Redis outage
        }
    }

    /**
     * Increment counter AND check whether the request is allowed.
     * Call this ONLY when actually hitting the Groq API (not for cache hits).
     * Returns true if still within quota after incrementing.
     */
    public boolean consumeAndCheck(Long userId) {
        String key = PREFIX + userId + ":" + hourBucket();
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1) {
                // First request this hour — attach TTL so key auto-expires
                redisTemplate.expire(key, Duration.ofHours(1));
            }
            if (count == null || count > requestsPerHour) {
                log.warn("Rate limit exceeded for userId={} ({} used this hour)", userId, count);
                // Decrement back so we don't over-count rejected requests
                redisTemplate.opsForValue().decrement(key);
                return false;
            }
            log.debug("Rate limit: userId={} used {}/{} this hour", userId, count, requestsPerHour);
            return true;
        } catch (Exception e) {
            log.error("Rate limit consume error for userId={}: {}", userId, e.getMessage());
            return true; // fail open
        }
    }

    /**
     * Read-only: how many requests remain this hour.
     * Used by Profile API and error messages.
     */
    public int getRemainingRequests(Long userId) {
        String key = PREFIX + userId + ":" + hourBucket();
        try {
            String val = redisTemplate.opsForValue().get(key);
            int used = val == null ? 0 : Integer.parseInt(val);
            return Math.max(0, requestsPerHour - used);
        } catch (Exception e) {
            log.error("getRemainingRequests error for userId={}: {}", userId, e.getMessage());
            return requestsPerHour;
        }
    }

    /** How many used this hour (for response headers / debugging) */
    public int getUsedRequests(Long userId) {
        String key = PREFIX + userId + ":" + hourBucket();
        try {
            String val = redisTemplate.opsForValue().get(key);
            return val == null ? 0 : Integer.parseInt(val);
        } catch (Exception e) {
            return 0;
        }
    }

    private String hourBucket() {
        return String.valueOf(System.currentTimeMillis() / 3_600_000L);
    }
}