package com.classechobackend.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.classechobackend.dto.AuthResponse;
import com.classechobackend.exception.BadRequestException;
import com.classechobackend.model.Student;
import com.classechobackend.model.Teacher;
import com.classechobackend.model.User;
import com.classechobackend.repository.StudentRepository;
import com.classechobackend.repository.TeacherRepository;
import com.classechobackend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;

import reactor.core.publisher.Mono;

@Service
public class AuthenticationService {

    @Autowired
    private SupabaseAuthService supabaseAuthService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    /**
     * Verify Supabase token and generate our own JWT tokens
     * @param supabaseToken The Supabase access token
     * @return AuthResponse with access and refresh tokens
     */
    public Mono<AuthResponse> authenticateWithSupabase(String supabaseToken) {
        return supabaseAuthService.getUser(supabaseToken)
                .map(userNode -> {
                    // Extract user information from Supabase response
                    String supabaseUserId = userNode.get("id").asText();
                    String email = userNode.get("email").asText();
                    String name = extractName(userNode);
                    String role = extractRole(userNode);

                    // Create or get user from our database
                    User user = userRepository.findByEmail(email)
                            .orElseGet(() -> {
                                User newUser = new User(email, name, role);
                                newUser = userRepository.save(newUser);
                                
                                // Create role-specific profile
                                if ("student".equalsIgnoreCase(role)) {
                                    String rollNo = extractRollNo(userNode);
                                    if (rollNo != null && !rollNo.isEmpty()) {
                                        Student student = new Student(newUser, rollNo);
                                        student.setGpa(BigDecimal.ZERO);
                                        studentRepository.save(student);
                                    }
                                } else if ("teacher".equalsIgnoreCase(role)) {
                                    Teacher teacher = new Teacher(newUser);
                                    teacherRepository.save(teacher);
                                }
                                
                                return newUser;
                            });

                    // Generate our own JWT tokens using our database user ID
                    String accessToken = jwtService.generateAccessToken(
                            user.getId().toString(), 
                            user.getEmail(), 
                            user.getRole()
                    );
                    String refreshToken = jwtService.generateRefreshToken(
                            user.getId().toString(), 
                            user.getEmail()
                    );

                    // Build response
                    AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                            user.getId().toString(), 
                            user.getEmail(),
                            user.getName(),
                            user.getRole()
                    );
                    return new AuthResponse(
                            accessToken,
                            refreshToken,
                            jwtService.getAccessTokenExpiration() / 1000, // Convert to seconds
                            userInfo
                    );
                })
                .onErrorMap(e -> new BadRequestException("Invalid Supabase token: " + e.getMessage()));
    }

    /**
     * Refresh access token using refresh token
     * @param refreshToken The refresh token
     * @return AuthResponse with new access token
     */
    public Mono<AuthResponse> refreshAccessToken(String refreshToken) {
        return Mono.fromCallable(() -> {
            if (!jwtService.validateToken(refreshToken)) {
                throw new BadRequestException("Invalid or expired refresh token");
            }

            String tokenType = jwtService.extractTokenType(refreshToken);
            if (!"refresh".equals(tokenType)) {
                throw new BadRequestException("Token is not a refresh token");
            }

            // Extract user info from refresh token
            String userId = jwtService.extractUserId(refreshToken);
            String email = jwtService.extractEmail(refreshToken);

            // Get user from database to get the latest info
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new BadRequestException("User not found"));

            // Generate new access token
            String newAccessToken = jwtService.generateAccessToken(
                    user.getId().toString(), 
                    user.getEmail(), 
                    user.getRole()
            );

            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getId().toString(), 
                    user.getEmail(),
                    user.getName(),
                    user.getRole()
            );
            return new AuthResponse(
                    newAccessToken,
                    refreshToken, // Return same refresh token
                    jwtService.getAccessTokenExpiration() / 1000,
                    userInfo
            );
        });
    }

    /**
     * Validate access token
     * @param accessToken The access token to validate
     * @return true if valid, false otherwise
     */
    public boolean validateAccessToken(String accessToken) {
        if (!jwtService.validateToken(accessToken)) {
            return false;
        }
        String tokenType = jwtService.extractTokenType(accessToken);
        return "access".equals(tokenType);
    }

    /**
     * Extract name from Supabase user response
     */
    private String extractName(JsonNode userNode) {
        JsonNode userMetadata = userNode.get("user_metadata");
        if (userMetadata != null && userMetadata.has("name")) {
            return userMetadata.get("name").asText();
        }
        if (userMetadata != null && userMetadata.has("full_name")) {
            return userMetadata.get("full_name").asText();
        }
        // Default to email username
        String email = userNode.get("email").asText();
        return email.split("@")[0];
    }

    /**
     * Extract role from Supabase user response
     */
    private String extractRole(JsonNode userNode) {
        // Try to extract role from user_metadata or app_metadata
        JsonNode userMetadata = userNode.get("user_metadata");
        if (userMetadata != null && userMetadata.has("role")) {
            return userMetadata.get("role").asText();
        }

        JsonNode appMetadata = userNode.get("app_metadata");
        if (appMetadata != null && appMetadata.has("role")) {
            return appMetadata.get("role").asText();
        }

        // Default role
        return "student";
    }

    /**
     * Extract roll number from Supabase user response (for students)
     */
    private String extractRollNo(JsonNode userNode) {
        JsonNode userMetadata = userNode.get("user_metadata");
        if (userMetadata != null && userMetadata.has("roll_no")) {
            return userMetadata.get("roll_no").asText();
        }
        if (userMetadata != null && userMetadata.has("rollNo")) {
            return userMetadata.get("rollNo").asText();
        }
        // Generate a default roll number if not provided
        return "ROLL" + System.currentTimeMillis();
    }
}
