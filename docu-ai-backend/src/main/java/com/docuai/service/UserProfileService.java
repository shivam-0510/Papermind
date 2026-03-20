package com.docuai.service;

import com.docuai.entity.User;
import com.docuai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> getProfile(User user) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return profile;
    }

    public Map<String, Object> updateName(User user, String name) {
        user.setName(name);
        userRepository.save(user);
        return Map.of("name", user.getName(), "email", user.getEmail());
    }

    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}