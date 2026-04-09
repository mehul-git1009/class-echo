package com.classechobackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id", "date", "section"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(length = 50)
    private String section;
    
    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    
    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private AttendanceMethod markedBy;
    
    @Column
    private String qrCode;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime markedAt;
    
    @PrePersist
    protected void onCreate() {
        markedAt = LocalDateTime.now();
    }
    
    public enum AttendanceStatus {
        PRESENT, ABSENT, PENDING
    }
    
    public enum AttendanceMethod {
        MANUAL, QR, AUTO
    }
}
