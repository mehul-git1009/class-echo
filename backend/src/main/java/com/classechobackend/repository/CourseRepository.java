package com.classechobackend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.classechobackend.model.Course;
import com.classechobackend.model.Teacher;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    
    Optional<Course> findByCode(String code);
    
    @Query("SELECT c FROM Course c JOIN FETCH c.teacher WHERE c.teacher = :teacher")
    List<Course> findByTeacher(@Param("teacher") Teacher teacher);
    
    @Query("SELECT c FROM Course c JOIN FETCH c.teacher WHERE c.teacher.id = :teacherId")
    List<Course> findByTeacherId(@Param("teacherId") UUID teacherId);
    
    List<Course> findBySemester(String semester);
    
    boolean existsByCode(String code);
}
