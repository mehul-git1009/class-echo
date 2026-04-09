package com.classechobackend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classechobackend.model.Attendance;
import com.classechobackend.model.AttendanceSession;
import com.classechobackend.model.Course;
import com.classechobackend.model.Student;
import com.classechobackend.model.Teacher;
import com.classechobackend.repository.AttendanceRepository;
import com.classechobackend.repository.AttendanceSessionRepository;
import com.classechobackend.repository.CourseRepository;
import com.classechobackend.repository.TeacherRepository;

@Service
@Transactional
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    // Generate QR code for attendance (5-minute expiry)
    public AttendanceSession generateQRCode(UUID courseId, UUID teacherId, String section, LocalDate date) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // IMPORTANT: Deactivate any existing active sessions for this course/section/date
        // This ensures only ONE QR code is active at a time for a class
        List<AttendanceSession> existingSessions = sessionRepository
            .findByCourseIdAndDateAndSectionAndIsActiveTrue(courseId, date, section);
        
        if (!existingSessions.isEmpty()) {
            System.out.println("Found " + existingSessions.size() + " active session(s) for " 
                + course.getCode() + " section " + section + " on " + date);
            System.out.println("Deactivating old sessions to ensure only one QR is active...");
            
            for (AttendanceSession oldSession : existingSessions) {
                oldSession.setIsActive(false);
                sessionRepository.save(oldSession);
                System.out.println("Deactivated session: " + oldSession.getQrCode());
            }
        }

        // Generate unique QR code
        String qrCode = "ATT-" + courseId + "-" + System.currentTimeMillis();

        AttendanceSession session = new AttendanceSession();
        session.setCourse(course);
        session.setTeacher(teacher);
        session.setQrCode(qrCode);
        session.setSection(section);
        session.setDate(date);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(5)); // 5-minute expiry
        session.setIsActive(true);

        System.out.println("Created NEW active session: " + qrCode);
        return sessionRepository.save(session);
    }

    // Validate QR code
    public boolean validateQRCode(String qrCode) {
        Optional<AttendanceSession> session = sessionRepository.findByQrCodeAndIsActiveTrue(qrCode);
        
        if (session.isEmpty()) {
            return false;
        }

        AttendanceSession attendanceSession = session.get();
        
        // Check if expired
        if (attendanceSession.isExpired()) {
            attendanceSession.setIsActive(false);
            sessionRepository.save(attendanceSession);
            return false;
        }

        return true;
    }

    // Mark attendance via QR code
    public Attendance markAttendanceViaQR(UUID studentId, String qrCode) {
        // Validate QR code
        AttendanceSession session = sessionRepository.findByQrCodeAndIsActiveTrue(qrCode)
            .orElseThrow(() -> new RuntimeException("Invalid or expired QR code"));

        if (session.isExpired()) {
            session.setIsActive(false);
            sessionRepository.save(session);
            throw new RuntimeException("QR code has expired");
        }

        // Check if attendance already marked
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndCourseIdAndDateAndSection(
            studentId, session.getCourse().getId(), session.getDate(), session.getSection()
        );

        if (existing.isPresent()) {
            throw new RuntimeException("Attendance already marked for this session");
        }

        // Mark attendance
        Attendance attendance = new Attendance();
        Student student = new Student();
        student.setId(studentId);
        attendance.setStudent(student);
        attendance.setCourse(session.getCourse());
        attendance.setDate(session.getDate());
        attendance.setSection(session.getSection());
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        attendance.setMarkedBy(Attendance.AttendanceMethod.QR);
        attendance.setQrCode(qrCode);

        return attendanceRepository.save(attendance);
    }

    // Mark attendance manually
    public Attendance markAttendanceManually(UUID studentId, UUID courseId, LocalDate date, String section, Attendance.AttendanceStatus status) {
        // Check if attendance already marked
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndCourseIdAndDateAndSection(
            studentId, courseId, date, section
        );

        if (existing.isPresent()) {
            Attendance attendance = existing.get();
            attendance.setStatus(status);
            return attendanceRepository.save(attendance);
        }

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        Attendance attendance = new Attendance();
        Student student = new Student();
        student.setId(studentId);
        attendance.setStudent(student);
        attendance.setCourse(course);
        attendance.setDate(date);
        attendance.setSection(section);
        attendance.setStatus(status);
        attendance.setMarkedBy(Attendance.AttendanceMethod.MANUAL);

        return attendanceRepository.save(attendance);
    }

    // Get student's attendance records
    public List<Attendance> getStudentAttendance(UUID studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    // Get student's attendance for a specific course
    public List<Attendance> getStudentCourseAttendance(UUID studentId, UUID courseId) {
        return attendanceRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    // Get attendance for a course on a specific date
    public List<Attendance> getCourseAttendanceByDate(UUID courseId, LocalDate date, String section) {
        return attendanceRepository.findByCourseIdAndDateAndSection(courseId, date, section);
    }

    // Get student attendance statistics
    public AttendanceStatistics getStudentAttendanceStats(UUID studentId) {
        System.out.println("=== AttendanceService.getStudentAttendanceStats ===");
        System.out.println("Looking up attendance for student_id: " + studentId);
        
        // First, let's see all attendance records for this student
        List<Attendance> allAttendance = attendanceRepository.findByStudentId(studentId);
        System.out.println("Found " + allAttendance.size() + " attendance records");
        for (Attendance att : allAttendance) {
            System.out.println("  - Course: " + att.getCourse().getName() + ", Date: " + att.getDate() + ", Status: " + att.getStatus());
        }
        
        Long totalClasses = attendanceRepository.countTotalByStudentId(studentId);
        Long presentClasses = attendanceRepository.countPresentByStudentId(studentId);
        
        System.out.println("Count queries result:");
        System.out.println("  - Total classes: " + totalClasses);
        System.out.println("  - Present classes: " + presentClasses);

        AttendanceStatistics stats = new AttendanceStatistics();
        stats.setTotalClasses(totalClasses != null ? totalClasses : 0L);
        stats.setPresentClasses(presentClasses != null ? presentClasses : 0L);
        
        if (totalClasses != null && totalClasses > 0) {
            stats.setPercentage((double) presentClasses / totalClasses * 100);
        } else {
            stats.setPercentage(0.0);
        }

        return stats;
    }

    // Get student attendance statistics for a specific course
    public AttendanceStatistics getStudentCourseAttendanceStats(UUID studentId, UUID courseId) {
        Long totalClasses = attendanceRepository.countTotalByStudentIdAndCourseId(studentId, courseId);
        Long presentClasses = attendanceRepository.countPresentByStudentIdAndCourseId(studentId, courseId);

        AttendanceStatistics stats = new AttendanceStatistics();
        stats.setTotalClasses(totalClasses != null ? totalClasses : 0L);
        stats.setPresentClasses(presentClasses != null ? presentClasses : 0L);
        
        if (totalClasses != null && totalClasses > 0) {
            stats.setPercentage((double) presentClasses / totalClasses * 100);
        } else {
            stats.setPercentage(0.0);
        }

        return stats;
    }

    // Get student's course-wise attendance statistics
    public List<CourseAttendanceStatistics> getStudentCourseWiseAttendance(UUID studentId) {
        System.out.println("=== AttendanceService.getStudentCourseWiseAttendance ===");
        System.out.println("Student ID: " + studentId);
        
        // Get all attendance records for this student
        List<Attendance> allAttendance = attendanceRepository.findByStudentId(studentId);
        System.out.println("Total attendance records: " + allAttendance.size());
        
        // Group by course and calculate stats
        Map<Course, List<Attendance>> attendanceByCourse = allAttendance.stream()
            .collect(Collectors.groupingBy(Attendance::getCourse));
        
        System.out.println("Number of courses: " + attendanceByCourse.size());
        
        List<CourseAttendanceStatistics> courseStatsList = new ArrayList<>();
        
        for (Map.Entry<Course, List<Attendance>> entry : attendanceByCourse.entrySet()) {
            Course course = entry.getKey();
            List<Attendance> courseAttendance = entry.getValue();
            
            long totalClasses = courseAttendance.size();
            long presentClasses = courseAttendance.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                .count();
            
            double percentage = totalClasses > 0 ? (double) presentClasses / totalClasses * 100 : 0.0;
            
            CourseAttendanceStatistics stats = new CourseAttendanceStatistics();
            stats.setCourseId(course.getId());
            stats.setCourseCode(course.getCode());
            stats.setCourseName(course.getName());
            stats.setTotalClasses(totalClasses);
            stats.setPresentClasses(presentClasses);
            stats.setPercentage(percentage);
            
            // Get recent 10 attendance records sorted by date descending
            List<RecentAttendanceRecord> recentRecords = courseAttendance.stream()
                .sorted(Comparator.comparing(Attendance::getDate).reversed())
                .limit(10)
                .map(a -> {
                    RecentAttendanceRecord record = new RecentAttendanceRecord();
                    record.setDate(a.getDate());
                    record.setStatus(a.getStatus().name());
                    return record;
                })
                .collect(Collectors.toList());
            
            stats.setRecentAttendance(recentRecords);
            
            courseStatsList.add(stats);
            
            System.out.println("  - " + course.getCode() + " (" + course.getName() + "): " 
                + presentClasses + "/" + totalClasses + " = " + String.format("%.1f", percentage) + "%");
        }
        
        return courseStatsList;
    }

    // Get attendance statistics for a course session
    public AttendanceStatistics getCourseSessionStats(UUID courseId, LocalDate date, String section) {
        List<Attendance> attendanceList = attendanceRepository.findByCourseIdAndDateAndSection(courseId, date, section);
        Long presentCount = attendanceRepository.countPresentByCourseIdAndDateAndSection(courseId, date, section);

        AttendanceStatistics stats = new AttendanceStatistics();
        stats.setTotalClasses((long) attendanceList.size());
        stats.setPresentClasses(presentCount != null ? presentCount : 0L);
        
        if (!attendanceList.isEmpty()) {
            stats.setPercentage((double) presentCount / attendanceList.size() * 100);
        } else {
            stats.setPercentage(0.0);
        }

        return stats;
    }

    // Deactivate expired QR sessions (scheduled task - runs every minute)
    @Scheduled(fixedRate = 60000)
    public void deactivateExpiredSessions() {
        List<AttendanceSession> expiredSessions = sessionRepository.findByExpiresAtBefore(LocalDateTime.now());
        
        for (AttendanceSession session : expiredSessions) {
            if (session.getIsActive()) {
                session.setIsActive(false);
                sessionRepository.save(session);
            }
        }
    }

    // Get active sessions for a teacher
    public List<AttendanceSession> getTeacherActiveSessions(UUID teacherId) {
        return sessionRepository.findByTeacherId(teacherId);
    }

    // Get active session for a specific course, date, and section
    public AttendanceSession getActiveCourseSession(UUID courseId, LocalDate date, String section) {
        // Find active session for this course, date, and section
        List<AttendanceSession> sessions = sessionRepository.findByCourseIdAndDateAndSectionAndIsActiveTrue(
            courseId, date, section
        );
        
        if (!sessions.isEmpty()) {
            // Return the first active session (should only be one due to business logic)
            AttendanceSession session = sessions.get(0);
            
            // Double-check if it's actually still valid (not expired)
            if (session.getExpiresAt().isAfter(LocalDateTime.now())) {
                return session;
            } else {
                // Mark as inactive if expired
                session.setIsActive(false);
                sessionRepository.save(session);
            }
        }
        
        return null;
    }

    // Close/Invalidate an attendance session
    public void closeAttendanceSession(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Attendance session not found"));
        
        session.setIsActive(false);
        sessionRepository.save(session);
    }

    // Inner class for attendance statistics
    public static class AttendanceStatistics {
        private Long totalClasses;
        private Long presentClasses;
        private Double percentage;

        public Long getTotalClasses() { return totalClasses; }
        public void setTotalClasses(Long totalClasses) { this.totalClasses = totalClasses; }

        public Long getPresentClasses() { return presentClasses; }
        public void setPresentClasses(Long presentClasses) { this.presentClasses = presentClasses; }

        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }

    // Inner class for course-wise attendance statistics
    public static class CourseAttendanceStatistics {
        private UUID courseId;
        private String courseCode;
        private String courseName;
        private Long totalClasses;
        private Long presentClasses;
        private Double percentage;
        private List<RecentAttendanceRecord> recentAttendance;

        public UUID getCourseId() { return courseId; }
        public void setCourseId(UUID courseId) { this.courseId = courseId; }

        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }

        public Long getTotalClasses() { return totalClasses; }
        public void setTotalClasses(Long totalClasses) { this.totalClasses = totalClasses; }

        public Long getPresentClasses() { return presentClasses; }
        public void setPresentClasses(Long presentClasses) { this.presentClasses = presentClasses; }

        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }

        public List<RecentAttendanceRecord> getRecentAttendance() { return recentAttendance; }
        public void setRecentAttendance(List<RecentAttendanceRecord> recentAttendance) { this.recentAttendance = recentAttendance; }
    }

    // Inner class for recent attendance records
    public static class RecentAttendanceRecord {
        private LocalDate date;
        private String status;

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
