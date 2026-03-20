package com.docuai.controller;

import com.docuai.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicShareController {

    private final ShareService shareService;

    @GetMapping("/share/{token}")
    public ResponseEntity<?> viewShared(@PathVariable String token) {
        try {
            return ResponseEntity.ok(shareService.getSharedDocument(token));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}