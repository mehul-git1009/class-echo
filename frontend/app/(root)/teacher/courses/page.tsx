"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Video,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Target,
  Award,
  Upload,
  Plus,
  Edit,
  RefreshCw,
} from "lucide-react";
import { useTeacherStore } from "@/lib/store/useTeacherStore";

interface CourseWithStats {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: string;
  description?: string;
  totalStudents: number;
  sections: {
    name: string;
    students: number;
  }[];
  performance: {
    averageGrade: number;
    passRate: number;
    averageAttendance: number;
  };
  materials: {
    total: number;
  };
  enrollments: number;
}

const TeachersCourses = () => {
  const [selectedCourse, setSelectedCourse] = useState<CourseWithStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    courses,
    enrollments,
    grades,
    materials,
    fetchCourses,
    fetchEnrollments,
    fetchGrades,
    fetchAllMaterials,
  } = useTeacherStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCourses();
      await Promise.all([
        fetchEnrollments(),
        fetchGrades(),
        fetchAllMaterials(),
      ]);
    } catch (error) {
      console.error("Error refreshing courses data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate course statistics
  const coursesWithStats: CourseWithStats[] = courses.map((course) => {
    // Get enrollments for this course
    const courseEnrollments = enrollments.filter(
      (e) => e.course?.id === course.id
    );

    // Get grades for this course
    const courseGrades = grades.filter((g) => g.course?.id === course.id);

    // Get materials for this course
    const courseMaterials = materials.filter(
      (m) => m.course?.id === course.id
    );

    // Group enrollments by section
    const sectionMap = new Map<string, number>();
    courseEnrollments.forEach((enrollment) => {
      const section = enrollment.section || "Default";
      sectionMap.set(section, (sectionMap.get(section) || 0) + 1);
    });

    const sections = Array.from(sectionMap.entries()).map(([name, students]) => ({
      name,
      students,
    }));

    // Calculate average grade
    const averageGrade =
      courseGrades.length > 0
        ? courseGrades.reduce((sum, g) => {
            if (g.maxScore && g.maxScore > 0) {
              return sum + (g.score / g.maxScore) * 100;
            }
            return sum;
          }, 0) / courseGrades.length
        : 0;

    // Calculate pass rate (assuming 40% is passing)
    const passingGrades = courseGrades.filter((g) => {
      if (g.maxScore && g.maxScore > 0) {
        return (g.score / g.maxScore) * 100 >= 40;
      }
      return false;
    });
    const passRate =
      courseGrades.length > 0
        ? (passingGrades.length / courseGrades.length) * 100
        : 0;

    // Calculate average attendance from enrollments
    const averageAttendance =
      courseEnrollments.length > 0
        ? courseEnrollments.reduce(
            (sum, e) => sum + (e.attendancePercentage || 0),
            0
          ) / courseEnrollments.length
        : 0;

    return {
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      semester: course.semester,
      description: course.description,
      totalStudents: courseEnrollments.length,
      sections,
      performance: {
        averageGrade: Math.round(averageGrade * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        averageAttendance: Math.round(averageAttendance * 10) / 10,
      },
      materials: {
        total: courseMaterials.length,
      },
      enrollments: courseEnrollments.length,
    };
  });

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">
              <BookOpen className="inline-block w-6 h-6 mr-2 text-amber-200" />
              My <span className="font-medium text-amber-200">Courses</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-1">
              {coursesWithStats.length} courses • {coursesWithStats.reduce((acc, c) => acc + c.totalStudents, 0)} total students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="h-10 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="h-10 bg-amber-200 hover:bg-amber-300 text-black font-medium">
              <Plus className="w-4 h-4 mr-2" />
              Add Course Material
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-6 p-6">
        {/* Left Column - Courses List */}
        <div className="w-[400px] flex flex-col overflow-hidden min-h-0">
          <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
            <div className="px-6 py-5 border-b border-neutral-800/50 shrink-0">
              <h3 className="text-white font-semibold">Teaching Courses</h3>
              <p className="text-sm text-neutral-500 mt-1">Fall 2025 Semester</p>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 space-y-3">
                {coursesWithStats.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-400">No courses found</p>
                    <p className="text-neutral-600 text-sm mt-1">
                      Courses you teach will appear here
                    </p>
                  </div>
                ) : (
                  coursesWithStats.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      onClick={() => setSelectedCourse(course)}
                      className={`p-5 cursor-pointer transition-all ${
                        selectedCourse?.id === course.id
                          ? "bg-amber-200/10 border-amber-200/50 shadow-lg shadow-amber-200/10"
                          : "bg-black/40 border-neutral-800/50 hover:border-amber-200/30"
                      }`}
                    >
                      {/* Course Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 text-xs">
                              {course.code}
                            </Badge>
                            <Badge className="bg-neutral-800/50 text-neutral-400 border-neutral-700 text-xs">
                              {course.credits} Credits
                            </Badge>
                          </div>
                          <h3 className="text-white font-semibold text-sm mb-2">
                            {course.name}
                          </h3>
                        </div>
                      </div>

                      {/* Sections */}
                      <div className="mb-3 space-y-1.5">
                        {course.sections.length > 0 ? (
                          course.sections.map((section, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-neutral-500">{section.name}</span>
                              <Badge className="bg-neutral-900/50 text-neutral-400 text-xs">
                                {section.students} students
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-neutral-600">
                            No sections
                          </div>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-neutral-800/50">
                        <div>
                          <p className="text-neutral-500 mb-1">Avg Grade</p>
                          <p className="text-white font-semibold">
                            {course.performance.averageGrade > 0 
                              ? `${course.performance.averageGrade}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500 mb-1">Attendance</p>
                          <p className="text-white font-semibold">
                            {course.performance.averageAttendance > 0
                              ? `${course.performance.averageAttendance}%`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Materials Count */}
                      {course.materials.total > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-blue-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{course.materials.total} materials uploaded</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Column - Course Details */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div
                key={selectedCourse.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden min-h-0"
              >
                <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
                  {/* Course Details Header */}
                  <div className="px-6 py-5 border-b border-neutral-800/50 shrink-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
                            {selectedCourse.code}
                          </Badge>
                          <Badge className="bg-neutral-800/50 text-neutral-400 border-neutral-700">
                            {selectedCourse.credits} Credits
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {selectedCourse.semester}
                          </Badge>
                        </div>
                        <h2 className="text-white text-xl font-semibold mb-1">
                          {selectedCourse.name}
                        </h2>
                        <p className="text-sm text-neutral-500">
                          {selectedCourse.sections.length} sections • {selectedCourse.totalStudents} students
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="h-9 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
                      >
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Edit Course
                      </Button>
                    </div>

                    {/* Performance Overview */}
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 bg-black/40 border-neutral-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-200/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-amber-200" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Avg Grade</p>
                            <p className="text-xl font-bold text-white">
                              {selectedCourse.performance.averageGrade}%
                            </p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-black/40 border-neutral-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Pass Rate</p>
                            <p className="text-xl font-bold text-white">
                              {selectedCourse.performance.passRate}%
                            </p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-black/40 border-neutral-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-500">Attendance</p>
                            <p className="text-xl font-bold text-white">
                              {selectedCourse.performance.averageAttendance}%
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-6 space-y-6">
                      {/* Course Description */}
                      {selectedCourse.description && (
                        <Card className="p-5 bg-black/40 border-neutral-800/50">
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-amber-200" />
                            Course Description
                          </h3>
                          <p className="text-neutral-400 text-sm leading-relaxed">
                            {selectedCourse.description}
                          </p>
                        </Card>
                      )}

                      {/* Sections Breakdown */}
                      {selectedCourse.sections.length > 0 && (
                        <Card className="p-5 bg-black/40 border-neutral-800/50">
                          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-200" />
                            Sections ({selectedCourse.sections.length})
                          </h3>
                          <div className="space-y-3">
                            {selectedCourse.sections.map((section, idx) => (
                              <Card 
                                key={idx}
                                className="p-4 bg-neutral-900/50 border-neutral-800/50"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-medium">{section.name}</p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                      Active section
                                    </p>
                                  </div>
                                  <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
                                    {section.students} students
                                  </Badge>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Course Materials */}
                      <Card className="p-5 bg-black/40 border-neutral-800/50">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Upload className="w-5 h-5 text-amber-200" />
                          Course Materials
                        </h3>
                        <Card className="p-6 bg-neutral-900/50 border-neutral-800/50 text-center">
                          <FileText className="w-12 h-12 text-amber-200/50 mx-auto mb-3" />
                          <p className="text-2xl font-bold text-white mb-1">
                            {selectedCourse.materials.total}
                          </p>
                          <p className="text-sm text-neutral-500">
                            Total materials uploaded
                          </p>
                        </Card>
                      </Card>

                      {/* Student Enrollments */}
                      <Card className="p-5 bg-black/40 border-neutral-800/50">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-amber-200" />
                          Student Enrollments
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 bg-neutral-900/50 border-neutral-800/50 text-center">
                            <p className="text-3xl font-bold text-white mb-1">
                              {selectedCourse.totalStudents}
                            </p>
                            <p className="text-xs text-neutral-500">Total Students</p>
                          </Card>
                          <Card className="p-4 bg-amber-200/10 border border-amber-200/30 text-center">
                            <p className="text-3xl font-bold text-amber-200 mb-1">
                              {selectedCourse.enrollments}
                            </p>
                            <p className="text-xs text-neutral-500">Active Enrollments</p>
                          </Card>
                        </div>
                      </Card>

                      {/* Quick Actions */}
                      <Card className="p-5 bg-black/40 border-neutral-800/50">
                        <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline"
                            className="h-12 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50 justify-start"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            View Schedule
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-12 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50 justify-start"
                          >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-12 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50 justify-start"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Material
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-12 border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50 justify-start"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Manage Grades
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </ScrollArea>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center"
              >
                <Card className="p-16 bg-neutral-950/50 border-neutral-800/50 text-center">
                  <BookOpen className="w-20 h-20 text-neutral-700 mx-auto mb-6" />
                  <p className="text-neutral-400 text-lg mb-2 font-medium">
                    Select a course to view details
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Choose from the list to see course insights and manage materials
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TeachersCourses;