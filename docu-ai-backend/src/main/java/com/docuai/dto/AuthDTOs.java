package com.docuai.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDTOs {

    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String role;
    }
}