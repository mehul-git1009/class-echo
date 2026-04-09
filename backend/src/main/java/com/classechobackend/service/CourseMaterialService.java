package com.classechobackend.service;

import com.classechobackend.model.CourseMaterial;
import com.classechobackend.model.Course;
import com.classechobackend.repository.CourseMaterialRepository;
import com.classechobackend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CourseMaterialService {

    @Autowired
    private CourseMaterialRepository materialRepository;

    @Autowired
    private CourseRepository courseRepository;

    // Upload a new material
    public CourseMaterial uploadMaterial(UUID courseId, String title, CourseMaterial.MaterialType type,
                                        String fileUrl, String fileName, Long fileSize) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        CourseMaterial material = new CourseMaterial();
        material.setCourse(course);
        material.setTitle(title);
        material.setType(type);
        material.setFileUrl(fileUrl);
        material.setFileName(fileName);
        material.setFileSize(fileSize);

        return materialRepository.save(material);
    }

    // Get all materials for a course
    public List<CourseMaterial> getCourseMaterials(UUID courseId) {
        return materialRepository.findByCourseIdOrderByUploadedAtDesc(courseId);
    }

    // Get materials by type
    public List<CourseMaterial> getMaterialsByType(UUID courseId, CourseMaterial.MaterialType type) {
        return materialRepository.findByCourseIdAndType(courseId, type);
    }

    // Get material by ID
    public CourseMaterial getMaterialById(UUID materialId) {
        return materialRepository.findById(materialId)
            .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    // Update material
    public CourseMaterial updateMaterial(UUID materialId, String title, CourseMaterial.MaterialType type) {
        CourseMaterial material = materialRepository.findById(materialId)
            .orElseThrow(() -> new RuntimeException("Material not found"));

        if (title != null) material.setTitle(title);
        if (type != null) material.setType(type);

        return materialRepository.save(material);
    }

    // Delete material
    public void deleteMaterial(UUID materialId) {
        if (!materialRepository.existsById(materialId)) {
            throw new RuntimeException("Material not found");
        }
        materialRepository.deleteById(materialId);
    }

    // Get material count for a course
    public Long getMaterialCount(UUID courseId) {
        return materialRepository.countByCourseId(courseId);
    }

    // Get all materials
    public List<CourseMaterial> getAllMaterials() {
        return materialRepository.findAll();
    }
}
