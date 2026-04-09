import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiRequest } from '@/lib/api';

interface CourseEnrollment {
  id: string;
  enrollmentDate: string;
  status: string;
  student: {
    id: string;
    registrationNumber: string;
    name: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
    description: string;
    credits: number;
    semester: string;
  };
}

interface Grade {
  id: string;
  score: number;
  grade: string;
  assessment: {
    title: string;
    type: string;
    maxScore: number;
  };
  course: {
    code: string;
    name: string;
  };
  createdAt: string;
}

interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  percentage: number;
}

interface CourseAttendance {
  id: string;
  courseCode: string;
  courseName: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  status: "good" | "warning" | "critical";
  recentAttendance: {
    date: string;
    status: string;
  }[];
  trend: string;
}

interface CourseMaterial {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
}

interface StudentState {
  // Data
  courses: CourseEnrollment[];
  grades: Grade[];
  gpa: number;
  attendanceStats: AttendanceStats | null;
  courseAttendance: CourseAttendance[];
  materials: CourseMaterial[];
  faceDescriptor: string | null;
  
  // Loading states
  coursesLoading: boolean;
  gradesLoading: boolean;
  gpaLoading: boolean;
  attendanceLoading: boolean;
  courseAttendanceLoading: boolean;
  materialsLoading: boolean;
  profileLoading: boolean;
  isInitialLoading: boolean;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchGrades: () => Promise<void>;
  fetchGPA: () => Promise<void>;
  fetchAttendanceStats: () => Promise<void>;
  fetchCourseAttendance: () => Promise<void>;
  fetchMaterials: (courseId: string) => Promise<void>;
  fetchAllMaterials: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  clearStore: () => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      // Initial state
      courses: [],
      grades: [],
      gpa: 0,
      attendanceStats: null,
      courseAttendance: [],
      materials: [],
      faceDescriptor: null,
      
      coursesLoading: false,
      gradesLoading: false,
      gpaLoading: false,
      attendanceLoading: false,
      courseAttendanceLoading: false,
      materialsLoading: false,
      profileLoading: false,
      isInitialLoading: false,
      
      // Fetch courses
      fetchCourses: async () => {
        // Return cached data if available and not loading
        if (get().courses.length > 0 && !get().coursesLoading) {
          return;
        }
        
        set({ coursesLoading: true });
        try {
          const data = await apiRequest<CourseEnrollment[]>('/courses/student/me', {
            method: 'GET',
          });
          set({ courses: data, coursesLoading: false });
        } catch (error) {
          console.error('Error fetching courses:', error);
          set({ coursesLoading: false });
        }
      },
      
      // Fetch grades
      fetchGrades: async () => {
        // Skip cache check during initial load to always fetch fresh data
        if (get().grades.length > 0 && !get().gradesLoading && !get().isInitialLoading) {
          return;
        }
        
        set({ gradesLoading: true });
        try {
          const data = await apiRequest<Grade[]>('/grades/student/me', {
            method: 'GET',
          });
          set({ grades: data || [], gradesLoading: false });
        } catch (error) {
          console.error('Error fetching grades:', error);
          set({ grades: [], gradesLoading: false });
        }
      },
      
      // Fetch GPA
      fetchGPA: async () => {
        if (get().gpa > 0 && !get().gpaLoading) {
          return;
        }
        
        set({ gpaLoading: true });
        try {
          const data = await apiRequest<number>('/grades/student/me/gpa', {
            method: 'GET',
          });
          set({ gpa: data, gpaLoading: false });
        } catch (error) {
          console.error('Error fetching GPA:', error);
          set({ gpaLoading: false });
        }
      },
      
      // Fetch attendance stats
      fetchAttendanceStats: async () => {
        set({ attendanceLoading: true });
        try {
          const data = await apiRequest<any>('/attendance/student/me/stats', {
            method: 'GET',
          });
          const mappedData: AttendanceStats = {
            totalClasses: data.totalClasses,
            presentClasses: data.presentClasses,
            percentage: data.percentage,
          };
          set({ attendanceStats: mappedData, attendanceLoading: false });
        } catch (error) {
          console.error('Error fetching attendance stats:', error);
          set({ attendanceLoading: false });
        }
      },

      // Fetch course-wise attendance
      fetchCourseAttendance: async () => {
        set({ courseAttendanceLoading: true });
        try {
          const data = await apiRequest<any[]>('/attendance/student/me/courses', {
            method: 'GET',
          });
          const mappedData: CourseAttendance[] = data.map((course: any) => ({
            id: course.courseId,
            courseCode: course.courseCode,
            courseName: course.courseName,
            totalClasses: course.totalClasses,
            attended: course.presentClasses,
            percentage: course.percentage,
            status: course.percentage >= 75 ? "good" : course.percentage >= 65 ? "warning" : "critical",
            recentAttendance: course.recentAttendance?.map((record: any) => ({
              date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              status: record.status.toLowerCase()
            })) || [],
            trend: course.percentage >= 75 ? "up" : "down"
          }));
          set({ courseAttendance: mappedData, courseAttendanceLoading: false });
        } catch (error) {
          console.error('Error fetching course attendance:', error);
          set({ courseAttendanceLoading: false });
        }
      },
      
      // Fetch course materials for all enrolled courses
      fetchAllMaterials: async () => {
        set({ materialsLoading: true });
        try {
          const enrolledCourses = get().courses;
          if (enrolledCourses.length === 0) {
            set({ materialsLoading: false });
            return;
          }

          // Fetch materials for each course
          const materialsPromises = enrolledCourses.map((enrollment) =>
            apiRequest<CourseMaterial[]>(`/materials/course/${enrollment.course.id}`, {
              method: 'GET',
            }).catch((err) => {
              console.error(`Failed to fetch materials for course ${enrollment.course.id}:`, err);
              return [];
            })
          );

          const materialsArrays = await Promise.all(materialsPromises);
          const allMaterials = materialsArrays.flat();
          
          set({ materials: allMaterials, materialsLoading: false });
        } catch (error) {
          console.error('Error fetching all materials:', error);
          set({ materialsLoading: false });
        }
      },
      
      // Fetch course materials for a specific course
      fetchMaterials: async (courseId: string) => {
        set({ materialsLoading: true });
        try {
          const data = await apiRequest<CourseMaterial[]>(`/materials/course/${courseId}`, {
            method: 'GET',
          });
          set({ materials: data, materialsLoading: false });
        } catch (error) {
          console.error('Error fetching materials:', error);
          set({ materialsLoading: false });
        }
      },
      
      // Fetch student profile (including face descriptor)
      fetchProfile: async () => {
        set({ profileLoading: true });
        try {
          const data = await apiRequest<{ faceDescriptor: string | null }>('/students/me', {
            method: 'GET',
          });
          set({ faceDescriptor: data.faceDescriptor, profileLoading: false });
        } catch (error) {
          console.error('Error fetching profile:', error);
          set({ faceDescriptor: null, profileLoading: false });
        }
      },
      
      // Fetch all data at once
      fetchAllData: async () => {
        const state = get();
        
        // Skip if data already exists
        if (state.courses.length > 0) {
          return;
        }
        
        set({ isInitialLoading: true });
        try {
          // First fetch courses
          await get().fetchCourses();
          
          // Then fetch everything else in parallel (materials needs courses first)
          await Promise.all([
            get().fetchGrades(),
            get().fetchGPA(),
            get().fetchAttendanceStats(),
            get().fetchCourseAttendance(),
            get().fetchAllMaterials(),
            get().fetchProfile(),
          ]);
        } finally {
          set({ isInitialLoading: false });
        }
      },
      
      // Clear store (on logout)
      clearStore: () => {
        set({
          courses: [],
          grades: [],
          gpa: 0,
          attendanceStats: null,
          courseAttendance: [],
          materials: [],
          faceDescriptor: null,
        });
      },
    }),
    {
      name: 'student-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        courses: state.courses,
        grades: state.grades,
        gpa: state.gpa,
        attendanceStats: state.attendanceStats,
        courseAttendance: state.courseAttendance,
        materials: state.materials,
        faceDescriptor: state.faceDescriptor,
      }),
    }
  )
);
