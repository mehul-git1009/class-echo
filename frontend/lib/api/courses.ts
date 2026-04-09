/**
 * Course API functions
 */

import { apiRequest, buildQueryString } from '../api';

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  semester: string;
  teacher: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  student: {
    id: string;
    name: string;
    rollNo: string;
  };
  course: Course;
  section: string;
  grade?: string;
  percentage?: number;
  attendedClasses: number;
  totalClasses: number;
  enrolledAt: string;
}

export interface CourseStatistics {
  totalStudents: number;
  averageGrade: number;
  averageAttendance?: number;
  passRate?: number;
}

// Get all courses
export const getAllCourses = () => 
  apiRequest<Course[]>('/courses');

// Get course by ID
export const getCourseById = (id: string) => 
  apiRequest<Course>(`/courses/${id}`);

// Get course by code
export const getCourseByCode = (code: string) => 
  apiRequest<Course>(`/courses/code/${code}`);

// Get teacher's courses
export const getTeacherCourses = () => 
  apiRequest<Course[]>('/courses/teacher/me');

// Get student's enrolled courses
export const getStudentCourses = () => 
  apiRequest<CourseEnrollment[]>('/courses/student/me');

// Alias for getStudentCourses for consistency
export const getEnrolledCourses = () => 
  apiRequest<CourseEnrollment[]>('/courses/student/me');

// Get courses by semester
export const getCoursesBySemester = (semester: string) => 
  apiRequest<Course[]>(`/courses/semester/${semester}`);

// Create course
export const createCourse = (course: Partial<Course>) => 
  apiRequest<Course>('/courses', {
    method: 'POST',
    body: course,
  });

// Update course
export const updateCourse = (id: string, course: Partial<Course>) => 
  apiRequest<Course>(`/courses/${id}`, {
    method: 'PUT',
    body: course,
  });

// Delete course
export const deleteCourse = (id: string) => 
  apiRequest<void>(`/courses/${id}`, {
    method: 'DELETE',
  });

// Enroll student in course
export const enrollStudent = (courseId: string, studentId: string, section: string) => 
  apiRequest<CourseEnrollment>(`/courses/${courseId}/enroll${buildQueryString({ studentId, section })}`, {
    method: 'POST',
  });

// Get course enrollments
export const getCourseEnrollments = (courseId: string) => 
  apiRequest<CourseEnrollment[]>(`/courses/${courseId}/enrollments`);

// Get enrollments by section
export const getEnrollmentsBySection = (courseId: string, section: string) => 
  apiRequest<CourseEnrollment[]>(`/courses/${courseId}/enrollments/section/${section}`);

// Get course statistics
export const getCourseStatistics = (courseId: string) => 
  apiRequest<CourseStatistics>(`/courses/${courseId}/statistics`);

// Update enrollment grade
export const updateEnrollmentGrade = (enrollmentId: string, grade: string, percentage: number) => 
  apiRequest<CourseEnrollment>(`/courses/enrollments/${enrollmentId}/grade${buildQueryString({ grade, percentage })}`, {
    method: 'PUT',
  });
