package com.classechobackend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.classechobackend.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByUserId(UUID userId);
    Optional<Student> findByRollNo(String rollNo);
    boolean existsByRollNo(String rollNo);
    
    @Query("SELECT s FROM Student s WHERE s.user.id = :userId")
    Optional<Student> findByUserIdWithUser(UUID userId);
}
