package com.classechobackend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.classechobackend.dto.ApiResponse;
import com.classechobackend.dto.TeacherProfileDTO;
import com.classechobackend.dto.UpdateTeacherRequest;
import com.classechobackend.service.TeacherService;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    /**
     * Get current teacher's profile (authenticated)
     * GET /api/teachers/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<TeacherProfileDTO>> getMyProfile(Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        TeacherProfileDTO profile = teacherService.getTeacherProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Teacher profile retrieved", profile));
    }

    /**
     * Update current teacher's profile (authenticated)
     * PUT /api/teachers/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<TeacherProfileDTO>> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateTeacherRequest request) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        TeacherProfileDTO profile = teacherService.updateTeacherProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Teacher profile updated", profile));
    }

    /**
     * Get all teachers (public or authenticated)
     * GET /api/teachers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TeacherProfileDTO>>> getAllTeachers() {
        List<TeacherProfileDTO> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(ApiResponse.success("Teachers retrieved", teachers));
    }

    /**
     * Get teachers by department
     * GET /api/teachers/department/{department}
     */
    @GetMapping("/department/{department}")
    public ResponseEntity<ApiResponse<List<TeacherProfileDTO>>> getTeachersByDepartment(
            @PathVariable String department) {
        List<TeacherProfileDTO> teachers = teacherService.getTeachersByDepartment(department);
        return ResponseEntity.ok(ApiResponse.success("Teachers retrieved", teachers));
    }

    /**
     * Get teacher by ID
     * GET /api/teachers/{teacherId}
     */
    @GetMapping("/{teacherId}")
    public ResponseEntity<ApiResponse<TeacherProfileDTO>> getTeacherById(@PathVariable UUID teacherId) {
        TeacherProfileDTO teacher = teacherService.getTeacherById(teacherId);
        return ResponseEntity.ok(ApiResponse.success("Teacher retrieved", teacher));
    }

    /**
     * Update teacher profile by user ID (for admin)
     * PUT /api/teachers/user/{userId}
     */
    @PutMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<TeacherProfileDTO>> updateTeacher(
            @PathVariable UUID userId,
            @RequestBody UpdateTeacherRequest request) {
        TeacherProfileDTO profile = teacherService.updateTeacherProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Teacher profile updated", profile));
    }

    /**
     * Delete teacher profile (for admin)
     * DELETE /api/teachers/user/{userId}
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteTeacher(@PathVariable UUID userId) {
        teacherService.deleteTeacher(userId);
        return ResponseEntity.ok(ApiResponse.success("Teacher profile deleted"));
    }
}
