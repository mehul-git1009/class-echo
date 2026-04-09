/**
 * Course Materials API functions
 */

import { apiRequest, buildQueryString } from '../api';

export enum MaterialType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  PRESENTATION = 'PRESENTATION',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER',
}

export interface CourseMaterial {
  id: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  title: string;
  type: MaterialType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// Upload material
export const uploadMaterial = (
  courseId: string,
  title: string,
  type: MaterialType,
  fileUrl: string,
  fileName: string,
  fileSize: number
) => 
  apiRequest<CourseMaterial>(`/materials/upload${buildQueryString({ courseId, title, type, fileUrl, fileName, fileSize })}`, {
    method: 'POST',
  });

// Get course materials
export const getCourseMaterials = (courseId: string) => 
  apiRequest<CourseMaterial[]>(`/materials/course/${courseId}`);

// Alias for consistency
export const getMaterialsByCourse = (courseId: string) => 
  apiRequest<CourseMaterial[]>(`/materials/course/${courseId}`);

// Get materials by type
export const getMaterialsByType = (courseId: string, type: MaterialType) => 
  apiRequest<CourseMaterial[]>(`/materials/course/${courseId}/type/${type}`);

// Get material by ID
export const getMaterialById = (id: string) => 
  apiRequest<CourseMaterial>(`/materials/${id}`);

// Update material
export const updateMaterial = (id: string, title?: string, type?: MaterialType) => 
  apiRequest<CourseMaterial>(`/materials/${id}${buildQueryString({ title, type })}`, {
    method: 'PUT',
  });

// Delete material
export const deleteMaterial = (id: string) => 
  apiRequest<void>(`/materials/${id}`, {
    method: 'DELETE',
  });

// Get material count
export const getMaterialCount = (courseId: string) => 
  apiRequest<number>(`/materials/course/${courseId}/count`);

// Get all materials
export const getAllMaterials = () => 
  apiRequest<CourseMaterial[]>('/materials');
