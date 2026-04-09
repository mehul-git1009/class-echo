package com.classechobackend.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classechobackend.exception.BadRequestException;
import com.classechobackend.exception.ResourceNotFoundException;
import com.classechobackend.model.Student;
import com.classechobackend.model.Teacher;
import com.classechobackend.model.User;
import com.classechobackend.repository.StudentRepository;
import com.classechobackend.repository.TeacherRepository;
import com.classechobackend.repository.UserRepository;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    public User createUser(String email, String name, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User(email, name, role);
        return userRepository.save(user);
    }

    public User createUserWithProfile(String email, String name, String role, String rollNo) {
        User user = createUser(email, name, role);

        if ("student".equalsIgnoreCase(role)) {
            if (rollNo == null || rollNo.isEmpty()) {
                throw new BadRequestException("Roll number is required for student");
            }
            if (studentRepository.existsByRollNo(rollNo)) {
                throw new BadRequestException("Roll number already exists");
            }
            Student student = new Student(user, rollNo);
            student.setGpa(BigDecimal.ZERO);
            studentRepository.save(student);
        } else if ("teacher".equalsIgnoreCase(role)) {
            Teacher teacher = new Teacher(user);
            teacherRepository.save(teacher);
        }

        return user;
    }

    public User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public User updateUser(UUID userId, String name, String avatarUrl) {
        User user = getUserById(userId);
        
        if (name != null) {
            user.setName(name);
        }
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }

    public void deleteUser(UUID userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }
}
