//Students Apis

import { apiRequest } from "../api";

export interface UpdateStudentProfileRequest {
  rollNo?: string;
  gpa?: number;
  contact?: string;
  guardianName?: string;
  guardianContact?: string;
  dateOfBirth?: string;
  address?: string;
  faceDescriptor?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  rollNo: string;
  gpa?: number;
  contact?: string;
  guardianName?: string;
  guardianContact?: string;
  dateOfBirth?: string;
  address?: string;
  faceDescriptor?: string;
}

//Get Current Profile
export async function getMyProfile(): Promise<StudentProfile> {
  const response = await apiRequest<StudentProfile>("/students/me", {
    method: "GET",
  });
  return response;
}

//Update Studen Profile
export async function updateMyProfile(
  data: UpdateStudentProfileRequest
): Promise<StudentProfile> {
  const response = await apiRequest<StudentProfile>("/students/me", {
    method: "PUT",
    body: data,
  });
  return response;
}

//Update Face Descriptor
export async function updateFaceDescriptor(
  faceDescriptor: string
): Promise<StudentProfile> {
  return updateMyProfile({ faceDescriptor });
}
