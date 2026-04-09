package com.classechobackend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.classechobackend.model.Grade;

@Repository
public interface GradeRepository extends JpaRepository<Grade, UUID> {

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.course WHERE g.student.id = :studentId ORDER BY g.createdAt DESC")
    List<Grade> findByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.course WHERE g.course.id = :courseId")
    List<Grade> findByCourseId(@Param("courseId") UUID courseId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.course WHERE g.student.id = :studentId AND g.course.id = :courseId ORDER BY g.createdAt DESC")
    List<Grade> findByStudentIdAndCourseId(@Param("studentId") UUID studentId, @Param("courseId") UUID courseId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.course WHERE g.student.id = :studentId AND g.course.id = :courseId AND g.assessmentType = :assessmentType AND g.assessmentName = :assessmentName")
    Optional<Grade> findByStudentIdAndCourseIdAndAssessmentTypeAndAssessmentName(
            @Param("studentId") UUID studentId, @Param("courseId") UUID courseId,
            @Param("assessmentType") Grade.AssessmentType assessmentType,
            @Param("assessmentName") String assessmentName);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.course WHERE g.student.id = :studentId AND g.course.id = :courseId AND g.assessmentType = :assessmentType ORDER BY g.createdAt DESC")
    List<Grade> findByStudentIdAndCourseIdAndAssessmentType(
            @Param("studentId") UUID studentId, @Param("courseId") UUID courseId,
            @Param("assessmentType") Grade.AssessmentType assessmentType);

    @Query("SELECT AVG(g.score / g.maxScore * 100) FROM Grade g WHERE g.course.id = :courseId")
    Double getAveragePercentageByCourseId(@Param("courseId") UUID courseId);

    @Query("SELECT AVG(g.score / g.maxScore * 100) FROM Grade g WHERE g.student.id = :studentId")
    Double getAveragePercentageByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT AVG(g.score / g.maxScore * 100) FROM Grade g WHERE g.student.id = :studentId AND g.course.id = :courseId")
    Double getAveragePercentageByStudentIdAndCourseId(@Param("studentId") UUID studentId,
            @Param("courseId") UUID courseId);

    @Query("SELECT g.letterGrade, COUNT(g) FROM Grade g WHERE g.course.id = :courseId GROUP BY g.letterGrade")
    List<Object[]> getGradeDistributionByCourseId(@Param("courseId") UUID courseId);
}
