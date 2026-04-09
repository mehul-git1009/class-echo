/**
 * Grades API functions
 */

import { apiRequest, buildQueryString } from '../api';

export enum AssessmentType {
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  PROJECT = 'PROJECT',
  LAB = 'LAB',
  PRESENTATION = 'PRESENTATION',
  OTHER = 'OTHER',
}

export interface Grade {
  id: string;
  student: {
    id: string;
    name: string;
    rollNo: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
  assessmentType: AssessmentType;
  assessmentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  submittedAt: string;
}

export interface GradeDistribution {
  [letterGrade: string]: number;
}

export interface PerformanceBreakdown {
  [assessmentType: string]: number;
}

// Submit or update a grade
export const submitGrade = (
  studentId: string,
  courseId: string,
  assessmentType: AssessmentType,
  assessmentName: string,
  score: number,
  maxScore: number,
  feedback?: string
) => 
  apiRequest<Grade>(`/grades/submit${buildQueryString({ studentId, courseId, assessmentType, assessmentName, score, maxScore, feedback })}`, {
    method: 'POST',
  });

// Get student's grades
export const getStudentGrades = () => 
  apiRequest<Grade[]>('/grades/student/me');

// Get grades for a student in a specific course
export const getStudentCourseGrades = (studentId: string, courseId: string) => 
  apiRequest<Grade[]>(`/grades/student/${studentId}/course/${courseId}`);

// Get all grades for a course
export const getCourseGrades = (courseId: string) => 
  apiRequest<Grade[]>(`/grades/course/${courseId}`);

// Get grades by course for current student
export const getGradesByCourse = (courseId: string) => 
  apiRequest<Grade[]>(`/grades/student/me/course/${courseId}`);

// Get grades by assessment type
export const getGradesByAssessmentType = (studentId: string, courseId: string, assessmentType: AssessmentType) => 
  apiRequest<Grade[]>(`/grades/student/${studentId}/course/${courseId}/type/${assessmentType}`);

// Calculate student's average
export const calculateStudentAverage = (studentId: string) => 
  apiRequest<number>(`/grades/student/${studentId}/average`);

// Calculate student's average in a course
export const calculateStudentCourseAverage = (studentId: string, courseId: string) => 
  apiRequest<number>(`/grades/student/${studentId}/course/${courseId}/average`);

// Calculate course average
export const calculateCourseAverage = (courseId: string) => 
  apiRequest<number>(`/grades/course/${courseId}/average`);

// Get grade distribution for a course
export const getGradeDistribution = (courseId: string) => 
  apiRequest<GradeDistribution>(`/grades/course/${courseId}/distribution`);

// Calculate student's GPA
export const calculateStudentGPA = (studentId: string) => 
  apiRequest<number>(`/grades/student/${studentId}/gpa`);

// Get student's own GPA
export const getMyGPA = () => 
  apiRequest<number>('/grades/student/me/gpa');

// Get performance breakdown by assessment type
export const getPerformanceBreakdown = (studentId: string, courseId: string) => 
  apiRequest<PerformanceBreakdown>(`/grades/student/${studentId}/course/${courseId}/breakdown`);

// Delete a grade
export const deleteGrade = (gradeId: string) => 
  apiRequest<void>(`/grades/${gradeId}`, {
    method: 'DELETE',
  });
