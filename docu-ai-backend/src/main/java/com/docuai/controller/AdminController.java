package com.docuai.controller;

import com.docuai.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> users() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/documents")
    public ResponseEntity<List<Map<String, Object>>> documents() {
        return ResponseEntity.ok(adminService.getAllDocuments());
    }
}