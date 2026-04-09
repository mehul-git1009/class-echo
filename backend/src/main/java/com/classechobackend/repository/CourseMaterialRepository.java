package com.classechobackend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.classechobackend.model.CourseMaterial;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, UUID> {
    
    @Query("SELECT cm FROM CourseMaterial cm JOIN FETCH cm.course WHERE cm.course.id = :courseId ORDER BY cm.uploadedAt DESC")
    List<CourseMaterial> findByCourseIdOrderByUploadedAtDesc(@Param("courseId") UUID courseId);
    
    @Query("SELECT cm FROM CourseMaterial cm JOIN FETCH cm.course WHERE cm.course.id = :courseId AND cm.type = :type")
    List<CourseMaterial> findByCourseIdAndType(@Param("courseId") UUID courseId, @Param("type") CourseMaterial.MaterialType type);
    
    Long countByCourseId(UUID courseId);
}
