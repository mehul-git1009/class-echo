package com.classechobackend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.classechobackend.dto.ApiResponse;
import com.classechobackend.dto.AuthRequest;
import com.classechobackend.dto.AuthResponse;
import com.classechobackend.model.User;
import com.classechobackend.repository.UserRepository;
import com.classechobackend.service.AuthenticationService;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public Mono<ResponseEntity<ApiResponse<AuthResponse>>> login(@RequestBody AuthRequest request) {
        return authenticationService.authenticateWithSupabase(request.getSupabaseToken())
                .map(authResponse -> ResponseEntity.ok(
                        ApiResponse.success("Authentication successful", authResponse)));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<String>> validate(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        boolean isValid = authenticationService.validateAccessToken(token);

        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("Token is valid"));
        } else {
            return ResponseEntity.ok(ApiResponse.error("Token is invalid or expired"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        // Fetch user from database
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build user response
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId().toString());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getName());
        userMap.put("role", user.getRole());

        return ResponseEntity.ok(ApiResponse.success("User authenticated", userMap));
    }
}
