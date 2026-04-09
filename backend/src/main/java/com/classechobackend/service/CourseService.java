package com.classechobackend.service;

import com.classechobackend.model.Course;
import com.classechobackend.model.CourseEnrollment;
import com.classechobackend.model.Student;
import com.classechobackend.repository.CourseEnrollmentRepository;
import com.classechobackend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    // Create a new course
    public Course createCourse(Course course) {
        // Check if course code already exists
        if (courseRepository.existsByCode(course.getCode())) {
            throw new RuntimeException("Course with code " + course.getCode() + " already exists");
        }
        return courseRepository.save(course);
    }

    // Get course by ID
    public Optional<Course> getCourseById(UUID courseId) {
        return courseRepository.findById(courseId);
    }

    // Get course by code
    public Optional<Course> getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    // Get all courses
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Get courses by teacher ID
    public List<Course> getCoursesByTeacherId(UUID teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    // Get courses by semester
    public List<Course> getCoursesBySemester(String semester) {
        return courseRepository.findBySemester(semester);
    }

    // Update course
    public Course updateCourse(UUID courseId, Course updatedCourse) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        course.setName(updatedCourse.getName());
        course.setCredits(updatedCourse.getCredits());
        course.setSemester(updatedCourse.getSemester());
        course.setDescription(updatedCourse.getDescription());

        return courseRepository.save(course);
    }

    // Delete course
    public void deleteCourse(UUID courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found with id: " + courseId);
        }
        courseRepository.deleteById(courseId);
    }

    // Enroll student in course
    public CourseEnrollment enrollStudent(UUID studentId, UUID courseId, String section) {
        // Check if already enrolled
        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setStudent(new Student());
        enrollment.getStudent().setId(studentId);
        enrollment.setCourse(course);
        enrollment.setSection(section);

        return enrollmentRepository.save(enrollment);
    }

    // Get student's enrolled courses
    public List<CourseEnrollment> getStudentEnrollments(UUID studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    // Get course enrollments
    public List<CourseEnrollment> getCourseEnrollments(UUID courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    // Get enrollments by section
    public List<CourseEnrollment> getEnrollmentsBySection(UUID courseId, String section) {
        return enrollmentRepository.findByCourseIdAndSection(courseId, section);
    }

    // Get course statistics
    public CourseStatistics getCourseStatistics(UUID courseId) {
        Long totalStudents = enrollmentRepository.countByCourseId(courseId);
        Double averagePercentage = enrollmentRepository.getAveragePercentageByCourseId(courseId);

        CourseStatistics stats = new CourseStatistics();
        stats.setTotalStudents(totalStudents != null ? totalStudents : 0L);
        stats.setAverageGrade(averagePercentage != null ? averagePercentage : 0.0);

        return stats;
    }

    // Update enrollment grade
    public CourseEnrollment updateEnrollmentGrade(UUID enrollmentId, String grade, Double percentage) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setGrade(grade);
        enrollment.setPercentage(percentage);

        return enrollmentRepository.save(enrollment);
    }

    // Update enrollment attendance
    public CourseEnrollment updateEnrollmentAttendance(UUID studentId, UUID courseId, int attendedClasses, int totalClasses) {
        CourseEnrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setAttendedClasses(attendedClasses);
        enrollment.setTotalClasses(totalClasses);

        return enrollmentRepository.save(enrollment);
    }

    // Inner class for course statistics
    public static class CourseStatistics {
        private Long totalStudents;
        private Double averageGrade;
        private Double averageAttendance;
        private Double passRate;

        public Long getTotalStudents() { return totalStudents; }
        public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }

        public Double getAverageGrade() { return averageGrade; }
        public void setAverageGrade(Double averageGrade) { this.averageGrade = averageGrade; }

        public Double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }

        public Double getPassRate() { return passRate; }
        public void setPassRate(Double passRate) { this.passRate = passRate; }
    }
}
