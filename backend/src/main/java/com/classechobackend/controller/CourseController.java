package com.classechobackend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.classechobackend.dto.CourseEnrollmentDTO;
import com.classechobackend.model.Course;
import com.classechobackend.model.CourseEnrollment;
import com.classechobackend.model.Student;
import com.classechobackend.model.Teacher;
import com.classechobackend.repository.StudentRepository;
import com.classechobackend.repository.TeacherRepository;
import com.classechobackend.service.CourseService;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    // Create a new course
    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        try {
            Course createdCourse = courseService.createCourse(course);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get all courses
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    // Get course by ID
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID id) {
        return courseService.getCourseById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Get course by code
    @GetMapping("/code/{code}")
    public ResponseEntity<Course> getCourseByCode(@PathVariable String code) {
        return courseService.getCourseByCode(code)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Get courses by teacher ID
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getCoursesByTeacherId(@PathVariable UUID teacherId) {
        List<Course> courses = courseService.getCoursesByTeacherId(teacherId);
        return ResponseEntity.ok(courses);
    }

    // Get teacher's own courses (from JWT token)
    @GetMapping("/teacher/me")
    public ResponseEntity<List<Course>> getMyTeacherCourses(@RequestAttribute("userId") UUID userId) {
        System.out.println("Getting courses for user ID: " + userId);
        
        // Get teacher by user ID
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Teacher not found for user ID: " + userId));
        
        System.out.println("Found teacher ID: " + teacher.getId());
        
        // Get courses by teacher ID
        List<Course> courses = courseService.getCoursesByTeacherId(teacher.getId());
        System.out.println("Found " + courses.size() + " courses for teacher");
        
        return ResponseEntity.ok(courses);
    }

    // Get courses by semester
    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<Course>> getCoursesBySemester(@PathVariable String semester) {
        List<Course> courses = courseService.getCoursesBySemester(semester);
        return ResponseEntity.ok(courses);
    }

    // Update course
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable UUID id, @RequestBody Course course) {
        try {
            Course updatedCourse = courseService.updateCourse(id, course);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Delete course
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable UUID id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Enroll student in course
    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<CourseEnrollment> enrollStudent(
        @PathVariable UUID courseId,
        @RequestParam UUID studentId,
        @RequestParam String section
    ) {
        try {
            CourseEnrollment enrollment = courseService.enrollStudent(studentId, courseId, section);
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get student's own courses (from JWT token)
    // MUST come before /student/{studentId} to avoid path variable conflict
    @GetMapping("/student/me")
    public ResponseEntity<List<CourseEnrollmentDTO>> getMyStudentCourses(@RequestAttribute("userId") UUID userId) {
        System.out.println("=== CourseController.getMyStudentCourses ===");
        System.out.println("User ID from JWT: " + userId);
        
        // Convert user ID to student ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found for user ID: " + userId));
        UUID studentId = student.getId();
        System.out.println("Found Student ID: " + studentId);
        
        List<CourseEnrollment> enrollments = courseService.getStudentEnrollments(studentId);
        System.out.println("Found " + enrollments.size() + " course enrollments");
        
        // Convert to DTOs
        List<CourseEnrollmentDTO> dtos = enrollments.stream()
            .map(enrollment -> {
                System.out.println("  - Course: " + enrollment.getCourse().getName() + " (ID: " + enrollment.getCourse().getId() + ")");
                System.out.println("    Section: " + enrollment.getSection());
                return CourseEnrollmentDTO.fromEntity(enrollment);
            })
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    // Get student's enrolled courses
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CourseEnrollment>> getStudentEnrollments(@PathVariable UUID studentId) {
        List<CourseEnrollment> enrollments = courseService.getStudentEnrollments(studentId);
        return ResponseEntity.ok(enrollments);
    }

    // Get course enrollments
    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<List<CourseEnrollmentDTO>> getCourseEnrollments(@PathVariable UUID courseId) {
        System.out.println("Getting enrollments for course ID: " + courseId);
        List<CourseEnrollment> enrollments = courseService.getCourseEnrollments(courseId);
        System.out.println("Found " + enrollments.size() + " enrollments");
        
        List<CourseEnrollmentDTO> dtos = enrollments.stream()
            .map(CourseEnrollmentDTO::fromEntity)
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    // Get enrollments by section
    @GetMapping("/{courseId}/enrollments/section/{section}")
    public ResponseEntity<List<CourseEnrollmentDTO>> getEnrollmentsBySection(
        @PathVariable UUID courseId,
        @PathVariable String section
    ) {
        List<CourseEnrollment> enrollments = courseService.getEnrollmentsBySection(courseId, section);
        List<CourseEnrollmentDTO> dtos = enrollments.stream()
            .map(CourseEnrollmentDTO::fromEntity)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get course statistics
    @GetMapping("/{courseId}/statistics")
    public ResponseEntity<CourseService.CourseStatistics> getCourseStatistics(@PathVariable UUID courseId) {
        CourseService.CourseStatistics stats = courseService.getCourseStatistics(courseId);
        return ResponseEntity.ok(stats);
    }

    // Update enrollment grade
    @PutMapping("/enrollments/{enrollmentId}/grade")
    public ResponseEntity<CourseEnrollment> updateEnrollmentGrade(
        @PathVariable UUID enrollmentId,
        @RequestParam String grade,
        @RequestParam Double percentage
    ) {
        try {
            CourseEnrollment enrollment = courseService.updateEnrollmentGrade(enrollmentId, grade, percentage);
            return ResponseEntity.ok(enrollment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}
