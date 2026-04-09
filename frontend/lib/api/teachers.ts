/**
 * Teachers API
 * Handles teacher profile operations
 */

import { apiRequest } from "../api";

export interface UpdateTeacherProfileRequest {
  department?: string;
  qualification?: string;
  specialization?: string;
  officeHours?: string;
  bio?: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  officeHours?: string;
  bio?: string;
}

/**
 * Get current teacher's profile
 */
export async function getMyProfile(): Promise<TeacherProfile> {
  const response = await apiRequest<TeacherProfile>("/teachers/me", {
    method: "GET",
  });
  return response;
}

/**
 * Update current teacher's profile
 */
export async function updateMyProfile(
  data: UpdateTeacherProfileRequest
): Promise<TeacherProfile> {
  const response = await apiRequest<TeacherProfile>("/teachers/me", {
    method: "PUT",
    body: data,
  });
  return response;
}

/**
 * Get all teachers
 */
export async function getAllTeachers(): Promise<TeacherProfile[]> {
  const response = await apiRequest<TeacherProfile[]>("/teachers", {
    method: "GET",
  });
  return response;
}

/**
 * Get teacher by ID
 */
export async function getTeacherById(teacherId: string): Promise<TeacherProfile> {
  const response = await apiRequest<TeacherProfile>(`/teachers/${teacherId}`, {
    method: "GET",
  });
  return response;
}
