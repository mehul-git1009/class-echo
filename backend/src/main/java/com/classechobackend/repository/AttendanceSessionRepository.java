package com.classechobackend.repository;

import com.classechobackend.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    
    Optional<AttendanceSession> findByQrCode(String qrCode);
    
    List<AttendanceSession> findByTeacherId(UUID teacherId);
    
    List<AttendanceSession> findByCourseId(UUID courseId);
    
    List<AttendanceSession> findByCourseIdAndDate(UUID courseId, LocalDate date);
    
    List<AttendanceSession> findByIsActiveTrue();
    
    List<AttendanceSession> findByExpiresAtBefore(LocalDateTime dateTime);
    
    Optional<AttendanceSession> findByQrCodeAndIsActiveTrue(String qrCode);
    
    // Find active sessions for a specific course, date, and section
    List<AttendanceSession> findByCourseIdAndDateAndSectionAndIsActiveTrue(UUID courseId, LocalDate date, String section);
}
