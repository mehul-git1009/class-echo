package com.classechobackend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classechobackend.dto.StudentProfileDTO;
import com.classechobackend.dto.UpdateStudentRequest;
import com.classechobackend.exception.BadRequestException;
import com.classechobackend.exception.ResourceNotFoundException;
import com.classechobackend.model.Student;
import com.classechobackend.repository.StudentRepository;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public StudentProfileDTO getStudentProfile(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user"));

        return mapToDTO(student);
    }

    public StudentProfileDTO getStudentByRollNo(String rollNo) {
        Student student = studentRepository.findByRollNo(rollNo)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "rollNo", rollNo));

        return mapToDTO(student);
    }

    public List<StudentProfileDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StudentProfileDTO updateStudentProfile(UUID userId, UpdateStudentRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user"));

        // Check if roll number is being changed and if it already exists
        if (request.getRollNo() != null && !request.getRollNo().equals(student.getRollNo())) {
            if (studentRepository.existsByRollNo(request.getRollNo())) {
                throw new BadRequestException("Roll number already exists");
            }
            student.setRollNo(request.getRollNo());
        }

        if (request.getGpa() != null) {
            student.setGpa(request.getGpa());
        }
        if (request.getContact() != null) {
            student.setContact(request.getContact());
        }
        if (request.getGuardianName() != null) {
            student.setGuardianName(request.getGuardianName());
        }
        if (request.getGuardianContact() != null) {
            student.setGuardianContact(request.getGuardianContact());
        }
        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }

        student = studentRepository.save(student);
        return mapToDTO(student);
    }

    public void deleteStudent(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user"));

        studentRepository.delete(student);
    }

    private StudentProfileDTO mapToDTO(Student student) {
        StudentProfileDTO dto = new StudentProfileDTO();
        dto.setId(student.getId());
        dto.setUserId(student.getUser().getId());
        dto.setEmail(student.getUser().getEmail());
        dto.setName(student.getUser().getName());
        dto.setAvatarUrl(student.getUser().getAvatarUrl());
        dto.setRollNo(student.getRollNo());
        dto.setGpa(student.getGpa());
        dto.setContact(student.getContact());
        dto.setGuardianName(student.getGuardianName());
        dto.setGuardianContact(student.getGuardianContact());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setAddress(student.getAddress());
        return dto;
    }
}
