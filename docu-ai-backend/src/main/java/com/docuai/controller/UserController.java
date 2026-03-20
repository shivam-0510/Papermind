package com.docuai.controller;

import com.docuai.entity.User;
import com.docuai.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileService userProfileService;
    private final ChatHistoryService chatHistoryService;
    private final ShareService shareService;
    private final RateLimitService rateLimitService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userProfileService.getProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(userProfileService.updateName(user, body.get("name")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        try {
            userProfileService.changePassword(user, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> allHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatHistoryService.getAllHistory(user));
    }

    @GetMapping("/shares")
    public ResponseEntity<List<Map<String, Object>>> myShares(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(shareService.getUserShares(user));
    }

    @GetMapping("/rate-limit")
    public ResponseEntity<Map<String, Object>> rateLimit(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "used", rateLimitService.getUsedRequests(user.getId()),
                "remaining", rateLimitService.getRemainingRequests(user.getId()),
                "limit", 20
        ));
    }
}