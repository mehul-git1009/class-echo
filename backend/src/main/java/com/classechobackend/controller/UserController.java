package com.classechobackend.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.classechobackend.dto.ApiResponse;
import com.classechobackend.model.User;
import com.classechobackend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Create a new user with role-specific profile
     * POST /api/users/register
     * For admin use to create users
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> registerUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String role = request.get("role");
        String rollNo = request.get("rollNo"); // Only for students

        User user = userService.createUserWithProfile(email, name, role, rollNo);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", user));
    }

    /**
     * Get current user info
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    /**
     * Update current user info
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateCurrentUser(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        String name = request.get("name");
        String avatarUrl = request.get("avatarUrl");

        User user = userService.updateUser(userId, name, avatarUrl);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    /**
     * Get user by ID (for admin)
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable UUID userId) {
        User user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    /**
     * Delete user (for admin)
     * DELETE /api/users/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }
}
