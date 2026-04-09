package com.classechobackend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.classechobackend.model.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.student.id = :studentId ORDER BY a.date DESC")
    List<Attendance> findByStudentId(@Param("studentId") UUID studentId);
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.course.id = :courseId")
    List<Attendance> findByCourseId(@Param("courseId") UUID courseId);
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.student.id = :studentId AND a.course.id = :courseId ORDER BY a.date DESC")
    List<Attendance> findByStudentIdAndCourseId(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId);
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.course.id = :courseId AND a.date = :date")
    List<Attendance> findByCourseIdAndDate(@Param("courseId") UUID courseId, @Param("date") LocalDate date);
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.course.id = :courseId AND a.date = :date AND a.section = :section")
    List<Attendance> findByCourseIdAndDateAndSection(@Param("courseId") UUID courseId, @Param("date") LocalDate date, @Param("section") String section);
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.course WHERE a.student.id = :studentId AND a.course.id = :courseId AND a.date = :date AND a.section = :section")
    Optional<Attendance> findByStudentIdAndCourseIdAndDateAndSection(
        @Param("studentId") UUID studentId, @Param("courseId") UUID courseId, @Param("date") LocalDate date, @Param("section") String section
    );
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Long countPresentByStudentId(@Param("studentId") UUID studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    Long countTotalByStudentId(@Param("studentId") UUID studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.course.id = :courseId AND a.status = 'PRESENT'")
    Long countPresentByStudentIdAndCourseId(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.course.id = :courseId")
    Long countTotalByStudentIdAndCourseId(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.course.id = :courseId AND a.date = :date AND a.section = :section AND a.status = 'PRESENT'")
    Long countPresentByCourseIdAndDateAndSection(@Param("courseId") UUID courseId, @Param("date") LocalDate date, @Param("section") String section);
}
