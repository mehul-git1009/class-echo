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
import com.classechobackend.dto.StudentProfileDTO;
import com.classechobackend.dto.UpdateStudentRequest;
import com.classechobackend.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /**
     * Get current student's profile (authenticated)
     * GET /api/students/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> getMyProfile(Authentication authentication) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        StudentProfileDTO profile = studentService.getStudentProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved", profile));
    }

    /**
     * Update current student's profile (authenticated)
     * PUT /api/students/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateStudentRequest request) {
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        StudentProfileDTO profile = studentService.updateStudentProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated", profile));
    }

    /**
     * Get all students (for teachers/admin)
     * GET /api/students
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentProfileDTO>>> getAllStudents() {
        List<StudentProfileDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", students));
    }

    /**
     * Get student by roll number (for teachers/admin)
     * GET /api/students/roll/{rollNo}
     */
    @GetMapping("/roll/{rollNo}")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> getStudentByRollNo(@PathVariable String rollNo) {
        StudentProfileDTO student = studentService.getStudentByRollNo(rollNo);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved", student));
    }

    /**
     * Get student by user ID (for teachers/admin)
     * GET /api/students/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> getStudentByUserId(@PathVariable UUID userId) {
        StudentProfileDTO student = studentService.getStudentProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved", student));
    }

    /**
     * Update student profile by user ID (for admin)
     * PUT /api/students/{userId}
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<StudentProfileDTO>> updateStudent(
            @PathVariable UUID userId,
            @RequestBody UpdateStudentRequest request) {
        StudentProfileDTO profile = studentService.updateStudentProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated", profile));
    }

    /**
     * Delete student profile (for admin)
     * DELETE /api/students/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteStudent(@PathVariable UUID userId) {
        studentService.deleteStudent(userId);
        return ResponseEntity.ok(ApiResponse.success("Student profile deleted"));
    }
}
