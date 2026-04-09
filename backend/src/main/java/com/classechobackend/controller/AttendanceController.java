package com.classechobackend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.classechobackend.dto.AttendanceDTO;
import com.classechobackend.model.Attendance;
import com.classechobackend.model.AttendanceSession;
import com.classechobackend.model.Student;
import com.classechobackend.model.Teacher;
import com.classechobackend.repository.StudentRepository;
import com.classechobackend.repository.TeacherRepository;
import com.classechobackend.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    // Generate QR code for attendance
    @PostMapping("/qr/generate")
    public ResponseEntity<AttendanceSession> generateQRCode(
        @RequestParam UUID courseId,
        @RequestParam UUID teacherId,
        @RequestParam String section,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        try {
            System.out.println("=== AttendanceController.generateQRCode ===");
            System.out.println("Course ID: " + courseId);
            System.out.println("User/Teacher ID received: " + teacherId);
            System.out.println("Section: " + section);
            System.out.println("Date: " + date);
            
            // Convert user ID to teacher ID (the teacherId parameter might be a user ID)
            Teacher teacher = teacherRepository.findByUserId(teacherId)
                .orElseGet(() -> {
                    // If not found by user ID, try to find by teacher ID directly
                    return teacherRepository.findById(teacherId)
                        .orElseThrow(() -> new RuntimeException("Teacher not found for ID: " + teacherId));
                });
            
            System.out.println("Found Teacher ID: " + teacher.getId());
            
            AttendanceSession session = attendanceService.generateQRCode(courseId, teacher.getId(), section, date);
            
            System.out.println("QR Code generated successfully: " + session.getQrCode());
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (Exception e) {
            System.err.println("ERROR generating QR code: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Validate QR code
    @GetMapping("/qr/validate/{qrCode}")
    public ResponseEntity<Boolean> validateQRCode(@PathVariable String qrCode) {
        boolean isValid = attendanceService.validateQRCode(qrCode);
        return ResponseEntity.ok(isValid);
    }

    // Mark attendance via QR code
    @PostMapping("/qr/mark")
    public ResponseEntity<Attendance> markAttendanceViaQR(
        @RequestParam UUID studentId,
        @RequestParam String qrCode
    ) {
        try {
            System.out.println("=== AttendanceController.markAttendanceViaQR ===");
            System.out.println("User/Student ID received: " + studentId);
            System.out.println("QR Code: " + qrCode);
            
            // Convert user ID to student ID (the studentId parameter might be a user ID)
            Student student = studentRepository.findByUserId(studentId)
                .orElseGet(() -> {
                    // If not found by user ID, try to find by student ID directly
                    return studentRepository.findById(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found for ID: " + studentId));
                });
            
            System.out.println("Found Student ID: " + student.getId());
            
            Attendance attendance = attendanceService.markAttendanceViaQR(student.getId(), qrCode);
            System.out.println("Attendance marked successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(attendance);
        } catch (Exception e) {
            System.err.println("ERROR marking attendance via QR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Mark attendance manually
    @PostMapping("/mark")
    public ResponseEntity<Attendance> markAttendanceManually(
        @RequestParam UUID studentId,
        @RequestParam UUID courseId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam String section,
        @RequestParam Attendance.AttendanceStatus status
    ) {
        try {
            System.out.println("=== AttendanceController.markAttendanceManually ===");
            System.out.println("Student ID received: " + studentId);
            System.out.println("Course ID: " + courseId);
            System.out.println("Date: " + date);
            System.out.println("Section: " + section);
            System.out.println("Status: " + status);
            
            // Convert user ID to student ID if needed (the studentId parameter might be a user ID)
            Student student = studentRepository.findByUserId(studentId)
                .orElseGet(() -> {
                    // If not found by user ID, try to find by student ID directly
                    return studentRepository.findById(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found for ID: " + studentId));
                });
            
            System.out.println("Found Student ID: " + student.getId());
            
            Attendance attendance = attendanceService.markAttendanceManually(student.getId(), courseId, date, section, status);
            System.out.println("Manual attendance marked successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(attendance);
        } catch (Exception e) {
            System.err.println("ERROR marking manual attendance: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get student's own attendance (from JWT token)
    // MUST come before /student/{studentId} to avoid path variable conflict
    @GetMapping("/student/me")
    public ResponseEntity<List<Attendance>> getMyAttendance(@RequestAttribute("userId") UUID studentId) {
        List<Attendance> attendance = attendanceService.getStudentAttendance(studentId);
        return ResponseEntity.ok(attendance);
    }

    // Get student's attendance records
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable UUID studentId) {
        List<Attendance> attendance = attendanceService.getStudentAttendance(studentId);
        return ResponseEntity.ok(attendance);
    }

    // Get student's attendance for a specific course
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<Attendance>> getStudentCourseAttendance(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId
    ) {
        List<Attendance> attendance = attendanceService.getStudentCourseAttendance(studentId, courseId);
        return ResponseEntity.ok(attendance);
    }

    // Get attendance for a course on a specific date
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceDTO>> getCourseAttendanceByDate(
        @PathVariable UUID courseId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam String section
    ) {
        System.out.println("=== AttendanceController.getCourseAttendanceByDate ===");
        System.out.println("Course ID: " + courseId + ", Date: " + date + ", Section: " + section);
        
        List<Attendance> attendance = attendanceService.getCourseAttendanceByDate(courseId, date, section);
        System.out.println("Found " + attendance.size() + " attendance records");
        
        // Convert to DTOs to include student information
        List<AttendanceDTO> attendanceDTOs = attendance.stream()
            .map(AttendanceDTO::fromEntity)
            .collect(Collectors.toList());
        
        // Log student IDs for debugging
        attendanceDTOs.forEach(dto -> {
            if (dto.getStudent() != null) {
                System.out.println("  - Student ID: " + dto.getStudent().getId() 
                    + ", Name: " + dto.getStudent().getName() 
                    + ", Roll: " + dto.getStudent().getRollNo() 
                    + ", Status: " + dto.getStatus());
            }
        });
        
        return ResponseEntity.ok(attendanceDTOs);
    }

    // Get student's own attendance statistics (from JWT token)
    // MUST come before /student/{studentId}/stats to avoid path variable conflict
    @GetMapping("/student/me/stats")
    public ResponseEntity<AttendanceService.AttendanceStatistics> getMyAttendanceStats(@RequestAttribute("userId") UUID userId) {
        System.out.println("=== AttendanceController.getMyAttendanceStats ===");
        System.out.println("User ID from JWT: " + userId);
        
        // Convert user ID to student ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found for user ID: " + userId));
        UUID studentId = student.getId();
        System.out.println("Found Student ID: " + studentId);
        
        AttendanceService.AttendanceStatistics stats = attendanceService.getStudentAttendanceStats(studentId);
        System.out.println("Attendance Stats:");
        System.out.println("  Total Classes: " + stats.getTotalClasses());
        System.out.println("  Present Classes: " + stats.getPresentClasses());
        System.out.println("  Percentage: " + stats.getPercentage() + "%");
        return ResponseEntity.ok(stats);
    }

    // Get student's own course-wise attendance statistics (from JWT token)
    @GetMapping("/student/me/courses")
    public ResponseEntity<List<AttendanceService.CourseAttendanceStatistics>> getMyCourseWiseAttendance(@RequestAttribute("userId") UUID userId) {
        System.out.println("=== AttendanceController.getMyCourseWiseAttendance ===");
        System.out.println("User ID from JWT: " + userId);
        
        // Convert user ID to student ID
        Student student = studentRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found for user ID: " + userId));
        UUID studentId = student.getId();
        System.out.println("Found Student ID: " + studentId);
        
        List<AttendanceService.CourseAttendanceStatistics> courseStats = attendanceService.getStudentCourseWiseAttendance(studentId);
        System.out.println("Found " + courseStats.size() + " courses with attendance data");
        return ResponseEntity.ok(courseStats);
    }

    // Get student attendance statistics
    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<AttendanceService.AttendanceStatistics> getStudentAttendanceStats(@PathVariable UUID studentId) {
        AttendanceService.AttendanceStatistics stats = attendanceService.getStudentAttendanceStats(studentId);
        return ResponseEntity.ok(stats);
    }

    // Get student attendance statistics for a specific course
    @GetMapping("/student/{studentId}/course/{courseId}/stats")
    public ResponseEntity<AttendanceService.AttendanceStatistics> getStudentCourseAttendanceStats(
        @PathVariable UUID studentId,
        @PathVariable UUID courseId
    ) {
        AttendanceService.AttendanceStatistics stats = attendanceService.getStudentCourseAttendanceStats(studentId, courseId);
        return ResponseEntity.ok(stats);
    }

    // Get attendance statistics for a course session
    @GetMapping("/course/{courseId}/session/stats")
    public ResponseEntity<AttendanceService.AttendanceStatistics> getCourseSessionStats(
        @PathVariable UUID courseId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam String section
    ) {
        AttendanceService.AttendanceStatistics stats = attendanceService.getCourseSessionStats(courseId, date, section);
        return ResponseEntity.ok(stats);
    }

    // Get teacher's active sessions
    @GetMapping("/teacher/{teacherId}/sessions")
    public ResponseEntity<List<AttendanceSession>> getTeacherActiveSessions(@PathVariable UUID teacherId) {
        List<AttendanceSession> sessions = attendanceService.getTeacherActiveSessions(teacherId);
        return ResponseEntity.ok(sessions);
    }

    // Get teacher's own active sessions (from JWT token)
    @GetMapping("/teacher/me/sessions")
    public ResponseEntity<List<AttendanceSession>> getMyActiveSessions(@RequestAttribute("userId") UUID userId) {
        System.out.println("Getting attendance sessions for user ID: " + userId);
        
        // Get teacher by user ID
        Teacher teacher = teacherRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Teacher not found for user ID: " + userId));
        
        System.out.println("Found teacher ID: " + teacher.getId());
        
        List<AttendanceSession> sessions = attendanceService.getTeacherActiveSessions(teacher.getId());
        System.out.println("Found " + sessions.size() + " active sessions");
        
        return ResponseEntity.ok(sessions);
    }

    // Get active session for a specific course, date, and section
    @GetMapping("/course/{courseId}/active-session")
    public ResponseEntity<AttendanceSession> getActiveCourseSession(
        @PathVariable UUID courseId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam String section
    ) {
        System.out.println("=== AttendanceController.getActiveCourseSession ===");
        System.out.println("Course ID: " + courseId + ", Date: " + date + ", Section: " + section);
        
        AttendanceSession session = attendanceService.getActiveCourseSession(courseId, date, section);
        
        if (session != null) {
            System.out.println("Found active session: " + session.getQrCode());
            return ResponseEntity.ok(session);
        } else {
            System.out.println("No active session found");
            return ResponseEntity.ok(null);
        }
    }

    // Close/Invalidate an attendance session
    @PostMapping("/session/{sessionId}/close")
    public ResponseEntity<Void> closeAttendanceSession(@PathVariable UUID sessionId) {
        System.out.println("=== AttendanceController.closeAttendanceSession ===");
        System.out.println("Session ID: " + sessionId);
        
        try {
            attendanceService.closeAttendanceSession(sessionId);
            System.out.println("Session closed successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("ERROR closing session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
