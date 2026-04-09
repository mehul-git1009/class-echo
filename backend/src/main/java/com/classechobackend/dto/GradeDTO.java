package com.classechobackend.dto;

import com.classechobackend.model.Grade;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {
    private UUID id;
    private AssessmentInfo assessment;
    private CourseInfo course;
    private Double score;
    private String grade; // Letter grade
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentInfo {
        private String title;
        private String type;
        private Double maxScore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseInfo {
        private String code;
        private String name;
    }

    public static GradeDTO fromGrade(Grade grade) {
        GradeDTO dto = new GradeDTO();
        dto.setId(grade.getId());
        
        AssessmentInfo assessment = new AssessmentInfo();
        assessment.setTitle(grade.getAssessmentName());
        assessment.setType(grade.getAssessmentType().name().toLowerCase());
        assessment.setMaxScore(grade.getMaxScore());
        dto.setAssessment(assessment);
        
        CourseInfo course = new CourseInfo();
        course.setCode(grade.getCourse().getCode());
        course.setName(grade.getCourse().getName());
        dto.setCourse(course);
        
        dto.setScore(grade.getScore());
        dto.setGrade(grade.getLetterGrade());
        dto.setCreatedAt(grade.getCreatedAt());
        
        return dto;
    }
}
