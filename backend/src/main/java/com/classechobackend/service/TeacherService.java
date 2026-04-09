package com.classechobackend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classechobackend.dto.TeacherProfileDTO;
import com.classechobackend.dto.UpdateTeacherRequest;
import com.classechobackend.exception.ResourceNotFoundException;
import com.classechobackend.model.Teacher;
import com.classechobackend.repository.TeacherRepository;

@Service
@Transactional
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    public TeacherProfileDTO getTeacherProfile(UUID userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user"));

        return mapToDTO(teacher);
    }

    public TeacherProfileDTO getTeacherById(UUID teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));

        return mapToDTO(teacher);
    }

    public List<TeacherProfileDTO> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TeacherProfileDTO> getTeachersByDepartment(String department) {
        return teacherRepository.findAll().stream()
                .filter(teacher -> department.equalsIgnoreCase(teacher.getDepartment()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TeacherProfileDTO updateTeacherProfile(UUID userId, UpdateTeacherRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user"));

        if (request.getDepartment() != null) {
            teacher.setDepartment(request.getDepartment());
        }
        if (request.getQualification() != null) {
            teacher.setQualification(request.getQualification());
        }
        if (request.getSpecialization() != null) {
            teacher.setSpecialization(request.getSpecialization());
        }
        if (request.getOfficeHours() != null) {
            teacher.setOfficeHours(request.getOfficeHours());
        }
        if (request.getBio() != null) {
            teacher.setBio(request.getBio());
        }

        teacher = teacherRepository.save(teacher);
        return mapToDTO(teacher);
    }

    public void deleteTeacher(UUID userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user"));
        
        teacherRepository.delete(teacher);
    }

    private TeacherProfileDTO mapToDTO(Teacher teacher) {
        TeacherProfileDTO dto = new TeacherProfileDTO();
        dto.setId(teacher.getId());
        dto.setUserId(teacher.getUser().getId());
        dto.setEmail(teacher.getUser().getEmail());
        dto.setName(teacher.getUser().getName());
        dto.setAvatarUrl(teacher.getUser().getAvatarUrl());
        dto.setDepartment(teacher.getDepartment());
        dto.setQualification(teacher.getQualification());
        dto.setSpecialization(teacher.getSpecialization());
        dto.setOfficeHours(teacher.getOfficeHours());
        dto.setBio(teacher.getBio());
        return dto;
    }
}
