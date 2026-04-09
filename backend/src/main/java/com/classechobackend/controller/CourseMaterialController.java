package com.classechobackend.controller;

import com.classechobackend.dto.CourseMaterialDTO;
import com.classechobackend.model.CourseMaterial;
import com.classechobackend.service.CourseMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class CourseMaterialController {

    @Autowired
    private CourseMaterialService materialService;

    // Upload a new material
    @PostMapping("/upload")
    public ResponseEntity<CourseMaterial> uploadMaterial(
        @RequestParam UUID courseId,
        @RequestParam String title,
        @RequestParam CourseMaterial.MaterialType type,
        @RequestParam String fileUrl,
        @RequestParam String fileName,
        @RequestParam Long fileSize
    ) {
        try {
            CourseMaterial material = materialService.uploadMaterial(courseId, title, type, fileUrl, fileName, fileSize);
            return ResponseEntity.status(HttpStatus.CREATED).body(material);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Get all materials for a course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterialDTO>> getCourseMaterials(@PathVariable UUID courseId) {
        System.out.println("=== CourseMaterialController.getCourseMaterials ===");
        System.out.println("Course ID: " + courseId);
        List<CourseMaterial> materials = materialService.getCourseMaterials(courseId);
        System.out.println("Found " + materials.size() + " materials");
        
        List<CourseMaterialDTO> dtos = materials.stream()
            .map(material -> {
                System.out.println("  - Title: " + material.getTitle() + " (" + material.getType() + ")");
                return CourseMaterialDTO.fromEntity(material);
            })
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    // Get materials by type
    @GetMapping("/course/{courseId}/type/{type}")
    public ResponseEntity<List<CourseMaterial>> getMaterialsByType(
        @PathVariable UUID courseId,
        @PathVariable CourseMaterial.MaterialType type
    ) {
        List<CourseMaterial> materials = materialService.getMaterialsByType(courseId, type);
        return ResponseEntity.ok(materials);
    }

    // Get material by ID
    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterial> getMaterialById(@PathVariable UUID id) {
        try {
            CourseMaterial material = materialService.getMaterialById(id);
            return ResponseEntity.ok(material);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Update material
    @PutMapping("/{id}")
    public ResponseEntity<CourseMaterial> updateMaterial(
        @PathVariable UUID id,
        @RequestParam(required = false) String title,
        @RequestParam(required = false) CourseMaterial.MaterialType type
    ) {
        try {
            CourseMaterial material = materialService.updateMaterial(id, title, type);
            return ResponseEntity.ok(material);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // Delete material
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        try {
            materialService.deleteMaterial(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get material count for a course
    @GetMapping("/course/{courseId}/count")
    public ResponseEntity<Long> getMaterialCount(@PathVariable UUID courseId) {
        Long count = materialService.getMaterialCount(courseId);
        return ResponseEntity.ok(count);
    }

    // Get all materials
    @GetMapping
    public ResponseEntity<List<CourseMaterial>> getAllMaterials() {
        List<CourseMaterial> materials = materialService.getAllMaterials();
        return ResponseEntity.ok(materials);
    }
}
