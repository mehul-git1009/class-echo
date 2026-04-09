/**
 * Attendance API functions
 */

import { apiRequest, buildQueryString } from '../api';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  PENDING = 'PENDING',
}

export interface Attendance {
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
  date: string;
  section: string;
  status: AttendanceStatus;
  markedBy: 'QR' | 'MANUAL';
  qrCode?: string;
  markedAt?: string;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  qrCode: string;
  section: string;
  date: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceStatistics {
  totalClasses: number;
  presentClasses: number;
  percentage: number;
}

// Generate QR code for attendance
export const generateQRCode = (courseId: string, teacherId: string, section: string, date: string) => 
  apiRequest<AttendanceSession>(`/attendance/qr/generate${buildQueryString({ courseId, teacherId, section, date })}`, {
    method: 'POST',
  });

// Validate QR code
export const validateQRCode = (qrCode: string) => 
  apiRequest<boolean>(`/attendance/qr/validate/${qrCode}`);

// Mark attendance via QR code
export const markAttendanceViaQR = (studentId: string, qrCode: string) => 
  apiRequest<Attendance>(`/attendance/qr/mark${buildQueryString({ studentId, qrCode })}`, {
    method: 'POST',
  });

// Mark attendance manually
export const markAttendanceManually = (
  studentId: string,
  courseId: string,
  date: string,
  section: string,
  status: AttendanceStatus
) => 
  apiRequest<Attendance>(`/attendance/mark${buildQueryString({ studentId, courseId, date, section, status })}`, {
    method: 'POST',
  });

// Get student's attendance
export const getStudentAttendance = () => 
  apiRequest<Attendance[]>('/attendance/student/me');

// Get student's attendance for a course
export const getStudentCourseAttendance = (studentId: string, courseId: string) => 
  apiRequest<Attendance[]>(`/attendance/student/${studentId}/course/${courseId}`);

// Get attendance for a course on a specific date
export const getCourseAttendance = (courseId: string, date: string, section: string) => 
  apiRequest<Attendance[]>(`/attendance/course/${courseId}${buildQueryString({ date, section })}`);

// Get student attendance statistics
export const getStudentAttendanceStats = (studentId: string) => 
  apiRequest<AttendanceStatistics>(`/attendance/student/${studentId}/stats`);

// Get student attendance statistics for a course
export const getStudentCourseAttendanceStats = (studentId: string, courseId: string) => 
  apiRequest<AttendanceStatistics>(`/attendance/student/${studentId}/course/${courseId}/stats`);

// Get current student's attendance statistics
export const getStudentStats = () => 
  apiRequest<AttendanceStatistics>('/attendance/student/me/stats');

// Get attendance statistics for a course session
export const getCourseSessionStats = (courseId: string, date: string, section: string) => 
  apiRequest<AttendanceStatistics>(`/attendance/course/${courseId}/session/stats${buildQueryString({ date, section })}`);

// Get teacher's active sessions
export const getTeacherActiveSessions = () => 
  apiRequest<AttendanceSession[]>('/attendance/teacher/me/sessions');

// Close/Invalidate an attendance session
export const closeAttendanceSession = (sessionId: string) => 
  apiRequest<void>(`/attendance/session/${sessionId}/close`, {
    method: 'POST',
  });

// Get active session for a specific course and date
export const getActiveCourseSession = (courseId: string, date: string, section: string) => 
  apiRequest<AttendanceSession | null>(`/attendance/course/${courseId}/active-session${buildQueryString({ date, section })}`);

