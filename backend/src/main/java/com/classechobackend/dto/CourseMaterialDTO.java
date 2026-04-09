package com.classechobackend.dto;

import com.classechobackend.model.CourseMaterial;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMaterialDTO {
    private UUID id;
    private CourseSummaryDTO course;
    private String title;
    private String type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseSummaryDTO {
        private UUID id;
        private String code;
        private String name;
        
        public CourseSummaryDTO(com.classechobackend.model.Course course) {
            this.id = course.getId();
            this.code = course.getCode();
            this.name = course.getName();
        }
    }
    
    public static CourseMaterialDTO fromEntity(CourseMaterial material) {
        CourseMaterialDTO dto = new CourseMaterialDTO();
        dto.setId(material.getId());
        dto.setCourse(new CourseSummaryDTO(material.getCourse()));
        dto.setTitle(material.getTitle());
        dto.setType(material.getType().toString());
        dto.setFileUrl(material.getFileUrl());
        dto.setFileName(material.getFileName());
        dto.setFileSize(material.getFileSize());
        dto.setUploadedAt(material.getUploadedAt());
        return dto;
    }
}
