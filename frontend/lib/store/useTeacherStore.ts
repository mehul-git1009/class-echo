import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiRequest } from '@/lib/api';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: string;
  enrollmentCount: number;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email?: string;
  rollNo: string;
  gpa?: number;
  contact?: string;
}

interface CourseEnrollment {
  id: string;
  enrollmentDate: string;
  student: {
    id: string;
    name: string;
    rollNo: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
    description?: string;
    credits?: number;
    semester?: string;
  };
  section?: string;
  grade?: string;
  percentage?: number;
  attendedClasses?: number;
  totalClasses?: number;
  attendancePercentage: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  markedBy: string;
  student: {
    id: string;
    name: string;
    rollNo: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
  };
}

interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  qrCode: string;
  section: string;
  date: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

interface Grade {
  id: string;
  score: number;
  maxScore: number;
  letterGrade: string;
  assessmentType: string;
  assessmentName: string;
  feedback?: string;
  student: {
    id: string;
    name: string;
    rollNo: string;
  };
  course: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: string;
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

interface TeacherState {
  // Data
  courses: Course[];
  students: Student[];
  enrollments: CourseEnrollment[];
  attendanceRecords: AttendanceRecord[];
  attendanceSessions: AttendanceSession[];
  grades: Grade[];
  materials: CourseMaterial[];
  
  // Loading states
  coursesLoading: boolean;
  studentsLoading: boolean;
  enrollmentsLoading: boolean;
  attendanceLoading: boolean;
  sessionsLoading: boolean;
  gradesLoading: boolean;
  materialsLoading: boolean;
  isInitialLoading: boolean;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchStudents: (courseId?: string) => Promise<void>;
  fetchEnrollments: (courseId?: string) => Promise<void>;
  fetchAttendanceRecords: (courseId: string) => Promise<void>;
  fetchAttendanceSessions: () => Promise<void>;
  fetchGrades: (courseId?: string) => Promise<void>;
  fetchMaterials: (courseId: string) => Promise<void>;
  fetchAllMaterials: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  clearStore: () => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
      // Initial state
      courses: [],
      students: [],
      enrollments: [],
      attendanceRecords: [],
      attendanceSessions: [],
      grades: [],
      materials: [],
      
      coursesLoading: false,
      studentsLoading: false,
      enrollmentsLoading: false,
      attendanceLoading: false,
      sessionsLoading: false,
      gradesLoading: false,
      materialsLoading: false,
      isInitialLoading: false,
      
      // Fetch courses taught by teacher
      fetchCourses: async () => {
        if (get().courses.length > 0 && !get().coursesLoading) {
          return;
        }
        
        set({ coursesLoading: true });
        try {
          const data = await apiRequest<Course[]>('/courses/teacher/me', {
            method: 'GET',
          });
          set({ courses: data, coursesLoading: false });
        } catch (error) {
          console.error('Error fetching courses:', error);
          set({ coursesLoading: false });
        }
      },
      
      // Fetch students - get all unique students from all enrollments
      fetchStudents: async (courseId?: string) => {
        set({ studentsLoading: true });
        try {
          // If courseId is provided, get enrollments for that course
          if (courseId) {
            const enrollments = await apiRequest<CourseEnrollment[]>(`/courses/${courseId}/enrollments`, {
              method: 'GET',
            });
            
            // Extract unique student IDs
            const studentIds = Array.from(new Set(enrollments.map(e => e.student.id)));
            
            // Fetch full student details for each student
            const studentsPromises = studentIds.map(id => 
              apiRequest<Student>(`/students/${id}`, { method: 'GET' })
                .catch(err => {
                  console.error(`Error fetching student ${id}:`, err);
                  return null;
                })
            );
            
            const studentsData = await Promise.all(studentsPromises);
            const validStudents = studentsData.filter((s): s is Student => s !== null);
            
            set({ students: validStudents, studentsLoading: false });
          } else {
            // Fetch all students using the /api/students endpoint
            try {
              const allStudents = await apiRequest<Student[]>('/students', {
                method: 'GET',
              });
              set({ students: allStudents, studentsLoading: false });
            } catch (error) {
              console.error('Error fetching all students from /students:', error);
              
              // Fallback: Get all teacher's courses first
              const courses = get().courses.length > 0 
                ? get().courses 
                : await apiRequest<Course[]>('/courses/teacher/me', { method: 'GET' });
              
              // Get enrollments for all courses
              const allEnrollments: CourseEnrollment[] = [];
              for (const course of courses) {
                try {
                  const enrollments = await apiRequest<CourseEnrollment[]>(`/courses/${course.id}/enrollments`, {
                    method: 'GET',
                  });
                  allEnrollments.push(...enrollments);
                } catch (error) {
                  console.error(`Error fetching enrollments for course ${course.id}:`, error);
                }
              }
              
              // Extract unique student IDs
              const studentIds = Array.from(new Set(allEnrollments.map(e => e.student.id)));
              
              // Fetch full student details for each student
              const studentsPromises = studentIds.map(id => 
                apiRequest<Student>(`/students/${id}`, { method: 'GET' })
                  .catch(err => {
                    console.error(`Error fetching student ${id}:`, err);
                    return null;
                  })
              );
              
              const studentsData = await Promise.all(studentsPromises);
              const validStudents = studentsData.filter((s): s is Student => s !== null);
              
              set({ students: validStudents, studentsLoading: false });
            }
          }
        } catch (error) {
          console.error('Error fetching students:', error);
          set({ studentsLoading: false });
        }
      },
      
      // Fetch enrollments - get all enrollments or for specific course
      fetchEnrollments: async (courseId?: string) => {
        set({ enrollmentsLoading: true });
        try {
          if (courseId) {
            // Get enrollments for specific course
            const data = await apiRequest<CourseEnrollment[]>(`/courses/${courseId}/enrollments`, {
              method: 'GET',
            });
            set({ enrollments: data, enrollmentsLoading: false });
          } else {
            // Get enrollments for all teacher's courses
            const courses = get().courses.length > 0 
              ? get().courses 
              : await apiRequest<Course[]>('/courses/teacher/me', { method: 'GET' });
            
            const allEnrollments: CourseEnrollment[] = [];
            for (const course of courses) {
              try {
                const enrollments = await apiRequest<CourseEnrollment[]>(`/courses/${course.id}/enrollments`, {
                  method: 'GET',
                });
                allEnrollments.push(...enrollments);
              } catch (error) {
                console.error(`Error fetching enrollments for course ${course.id}:`, error);
              }
            }
            
            set({ enrollments: allEnrollments, enrollmentsLoading: false });
          }
        } catch (error) {
          console.error('Error fetching enrollments:', error);
          set({ enrollmentsLoading: false });
        }
      },
      
      // Fetch attendance records
      fetchAttendanceRecords: async (courseId: string) => {
        set({ attendanceLoading: true });
        try {
          const data = await apiRequest<AttendanceRecord[]>(`/attendance/course/${courseId}`, {
            method: 'GET',
          });
          set({ attendanceRecords: data, attendanceLoading: false });
        } catch (error) {
          console.error('Error fetching attendance records:', error);
          set({ attendanceLoading: false });
        }
      },
      
      // Fetch attendance sessions (QR codes)
      fetchAttendanceSessions: async () => {
        set({ sessionsLoading: true });
        try {
          const data = await apiRequest<AttendanceSession[]>('/attendance/teacher/me/sessions', {
            method: 'GET',
          });
          set({ attendanceSessions: data, sessionsLoading: false });
        } catch (error) {
          console.error('Error fetching attendance sessions:', error);
          set({ sessionsLoading: false });
        }
      },
      
      // Fetch grades (all or for specific course)
      fetchGrades: async (courseId?: string) => {
        set({ gradesLoading: true });
        try {
          if (courseId) {
            // Get grades for specific course
            const data = await apiRequest<Grade[]>(`/grades/course/${courseId}`, {
              method: 'GET',
            });
            set({ grades: data, gradesLoading: false });
          } else {
            // Get grades for all teacher's courses
            const courses = get().courses.length > 0 
              ? get().courses 
              : await apiRequest<Course[]>('/courses/teacher/me', { method: 'GET' });
            
            const allGrades: Grade[] = [];
            for (const course of courses) {
              try {
                const grades = await apiRequest<Grade[]>(`/grades/course/${course.id}`, {
                  method: 'GET',
                });
                allGrades.push(...grades);
              } catch (error) {
                console.error(`Error fetching grades for course ${course.id}:`, error);
              }
            }
            
            set({ grades: allGrades, gradesLoading: false });
          }
        } catch (error) {
          console.error('Error fetching grades:', error);
          set({ gradesLoading: false });
        }
      },
      
      // Fetch materials for a specific course
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
      
      // Fetch materials for all courses
      fetchAllMaterials: async () => {
        set({ materialsLoading: true });
        try {
          const courses = get().courses;
          if (courses.length === 0) {
            set({ materialsLoading: false });
            return;
          }

          const materialsPromises = courses.map((course) =>
            apiRequest<CourseMaterial[]>(`/materials/course/${course.id}`, {
              method: 'GET',
            }).catch((err) => {
              console.error(`Failed to fetch materials for course ${course.id}:`, err);
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
          
          // Then fetch everything else in parallel
          await Promise.all([
            get().fetchEnrollments(), // Fetch all enrollments first
            get().fetchStudents(),
            get().fetchAttendanceSessions(),
            get().fetchGrades(),
            get().fetchAllMaterials(),
          ]);
        } finally {
          set({ isInitialLoading: false });
        }
      },
      
      // Clear store (on logout)
      clearStore: () => {
        set({
          courses: [],
          students: [],
          enrollments: [],
          attendanceRecords: [],
          attendanceSessions: [],
          grades: [],
          materials: [],
        });
      },
    }),
    {
      name: 'teacher-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        courses: state.courses,
        students: state.students,
        enrollments: state.enrollments,
        attendanceRecords: state.attendanceRecords,
        attendanceSessions: state.attendanceSessions,
        grades: state.grades,
        materials: state.materials,
      }),
    }
  )
);
