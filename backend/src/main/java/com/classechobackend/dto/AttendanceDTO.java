package com.classechobackend.dto;

import com.classechobackend.model.Attendance;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    
    private UUID id;
    private StudentInfo student;
    private CourseInfo course;
    private LocalDate date;
    private String section;
    private String status;
    private String markedBy;
    private String qrCode;
    private LocalDateTime markedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfo {
        private UUID id;
        private String name;
        private String rollNo;
        private String email;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseInfo {
        private UUID id;
        private String code;
        private String name;
    }
    
    // Convert Attendance entity to DTO
    public static AttendanceDTO fromEntity(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setDate(attendance.getDate());
        dto.setSection(attendance.getSection());
        dto.setStatus(attendance.getStatus().name());
        dto.setMarkedBy(attendance.getMarkedBy() != null ? attendance.getMarkedBy().name() : null);
        dto.setQrCode(attendance.getQrCode());
        dto.setMarkedAt(attendance.getMarkedAt());
        
        // Map student info
        if (attendance.getStudent() != null) {
            StudentInfo studentInfo = new StudentInfo();
            studentInfo.setId(attendance.getStudent().getId());
            studentInfo.setRollNo(attendance.getStudent().getRollNo());
            
            // Get name and email from User entity
            if (attendance.getStudent().getUser() != null) {
                studentInfo.setName(attendance.getStudent().getUser().getName());
                studentInfo.setEmail(attendance.getStudent().getUser().getEmail());
            }
            
            dto.setStudent(studentInfo);
        }
        
        // Map course info
        if (attendance.getCourse() != null) {
            CourseInfo courseInfo = new CourseInfo();
            courseInfo.setId(attendance.getCourse().getId());
            courseInfo.setCode(attendance.getCourse().getCode());
            courseInfo.setName(attendance.getCourse().getName());
            dto.setCourse(courseInfo);
        }
        
        return dto;
    }
}
