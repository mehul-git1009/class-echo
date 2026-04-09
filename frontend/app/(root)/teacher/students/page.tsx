"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Search,
  Mail,
  BookOpen,
  TrendingUp,
  User,
  Grid3x3,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Plus,
  Loader2,
} from "lucide-react";
import { useTeacherStore } from "@/lib/store/useTeacherStore";
import { submitGrade, AssessmentType } from "@/lib/api/grades";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

interface StudentWithCourse {
  id: string;
  name: string;
  rollNo: string;
  email?: string;
  gpa?: number;
  contact?: string;
  attendancePercentage?: number;
  grade?: string;
  courseId?: string;
}

interface StudentDetails {
  id: string;
  name: string;
  email?: string;
  rollNo: string;
  gpa?: number;
  contact?: string;
  enrollments: Array<{
    courseCode: string;
    courseName: string;
    attendancePercentage: number;
    grade?: string;
  }>;
  grades: Array<{
    courseName: string;
    assessmentName: string;
    assessmentType: string;
    score: number;
    maxScore: number;
    letterGrade: string;
  }>;
}

const TeachersStudents = () => {
  const { courses, students, enrollments, grades, fetchGrades } = useTeacherStore();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add Grade Dialog State
  const [showAddGradeDialog, setShowAddGradeDialog] = useState(false);
  const [addGradeLoading, setAddGradeLoading] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    courseId: "",
    assessmentType: AssessmentType.QUIZ,
    assessmentName: "",
    score: "",
    maxScore: "",
    feedback: "",
  });

  // Get students for selected course with attendance info
  const courseStudents: StudentWithCourse[] = selectedCourse
    ? enrollments
        .filter((e) => e.course?.id === selectedCourse)
        .map((e) => {
          // Find the full student data from the students array
          const fullStudent = students.find((s) => s.id === e.student?.id);
          return {
            id: e.student?.id || '',
            name: e.student?.name || 'Unknown',
            rollNo: e.student?.rollNo || 'N/A',
            email: fullStudent?.email,
            gpa: fullStudent?.gpa,
            contact: fullStudent?.contact,
            attendancePercentage: e.attendancePercentage || 0,
            grade: e.grade,
            courseId: e.course?.id,
          };
        })
    : students.map((s) => ({
        id: s.id,
        name: s.name,
        rollNo: s.rollNo,
        email: s.email,
        gpa: s.gpa,
        contact: s.contact,
        attendancePercentage: undefined,
        grade: undefined,
        courseId: undefined,
      }));

  // Filter students based on search
  const filteredStudents = courseStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  // Get student details when selected
  const getStudentDetails = (studentId: string): StudentDetails | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const studentEnrollments = enrollments
      .filter((e) => e.student?.id === studentId)
      .map((e) => ({
        courseCode: e.course?.code || 'N/A',
        courseName: e.course?.name || 'Unknown Course',
        attendancePercentage: e.attendancePercentage || 0,
        grade: e.grade,
      }));

    const studentGrades = grades
      .filter((g) => g.student?.id === studentId)
      .map((g) => ({
        courseName: g.course?.name || 'Unknown Course',
        assessmentName: g.assessmentName || 'Assessment',
        assessmentType: g.assessmentType || 'Test',
        score: g.score || 0,
        maxScore: g.maxScore || 100,
        letterGrade: g.letterGrade || 'N/A',
      }));

    return {
      ...student,
      enrollments: studentEnrollments,
      grades: studentGrades,
    };
  };

  const handleStudentSelect = (studentId: string) => {
    const details = getStudentDetails(studentId);
    setSelectedStudent(details);
  };

  // Handle Add Grade
  const handleAddGrade = () => {
    if (!selectedStudent) return;
    
    // Pre-fill course if viewing from a specific course
    setGradeForm({
      courseId: selectedCourse || "",
      assessmentType: AssessmentType.QUIZ,
      assessmentName: "",
      score: "",
      maxScore: "100",
      feedback: "",
    });
    setShowAddGradeDialog(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedStudent) return;
    
    // Validate form
    if (!gradeForm.courseId || !gradeForm.assessmentName || !gradeForm.score || !gradeForm.maxScore) {
      toast.error("Please fill in all required fields");
      return;
    }

    setAddGradeLoading(true);
    try {
      await submitGrade(
        selectedStudent.id,
        gradeForm.courseId,
        gradeForm.assessmentType,
        gradeForm.assessmentName,
        Number(gradeForm.score),
        Number(gradeForm.maxScore),
        gradeForm.feedback || undefined
      );
      
      // Refetch grades to get the latest data including the new grade
      await fetchGrades();
      
      // Update student details with fresh data from store
      const updatedDetails = getStudentDetails(selectedStudent.id);
      setSelectedStudent(updatedDetails);
      
      // Close dialog and reset form
      setShowAddGradeDialog(false);
      setGradeForm({
        courseId: "",
        assessmentType: AssessmentType.QUIZ,
        assessmentName: "",
        score: "",
        maxScore: "",
        feedback: "",
      });
      
      toast.success("Grade added successfully!");
    } catch (error: any) {
      toast.error(`Failed to add grade: ${error.response?.data?.message || error.message || "Please try again."}`);
    } finally {
      setAddGradeLoading(false);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get GPA color
  const getGPAColor = (gpa: number) => {
    if (gpa >= 9) return "text-green-400";
    if (gpa >= 8) return "text-amber-200";
    if (gpa >= 7) return "text-blue-400";
    return "text-neutral-400";
  };

  // Get attendance color
  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "text-green-400";
    if (attendance >= 75) return "text-amber-200";
    if (attendance >= 60) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden text-[90%]">{/* Header */}
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800/50 shrink-0 bg-gradient-to-r from-amber-200/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">
              <Users className="inline-block w-6 h-6 mr-2 text-amber-200" />
              Students <span className="font-medium text-amber-200">Directory</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-1">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} •{" "}
              {selectedCourse ? courses.find((c) => c.id === selectedCourse)?.name : "All Courses"}
            </p>
          </div>
          {selectedCourse && (
            <Button
              onClick={() => {
                setSelectedCourse(null);
                setSelectedStudent(null);
                setSearchQuery("");
              }}
              variant="outline"
              className="h-9 text-xs border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50 hover:bg-amber-200/5"
            >
              View All Students
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!selectedCourse ? (
          /* Course Selection View */
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
              <div className="px-6 py-4 border-b border-neutral-800/50 shrink-0">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-amber-200" />
                  Select a Course
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Choose a course to view enrolled students
                </p>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 grid grid-cols-3 gap-4">
                  {courses.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                      <BookOpen className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-400">No courses found</p>
                    </div>
                  ) : (
                    courses.map((course, idx) => {
                      const courseEnrollments = enrollments.filter(
                        (e) => e.course?.id === course.id
                      );
                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card
                            onClick={() => setSelectedCourse(course.id)}
                            className="p-4 bg-black/40 border-neutral-800/50 hover:border-amber-200/50 hover:bg-amber-200/5 cursor-pointer transition-all group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-200/20 flex items-center justify-center group-hover:bg-amber-200/30 transition-colors">
                                <BookOpen className="w-5 h-5 text-amber-200" />
                              </div>
                              <Badge className="bg-neutral-800/50 text-neutral-400 border-neutral-700 text-xs">
                                {courseEnrollments.length}
                              </Badge>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">
                              {course.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 text-xs">
                                {course.code}
                              </Badge>
                              <Badge className="bg-neutral-800/50 text-neutral-400 border-neutral-700 text-xs">
                                {course.credits} Credits
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-3 pt-3 border-t border-neutral-800/50">
                              <Clock className="w-3 h-3" />
                              <span className="truncate">{course.semester}</span>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        ) : (
          /* Students List View */
          <div className="flex-1 flex gap-6 p-6 overflow-hidden">
            {/* Left - Students List */}
            <div className="w-[400px] flex flex-col overflow-hidden min-h-0">
              <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
                {/* Header */}
                <div className="px-5 py-4 border-b border-neutral-800/50 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-base">
                        {courses.find((c) => c.id === selectedCourse)?.name}
                      </h3>
                      <p className="text-neutral-500 text-xs">
                        {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                      placeholder="Search by name, roll no, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm bg-black/40 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-amber-200/50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Students List */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-2">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                        <p className="text-neutral-400 text-sm">No students found</p>
                      </div>
                    ) : (
                      filteredStudents.map((student, idx) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <Card
                            onClick={() => handleStudentSelect(student.id)}
                            className={`p-3 cursor-pointer transition-all ${
                              selectedStudent?.id === student.id
                                ? "bg-amber-200/10 border-amber-200/50 shadow-lg shadow-amber-200/10"
                                : "bg-black/40 border-neutral-800/50 hover:border-amber-200/30 hover:bg-amber-200/5"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-amber-200/20 flex items-center justify-center shrink-0">
                                <span className="text-amber-200 font-semibold text-xs">
                                  {getInitials(student.name)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold text-sm mb-0.5 truncate">
                                  {student.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                  <span>{student.rollNo}</span>
                                  {student.gpa !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span className={getGPAColor(student.gpa)}>
                                        {student.gpa.toFixed(2)}/10 GPA
                                      </span>
                                    </>
                                  )}
                                </div>
                                {student.attendancePercentage !== undefined && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${
                                          student.attendancePercentage >= 75
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                        } transition-all`}
                                        style={{ width: `${student.attendancePercentage}%` }}
                                      />
                                    </div>
                                    <span
                                      className={`text-xs font-medium ${getAttendanceColor(
                                        student.attendancePercentage
                                      )}`}
                                    >
                                      {student.attendancePercentage.toFixed(0)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            {/* Right - Student Profile */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <AnimatePresence mode="wait">
                {selectedStudent ? (
                  <motion.div
                    key={selectedStudent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col overflow-hidden min-h-0"
                  >
                    <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
                      {/* Profile Header */}
                      <div className="px-6 py-4 border-b border-neutral-800/50 shrink-0 bg-gradient-to-r from-amber-200/5 to-transparent">
                        <div className="flex items-start gap-5">
                          <div className="w-16 h-16 rounded-full bg-amber-200/20 flex items-center justify-center shrink-0">
                            <span className="text-amber-200 font-bold text-xl">
                              {getInitials(selectedStudent.name)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1">
                                <h2 className="text-white text-xl font-semibold mb-1">
                                  {selectedStudent.name}
                                </h2>
                                <p className="text-neutral-500 text-xs mb-3">
                                  {selectedStudent.rollNo}
                                  {selectedStudent.email && ` • ${selectedStudent.email}`}
                                </p>
                              </div>
                              <Button
                                onClick={handleAddGrade}
                                className="h-9 bg-amber-200 hover:bg-amber-300 text-black font-medium text-xs"
                              >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Grade
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              {selectedStudent.gpa !== undefined && (
                                <div>
                                  <p className="text-xs text-neutral-500">CGPA</p>
                                  <p
                                    className={`text-lg font-bold ${getGPAColor(
                                      selectedStudent.gpa
                                    )}`}
                                  >
                                    {selectedStudent.gpa.toFixed(2)}/10
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-neutral-500">Courses</p>
                                <p className="text-lg font-bold text-white">
                                  {selectedStudent.enrollments.length}
                                </p>
                              </div>
                              <div className="h-8 w-px bg-neutral-800" />
                              <div>
                                <p className="text-xs text-neutral-500">Assessments</p>
                                <p className="text-lg font-bold text-white">
                                  {selectedStudent.grades.length}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Details - Scrollable */}
                      <ScrollArea className="flex-1 min-h-0">
                        <div className="p-6 space-y-5">
                          {/* Contact Information */}
                          <Card className="p-4 bg-black/40 border-neutral-800/50">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-amber-200" />
                              Contact Information
                            </h3>
                            <div className="space-y-2.5">
                              {selectedStudent.email && (
                                <div className="flex items-start gap-2.5">
                                  <div className="w-5 h-5 rounded bg-neutral-800/50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Mail className="w-3 h-3 text-neutral-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-neutral-500">Email</p>
                                    <p className="text-sm text-white break-all">
                                      {selectedStudent.email}
                                    </p>
                                  </div>
                                </div>
                              )}
                              {selectedStudent.contact && (
                                <div className="flex items-start gap-2.5">
                                  <div className="w-5 h-5 rounded bg-neutral-800/50 flex items-center justify-center shrink-0 mt-0.5">
                                    <Users className="w-3 h-3 text-neutral-500" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-neutral-500">Contact</p>
                                    <p className="text-sm text-white">{selectedStudent.contact}</p>
                                  </div>
                                </div>
                              )}
                              {!selectedStudent.email && !selectedStudent.contact && (
                                <div className="text-center py-4">
                                  <p className="text-neutral-500 text-xs">No contact information available</p>
                                </div>
                              )}
                            </div>
                          </Card>

                          {/* Enrolled Courses */}
                          <Card className="p-4 bg-black/40 border-neutral-800/50">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                              <BookOpen className="w-4 h-4 text-amber-200" />
                              Enrolled Courses ({selectedStudent.enrollments.length})
                            </h3>
                            {selectedStudent.enrollments.length === 0 ? (
                              <div className="text-center py-6">
                                <BookOpen className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                                <p className="text-neutral-500 text-xs">No enrollments</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {selectedStudent.enrollments.map((enrollment, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 bg-neutral-900/50 border border-neutral-800/50 rounded-lg"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="text-sm text-white font-medium line-clamp-1">
                                          {enrollment.courseName}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                          {enrollment.courseCode}
                                        </p>
                                      </div>
                                      {enrollment.grade && (
                                        <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 text-xs ml-2">
                                          {enrollment.grade}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${
                                            enrollment.attendancePercentage >= 75
                                              ? "bg-green-500"
                                              : "bg-red-500"
                                          } transition-all`}
                                          style={{
                                            width: `${enrollment.attendancePercentage}%`,
                                          }}
                                        />
                                      </div>
                                      <span
                                        className={`text-xs font-medium ${getAttendanceColor(
                                          enrollment.attendancePercentage
                                        )}`}
                                      >
                                        {enrollment.attendancePercentage.toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card>

                          {/* Academic Performance */}
                          <Card className="p-4 bg-black/40 border-neutral-800/50">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
                              <BarChart3 className="w-4 h-4 text-amber-200" />
                              Academic Performance ({selectedStudent.grades.length})
                            </h3>
                            {selectedStudent.grades.length === 0 ? (
                              <div className="text-center py-6">
                                <TrendingUp className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                                <p className="text-neutral-500 text-xs">No grades recorded</p>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {selectedStudent.grades.map((grade, idx) => (
                                  <div key={idx} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm text-white font-medium">
                                          {grade.assessmentName}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                          {grade.courseName} • {grade.assessmentType}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-3">
                                        <span className="text-sm text-white font-semibold">
                                          {grade.score}/{grade.maxScore}
                                        </span>
                                        <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 text-xs">
                                          {grade.letterGrade}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-amber-200 rounded-full transition-all"
                                        style={{
                                          width: `${(grade.score / grade.maxScore) * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
                    <Card className="p-12 bg-neutral-950/50 border-neutral-800/50 text-center">
                      <User className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-400 text-base mb-1 font-medium">
                        Select a student
                      </p>
                      <p className="text-neutral-600 text-xs">
                        Choose from the list to view their profile
                      </p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Add Grade Dialog */}
      <Dialog open={showAddGradeDialog} onOpenChange={setShowAddGradeDialog}>
        <DialogContent className="bg-neutral-950 border-neutral-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Add Grade</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Add a new grade for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm text-neutral-300">
                Course *
              </Label>
              <select
                id="course"
                value={gradeForm.courseId}
                onChange={(e) => setGradeForm({ ...gradeForm, courseId: e.target.value })}
                className="w-full h-10 px-3 bg-black/40 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-200/50 focus:outline-none"
                required
              >
                <option value="">Select a course</option>
                {selectedStudent?.enrollments.map((enrollment) => (
                  <option
                    key={enrollment.courseCode}
                    value={courses.find(c => c.code === enrollment.courseCode)?.id}
                  >
                    {enrollment.courseCode} - {enrollment.courseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Type */}
            <div className="space-y-2">
              <Label htmlFor="assessmentType" className="text-sm text-neutral-300">
                Assessment Type *
              </Label>
              <select
                id="assessmentType"
                value={gradeForm.assessmentType}
                onChange={(e) => setGradeForm({ ...gradeForm, assessmentType: e.target.value as AssessmentType })}
                className="w-full h-10 px-3 bg-black/40 border border-neutral-800 rounded-lg text-white text-sm focus:border-amber-200/50 focus:outline-none"
              >
                {Object.values(AssessmentType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Name */}
            <div className="space-y-2">
              <Label htmlFor="assessmentName" className="text-sm text-neutral-300">
                Assessment Name *
              </Label>
              <Input
                id="assessmentName"
                value={gradeForm.assessmentName}
                onChange={(e) => setGradeForm({ ...gradeForm, assessmentName: e.target.value })}
                placeholder="e.g., Midterm Exam, Assignment 1"
                className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-amber-200/50"
                required
              />
            </div>

            {/* Score and Max Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score" className="text-sm text-neutral-300">
                  Score *
                </Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  placeholder="85"
                  className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-amber-200/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxScore" className="text-sm text-neutral-300">
                  Max Score *
                </Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="1"
                  value={gradeForm.maxScore}
                  onChange={(e) => setGradeForm({ ...gradeForm, maxScore: e.target.value })}
                  placeholder="100"
                  className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-amber-200/50"
                  required
                />
              </div>
            </div>

            {/* Feedback (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-sm text-neutral-300">
                Feedback (Optional)
              </Label>
              <textarea
                id="feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder="Add comments or feedback..."
                rows={3}
                className="w-full px-3 py-2 bg-black/40 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-amber-200/50 focus:outline-none resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddGradeDialog(false)}
              className="border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
              disabled={addGradeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitGrade}
              disabled={addGradeLoading}
              className="bg-amber-200 hover:bg-amber-300 text-black font-medium"
            >
              {addGradeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeachersStudents;