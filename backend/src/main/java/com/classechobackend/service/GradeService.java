package com.classechobackend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.classechobackend.model.Course;
import com.classechobackend.model.Grade;
import com.classechobackend.model.Student;
import com.classechobackend.repository.CourseRepository;
import com.classechobackend.repository.GradeRepository;
import com.classechobackend.repository.StudentRepository;

@Service
@Transactional
public class GradeService {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    // Submit or update a grade
    public Grade submitGrade(UUID studentId, UUID courseId, Grade.AssessmentType assessmentType,
            String assessmentName, Double score, Double maxScore, String feedback) {

        System.out.println("=== GradeService.submitGrade ===");
        System.out.println("Fetching student with ID: " + studentId);

        // Fetch the student and course entities (required due to nullable=false)
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        System.out.println("Student found: " + student.getRollNo());
        System.out.println("Fetching course with ID: " + courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));

        System.out.println("Course found: " + course.getCode());

        // Check if grade already exists
        Optional<Grade> existingGrade = gradeRepository.findByStudentIdAndCourseIdAndAssessmentTypeAndAssessmentName(
                studentId, courseId, assessmentType, assessmentName);

        Grade grade;
        if (existingGrade.isPresent()) {
            System.out.println("Updating existing grade: " + existingGrade.get().getId());
            grade = existingGrade.get();
        } else {
            System.out.println("Creating new grade");
            grade = new Grade();
            grade.setStudent(student);
            grade.setCourse(course);
            grade.setAssessmentType(assessmentType);
            grade.setAssessmentName(assessmentName);
        }

        grade.setScore(score);
        grade.setMaxScore(maxScore);

        // Calculate percentage
        double percentage = (score / maxScore) * 100;
        grade.setLetterGrade(calculateLetterGrade(percentage));
        grade.setFeedback(feedback);

        System.out.println("Saving grade: " + percentage + "% = " + grade.getLetterGrade());
        Grade savedGrade = gradeRepository.save(grade);
        System.out.println("Grade saved successfully with ID: " + savedGrade.getId());

        return savedGrade;
    }

    // Get all grades for a student
    public List<Grade> getStudentGrades(UUID studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    // Get grades for a student in a specific course
    public List<Grade> getStudentCourseGrades(UUID studentId, UUID courseId) {
        return gradeRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    // Get all grades for a course
    public List<Grade> getCourseGrades(UUID courseId) {
        return gradeRepository.findByCourseId(courseId);
    }

    // Get grades by assessment type
    public List<Grade> getGradesByAssessmentType(UUID studentId, UUID courseId, Grade.AssessmentType assessmentType) {
        return gradeRepository.findByStudentIdAndCourseIdAndAssessmentType(studentId, courseId, assessmentType);
    }

    // Calculate average grade for a student
    public Double calculateStudentAverage(UUID studentId) {
        Double average = gradeRepository.getAveragePercentageByStudentId(studentId);
        return average != null ? average : 0.0;
    }

    // Calculate average grade for a student in a course
    public Double calculateStudentCourseAverage(UUID studentId, UUID courseId) {
        Double average = gradeRepository.getAveragePercentageByStudentIdAndCourseId(studentId, courseId);
        return average != null ? average : 0.0;
    }

    // Calculate average grade for a course
    public Double calculateCourseAverage(UUID courseId) {
        Double average = gradeRepository.getAveragePercentageByCourseId(courseId);
        return average != null ? average : 0.0;
    }

    // Get grade distribution for a course
    public Map<String, Long> getGradeDistribution(UUID courseId) {
        List<Object[]> distribution = gradeRepository.getGradeDistributionByCourseId(courseId);
        Map<String, Long> result = new HashMap<>();

        for (Object[] row : distribution) {
            String letterGrade = (String) row[0];
            Long count = (Long) row[1];
            result.put(letterGrade, count);
        }

        return result;
    }

    // Calculate GPA (4.0 scale)
    public Double calculateGPA(UUID studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);

        if (grades.isEmpty()) {
            return 0.0;
        }

        double totalPoints = 0.0;
        int count = 0;

        for (Grade grade : grades) {
            double gradePoint = convertLetterGradeToPoint(grade.getLetterGrade());
            if (gradePoint >= 0) {
                totalPoints += gradePoint;
                count++;
            }
        }

        return count > 0 ? totalPoints / count : 0.0;
    }

    // Delete a grade
    public void deleteGrade(UUID gradeId) {
        if (!gradeRepository.existsById(gradeId)) {
            throw new RuntimeException("Grade not found");
        }
        gradeRepository.deleteById(gradeId);
    }

    // Helper method: Calculate letter grade from percentage
    private String calculateLetterGrade(Double percentage) {
        if (percentage == null)
            return "F";
        if (percentage >= 90)
            return "O";
        if (percentage >= 80)
            return "A+";
        if (percentage >= 70)
            return "A";
        if (percentage >= 60)
            return "B+";
        if (percentage >= 50)
            return "C";

        return "F";
    }

    // Helper method: Convert letter grade to GPA point
    private double convertLetterGradeToPoint(String letterGrade) {
        if (letterGrade == null)
            return 0.0;

        switch (letterGrade) {
            case "O":
                return 10.0;
            case "A+":
                return 9.0;
            case "A":
                return 8.0;
            case "B+":
                return 7.0;
            case "C":
                return 6.0;

            case "F":
                return 0.0;
            default:
                return -1.0; // Invalid grade
        }
    }

    // Get performance breakdown by assessment type
    public Map<String, Double> getPerformanceBreakdown(UUID studentId, UUID courseId) {
        Map<String, Double> breakdown = new HashMap<>();

        for (Grade.AssessmentType type : Grade.AssessmentType.values()) {
            List<Grade> grades = gradeRepository.findByStudentIdAndCourseIdAndAssessmentType(studentId, courseId, type);

            if (!grades.isEmpty()) {
                double total = 0.0;
                for (Grade grade : grades) {
                    total += grade.getPercentage();
                }
                breakdown.put(type.toString(), total / grades.size());
            }
        }

        return breakdown;
    }
}
