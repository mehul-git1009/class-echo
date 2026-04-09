package com.classechobackend.dto;

import com.classechobackend.model.CourseEnrollment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentDTO {
    private UUID id;
    private StudentSummaryDTO student;
    private CourseSummaryDTO course;
    private String section;
    private String grade;
    private Double percentage;
    private Integer attendedClasses;
    private Integer totalClasses;
    private Double attendancePercentage;
    private LocalDateTime enrolledAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummaryDTO {
        private UUID id;
        private String name;
        private String rollNo;
        
        public StudentSummaryDTO(com.classechobackend.model.Student student) {
            this.id = student.getId();
            this.name = student.getUser().getName();
            this.rollNo = student.getRollNo();
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseSummaryDTO {
        private UUID id;
        private String code;
        private String name;
        private String description;
        private Integer credits;
        private String semester;
        
        public CourseSummaryDTO(com.classechobackend.model.Course course) {
            this.id = course.getId();
            this.code = course.getCode();
            this.name = course.getName();
            this.description = course.getDescription();
            this.credits = course.getCredits();
            this.semester = course.getSemester();
        }
    }
    
    public static CourseEnrollmentDTO fromEntity(CourseEnrollment enrollment) {
        CourseEnrollmentDTO dto = new CourseEnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setStudent(new StudentSummaryDTO(enrollment.getStudent()));
        dto.setCourse(new CourseSummaryDTO(enrollment.getCourse()));
        dto.setSection(enrollment.getSection());
        dto.setGrade(enrollment.getGrade());
        dto.setPercentage(enrollment.getPercentage());
        dto.setAttendedClasses(enrollment.getAttendedClasses());
        dto.setTotalClasses(enrollment.getTotalClasses());
        dto.setAttendancePercentage(enrollment.getAttendancePercentage());
        dto.setEnrolledAt(enrollment.getEnrolledAt());
        return dto;
    }
}
