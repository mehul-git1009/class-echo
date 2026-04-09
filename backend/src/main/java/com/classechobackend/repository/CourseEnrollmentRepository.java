package com.classechobackend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.classechobackend.model.Course;
import com.classechobackend.model.CourseEnrollment;
import com.classechobackend.model.Student;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.student = :student")
    List<CourseEnrollment> findByStudent(@Param("student") Student student);
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.student.id = :studentId")
    List<CourseEnrollment> findByStudentId(@Param("studentId") UUID studentId);
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.course = :course")
    List<CourseEnrollment> findByCourse(@Param("course") Course course);
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.course.id = :courseId")
    List<CourseEnrollment> findByCourseId(@Param("courseId") UUID courseId);
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.student.id = :studentId AND ce.course.id = :courseId")
    Optional<CourseEnrollment> findByStudentIdAndCourseId(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId);
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.section = :section")
    List<CourseEnrollment> findBySection(@Param("section") String section);
    
    @Query("SELECT ce FROM CourseEnrollment ce JOIN FETCH ce.student JOIN FETCH ce.course WHERE ce.course.id = :courseId AND ce.section = :section")
    List<CourseEnrollment> findByCourseIdAndSection(@Param("courseId") UUID courseId, @Param("section") String section);
    
    @Query("SELECT COUNT(e) FROM CourseEnrollment e WHERE e.course.id = :courseId")
    Long countByCourseId(@Param("courseId") UUID courseId);
    
    @Query("SELECT AVG(e.percentage) FROM CourseEnrollment e WHERE e.course.id = :courseId")
    Double getAveragePercentageByCourseId(@Param("courseId") UUID courseId);
    
    boolean existsByStudentIdAndCourseId(UUID studentId, UUID courseId);
}
