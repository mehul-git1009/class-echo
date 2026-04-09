package com.classechobackend.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.classechobackend.dto.GradeDTO;
import com.classechobackend.model.Grade;
import com.classechobackend.model.Student;
import com.classechobackend.repository.StudentRepository;
import com.classechobackend.service.GradeService;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*")
public class GradeController {

    @Autowired
    private GradeService gradeService;
    
    @Autowired
    private StudentRepository studentRepository;

    // Submit or update a grade
    @PostMapping("/submit")
    public ResponseEntity<Grade> submitGrade(
        @RequestParam UUID studentId,
        @RequestParam UUID courseId,
        @RequestParam Grade.AssessmentType assessmentType,
        @RequestParam String assessmentName,
        @RequestParam Double score,
        @RequestParam Double maxScore,
        @RequestParam(required = false) String feedback
    ) {
        try {
            System.out.println("=== GradeController.submitGrade ===");
            System.out.println("Student ID: " + studentId);
            System.out.println("Course ID: " + courseId);
            System.out.println("Assessment Type: " + assessmentType);
            System.out.println("Assessment Name: " + assessmentName);
            System.out.println("Score: " + score + " / " + maxScore);
            System.out.println("Feedback: " + feedback);
            
            Grade grade = gradeService.submitGrade(studentId, courseId, assessmentType, assessmentName, score, maxScore, feedback);
            System.out.println("Grade submitted successfully: " + grade.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(grade);
        } catch (Exception e) {
            System.err.println("ERROR submitting grade: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get student's own grades (from JWT token)
    // MUST come before /student/{studentId} to avoid path variable conflict
    @GetMapping("/student/me")
    public ResponseEntity<List<GradeDTO>> getMyGrades(@RequestAttribute("userId") UUID userId) {
        System.out.println("=== GradeController.getMyGrades ===");
        System.out.println("User ID from JWT: " + userId);
        
        // Convert user ID to student ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found for user ID: " + userId));
        UUID studentId = student.getId();
        System.out.println("Found Student ID: " + studentId);
        
        List<Grade> grades = gradeService.getStudentGrades(studentId);
        System.out.println("Found " + grades.size() + " grades");
        
        List<GradeDTO> gradeDTOs = grades.stream()
            .map(grade -> {
                System.out.println("  - Assessment: " + grade.getAssessmentName() + " (" + grade.getAssessmentType() + ")");
                System.out.println("    Course: " + grade.getCourse().getName());
                System.out.println("    Score: " + grade.getScore() + "/" + grade.getMaxScore() + " = " + grade.getLetterGrade());
                return GradeDTO.fromGrade(grade);
            })
            .collect(Collectors.toList());
        
        System.out.println("Returning " + gradeDTOs.size() + " grade DTOs");
        return ResponseEntity.ok(gradeDTOs);
    }

    // Get student's own grades for a specific course (from JWT token)
    // MUST come before /student/{studentId}/course/{courseId} to avoid path variable conflict
    @GetMapping("/student/me/course/{courseId}")
    public ResponseEntity<List<GradeDTO>> getMyCourseGrades(
        @RequestAttribute("userId") UUID userId,
        @PathVariable UUID courseId
    ) {
        // Convert user ID to student ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found for user ID: " + userId));
        UUID studentId = student.getId();
        
        List<Grade> grades = gradeService.getStudentCourseGrades(studentId, courseId);
        List<GradeDTO> gradeDTOs = grades.stream()
            .map(GradeDTO::fromGrade)
            .collect(Collectors.toList());
        return ResponseEntity.ok(gradeDTOs);
    }

    // Get all grades for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Grade>> getStudentGrades(@PathVariable UUID studentId) {
        List<Grade> grades = gradeService.getStudentGrades(studentId);
        return ResponseEntity.ok(grades);
    }

    // Get grades for a student in a specific course
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<Grade>> getStudentCourseGrades(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId
    ) {
        List<Grade> grades = gradeService.getStudentCourseGrades(studentId, courseId);
        return ResponseEntity.ok(grades);
    }

    // Get all grades for a course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Grade>> getCourseGrades(@PathVariable UUID courseId) {
        List<Grade> grades = gradeService.getCourseGrades(courseId);
        return ResponseEntity.ok(grades);
    }

    // Get grades by assessment type
    @GetMapping("/student/{studentId}/course/{courseId}/type/{assessmentType}")
    public ResponseEntity<List<Grade>> getGradesByAssessmentType(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId,
        @PathVariable Grade.AssessmentType assessmentType
    ) {
        List<Grade> grades = gradeService.getGradesByAssessmentType(studentId, courseId, assessmentType);
        return ResponseEntity.ok(grades);
    }

    // Calculate average grade for a student
    @GetMapping("/student/{studentId}/average")
    public ResponseEntity<Double> calculateStudentAverage(@PathVariable UUID studentId) {
        Double average = gradeService.calculateStudentAverage(studentId);
        return ResponseEntity.ok(average);
    }

    // Calculate average grade for a student in a course
    @GetMapping("/student/{studentId}/course/{courseId}/average")
    public ResponseEntity<Double> calculateStudentCourseAverage(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId
    ) {
        Double average = gradeService.calculateStudentCourseAverage(studentId, courseId);
        return ResponseEntity.ok(average);
    }

    // Calculate average grade for a course
    @GetMapping("/course/{courseId}/average")
    public ResponseEntity<Double> calculateCourseAverage(@PathVariable UUID courseId) {
        Double average = gradeService.calculateCourseAverage(courseId);
        return ResponseEntity.ok(average);
    }

    // Get grade distribution for a course
    @GetMapping("/course/{courseId}/distribution")
    public ResponseEntity<Map<String, Long>> getGradeDistribution(@PathVariable UUID courseId) {
        Map<String, Long> distribution = gradeService.getGradeDistribution(courseId);
        return ResponseEntity.ok(distribution);
    }

    // Get student's own GPA (from JWT token)
    // MUST come before /student/{studentId}/gpa to avoid path variable conflict
    @GetMapping("/student/me/gpa")
    public ResponseEntity<Double> getMyGPA(@RequestAttribute("userId") UUID userId) {
        System.out.println("=== GradeController.getMyGPA ===");
        System.out.println("User ID from JWT: " + userId);
        
        // Convert user ID to student ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found for user ID: " + userId));
        UUID studentId = student.getId();
        System.out.println("Found Student ID: " + studentId);
        
        Double gpa = gradeService.calculateGPA(studentId);
        System.out.println("Calculated GPA: " + gpa);
        return ResponseEntity.ok(gpa);
    }

    // Calculate GPA
    @GetMapping("/student/{studentId}/gpa")
    public ResponseEntity<Double> calculateGPA(@PathVariable UUID studentId) {
        Double gpa = gradeService.calculateGPA(studentId);
        return ResponseEntity.ok(gpa);
    }

    // Get performance breakdown by assessment type
    @GetMapping("/student/{studentId}/course/{courseId}/breakdown")
    public ResponseEntity<Map<String, Double>> getPerformanceBreakdown(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId
    ) {
        Map<String, Double> breakdown = gradeService.getPerformanceBreakdown(studentId, courseId);
        return ResponseEntity.ok(breakdown);
    }

    // Delete a grade
    @DeleteMapping("/{gradeId}")
    public ResponseEntity<Void> deleteGrade(@PathVariable UUID gradeId) {
        try {
            gradeService.deleteGrade(gradeId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
