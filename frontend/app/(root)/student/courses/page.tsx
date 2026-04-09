"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
  TrendingUp,
  Award,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  Target,
  Sparkles,
  BarChart3,
  Activity,
} from "lucide-react";
import { useStudentStore } from "@/lib/store/useStudentStore";

const StudentsCourses = () => {
  const { courses, gpa, attendanceStats, courseAttendance, grades, materials } =
    useStudentStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Set first course as default when courses load
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].course.id);
    }
  }, [courses, selectedCourseId]);

  // Get selected course details
  const selectedCourse = courses.find((c) => c.course.id === selectedCourseId);
  const selectedCourseAttendance = courseAttendance.find(
    (ca) => ca.id === selectedCourseId
  );
  const selectedCourseMaterials = materials.filter(
    (m) => m.course.id === selectedCourseId
  );

  // Filter grades by matching course code (since grades DTO has course code, not ID)
  const selectedCourseGrades = grades.filter((g) => {
    if (!g.course || !selectedCourse) return false;
    return g.course.code === selectedCourse.course.code;
  });

  // Calculate average grade for selected course
  const averageGrade =
    selectedCourseGrades.length > 0
      ? selectedCourseGrades.reduce(
          (acc, g) => acc + (g.score / g.assessment.maxScore) * 100,
          0
        ) / selectedCourseGrades.length
      : 0;

  const totalCredits = courses.reduce((acc, c) => acc + c.course.credits, 0);

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden text-[90%]">
      {/* Enhanced Hero Header */}
      <div className="relative px-6 py-6 border-b border-neutral-800/50 shrink-0 bg-gradient-to-br from-amber-200/5 via-black to-black">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/5 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-200/20 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-amber-200" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    My <span className="text-amber-200">Courses</span>
                  </h1>
                  <p className="text-neutral-400 text-sm mt-1">
                    {courses.length} courses enrolled • {totalCredits} total
                    credits •{" "}
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="px-5 py-3 bg-gradient-to-br from-amber-200/10 to-amber-200/5 border-amber-200/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-200/20 rounded-xl">
                      <GraduationCap className="w-4 h-4 text-amber-200" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">
                        Overall GPA
                      </p>
                      <p className="text-xl font-bold text-amber-200">
                        {(gpa || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="px-5 py-3 bg-gradient-to-br from-green-400/10 to-green-400/5 border-green-400/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-400/20 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">
                        Attendance
                      </p>
                      <p className="text-xl font-bold text-green-400">
                        {attendanceStats
                          ? `${attendanceStats.percentage.toFixed(0)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="px-5 py-3 bg-gradient-to-br from-blue-400/10 to-blue-400/5 border-blue-400/30 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-400/20 rounded-xl">
                      <Award className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 mb-0.5">
                        Assessments
                      </p>
                      <p className="text-xl font-bold text-blue-400">
                        {grades.length}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Sidebar - Courses List */}
          <div className="col-span-4 flex flex-col h-[calc(100vh-280px)]">
            <Card className="flex-1 bg-neutral-950/80 border-neutral-800/50 flex flex-col h-full overflow-y-auto">
              <div className="p-4 border-b border-neutral-800/50 shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-200" />
                    Active Courses
                  </h2>
                  <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
                    {courses.length}
                  </Badge>
                </div>
              </div>

              <div className="flex-1">
                <div className="p-3 space-y-2.5">
                  {courses.map((enrollment, idx) => {
                    const courseAtt = courseAttendance.find(
                      (ca) => ca.id === enrollment.course.id
                    );
                    const isSelected =
                      selectedCourseId === enrollment.course.id;

                    return (
                      <motion.div
                        key={enrollment.course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card
                          onClick={() =>
                            setSelectedCourseId(enrollment.course.id)
                          }
                          className={`p-4 cursor-pointer transition-all group ${
                            isSelected
                              ? "bg-gradient-to-br from-amber-200/15 to-amber-200/5 border-amber-200/50 shadow-lg shadow-amber-200/10"
                              : "bg-neutral-900/50 border-neutral-800/50 hover:border-amber-200/30 hover:bg-neutral-900/80"
                          }`}
                        >
                          {/* Course Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  className={`text-xs font-semibold ${
                                    isSelected
                                      ? "bg-amber-200/30 text-amber-200 border-amber-200/50"
                                      : "bg-amber-200/20 text-amber-200 border-amber-200/30"
                                  }`}
                                >
                                  {enrollment.course.code}
                                </Badge>
                                <Badge className="bg-neutral-800/80 text-neutral-300 text-xs border-neutral-700">
                                  {enrollment.course.credits} CR
                                </Badge>
                              </div>
                              <h3
                                className={`font-semibold text-sm mb-1 transition-colors ${
                                  isSelected
                                    ? "text-amber-200"
                                    : "text-white group-hover:text-amber-200"
                                }`}
                              >
                                {enrollment.course.name}
                              </h3>
                              <p className="text-neutral-500 text-xs">
                                {enrollment.course.semester}
                              </p>
                            </div>
                            <Badge
                              className={`text-xs capitalize shrink-0 ${
                                enrollment.status === "active"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-neutral-800/50 text-neutral-400 border-neutral-700"
                              }`}
                            >
                              {enrollment.status}
                            </Badge>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1.5 text-xs">
                              <FileText className="w-3.5 h-3.5 text-neutral-500" />
                              <span className="text-neutral-400">
                                {
                                  materials.filter(
                                    (m) => m.course.id === enrollment.course.id
                                  ).length
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <Award className="w-3.5 h-3.5 text-neutral-500" />
                              <span className="text-neutral-400">
                                {
                                  grades.filter(
                                    (g) =>
                                      g.course &&
                                      g.course.code === enrollment.course.code
                                  ).length
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs ml-auto">
                              <Clock className="w-3.5 h-3.5 text-neutral-500" />
                              <span className="text-neutral-400">
                                {new Date(
                                  enrollment.enrollmentDate
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Attendance Progress */}
                          {courseAtt && (
                            <div className="pt-3 border-t border-neutral-800/50">
                              <div className="flex items-center justify-between text-xs mb-2">
                                <span className="text-neutral-400">
                                  Attendance
                                </span>
                                <span
                                  className={`font-bold ${
                                    courseAtt.percentage >= 75
                                      ? "text-green-400"
                                      : courseAtt.percentage >= 60
                                      ? "text-amber-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {courseAtt.percentage.toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${courseAtt.percentage}%`,
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    delay: idx * 0.1,
                                  }}
                                  className={`h-full rounded-full ${
                                    courseAtt.percentage >= 75
                                      ? "bg-gradient-to-r from-green-400 to-green-500"
                                      : courseAtt.percentage >= 60
                                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                      : "bg-gradient-to-r from-red-400 to-red-500"
                                  }`}
                                />
                              </div>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Content - Course Details */}
          <div className="col-span-8 flex flex-col h-[calc(100vh-280px)]">
            <AnimatePresence mode="wait">
              {selectedCourse ? (
                <motion.div
                  key={selectedCourse.course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col h-full"
                >
                  <Card className="flex-1 bg-neutral-950/80 border-neutral-800/50 flex flex-col h-full overflow-y-auto">
                    {/* Course Header - Now scrolls with content */}
                    <div className="px-8 py-6 border-b border-neutral-800/50 bg-gradient-to-br from-amber-200/10 via-transparent to-transparent">
                      <div className="w-64 h-64 bg-amber-200/5 rounded-full blur-3xl absolute top-0 right-0" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 font-semibold">
                                {selectedCourse.course.code}
                              </Badge>
                              <Badge className="bg-neutral-800/50 text-neutral-300 border-neutral-700">
                                {selectedCourse.course.credits} Credits
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {selectedCourse.course.semester}
                              </Badge>
                              <Badge
                                className={`capitalize ${
                                  selectedCourse.status === "active"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-neutral-800/50 text-neutral-400 border-neutral-700"
                                }`}
                              >
                                {selectedCourse.status}
                              </Badge>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                              {selectedCourse.course.name}
                            </h2>
                            {selectedCourse.course.description && (
                              <p className="text-sm text-neutral-400 leading-relaxed max-w-3xl">
                                {selectedCourse.course.description}
                              </p>
                            )}
                          </div>
                          <div className="p-4 bg-gradient-to-br from-amber-200/10 to-transparent border border-amber-200/20 rounded-2xl">
                            <Sparkles className="w-8 h-8 text-amber-200" />
                          </div>
                        </div>

                        {/* Quick Metrics Row */}
                        <div className="grid grid-cols-4 gap-3">
                          <Card className="p-4 bg-gradient-to-br from-amber-200/10 to-transparent border-amber-200/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-200/20 rounded-lg">
                                <Target className="w-4 h-4 text-amber-200" />
                              </div>
                              <div>
                                <p className="text-xs text-neutral-400">
                                  Materials
                                </p>
                                <p className="text-xl font-bold text-white">
                                  {selectedCourseMaterials.length}
                                </p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Award className="w-4 h-4 text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-neutral-400">
                                  Assessments
                                </p>
                                <p className="text-xl font-bold text-white">
                                  {selectedCourseGrades.length}
                                </p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-500/20 rounded-lg">
                                <BarChart3 className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-neutral-400">
                                  Avg Score
                                </p>
                                <p className="text-xl font-bold text-green-400">
                                  {averageGrade > 0
                                    ? `${averageGrade.toFixed(0)}%`
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-500/20 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-amber-400" />
                              </div>
                              <div>
                                <p className="text-xs text-neutral-400">
                                  Attendance
                                </p>
                                <p
                                  className={`text-xl font-bold ${
                                    selectedCourseAttendance
                                      ? selectedCourseAttendance.percentage >=
                                        75
                                        ? "text-green-400"
                                        : "text-red-400"
                                      : "text-neutral-500"
                                  }`}
                                >
                                  {selectedCourseAttendance
                                    ? `${selectedCourseAttendance.percentage.toFixed(
                                        0
                                      )}%`
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>

                    {/* Content - scrolls with header since Card has overflow-y-auto */}
                    <div className="p-6 space-y-6">
                      {/* Attendance Visualization */}
                        {selectedCourseAttendance && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Card className="p-6 bg-gradient-to-br from-neutral-900/80 to-neutral-950/50 border-neutral-800/50">
                              <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-green-400" />
                                  Attendance Overview
                                </h3>
                                <Badge
                                  className={`${
                                    selectedCourseAttendance.status === "good"
                                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                                      : selectedCourseAttendance.status ===
                                        "warning"
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                      : "bg-red-500/20 text-red-400 border-red-500/30"
                                  }`}
                                >
                                  {selectedCourseAttendance.status === "good"
                                    ? "Excellent"
                                    : selectedCourseAttendance.status ===
                                      "warning"
                                    ? "At Risk"
                                    : "Critical"}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-black/40 rounded-xl border border-neutral-800/50">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    </div>
                                    <p className="text-sm text-neutral-400">
                                      Classes Attended
                                    </p>
                                  </div>
                                  <p className="text-3xl font-bold text-green-400">
                                    {selectedCourseAttendance.attended}
                                  </p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-xl border border-neutral-800/50">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                      <Calendar className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-neutral-400">
                                      Total Classes
                                    </p>
                                  </div>
                                  <p className="text-3xl font-bold text-white">
                                    {selectedCourseAttendance.totalClasses}
                                  </p>
                                </div>
                                <div className="p-4 bg-black/40 rounded-xl border border-neutral-800/50">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-500/20 rounded-lg">
                                      <TrendingUp className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <p className="text-sm text-neutral-400">
                                      Percentage
                                    </p>
                                  </div>
                                  <p
                                    className={`text-3xl font-bold ${
                                      selectedCourseAttendance.percentage >= 75
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {selectedCourseAttendance.percentage.toFixed(
                                      1
                                    )}
                                    %
                                  </p>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-neutral-400">
                                    Progress to 75% minimum
                                  </span>
                                  <span className="text-sm font-semibold text-white">
                                    {selectedCourseAttendance.percentage >= 75
                                      ? "✓ Goal Achieved"
                                      : `${(
                                          75 -
                                          selectedCourseAttendance.percentage
                                        ).toFixed(1)}% more needed`}
                                  </span>
                                </div>
                                <div className="h-3 bg-neutral-800 rounded-full overflow-hidden relative">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      selectedCourseAttendance.percentage >= 75
                                        ? "bg-gradient-to-r from-green-400 to-green-500"
                                        : "bg-gradient-to-r from-amber-400 to-red-400"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        selectedCourseAttendance.percentage,
                                        100
                                      )}%`,
                                    }}
                                  />
                                  {/* 75% marker */}
                                  <div
                                    className="absolute top-0 h-full w-0.5 bg-white/30"
                                    style={{ left: "75%" }}
                                  />
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        )}

                        {/* Grades & Assessments */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Card className="p-6 bg-gradient-to-br from-neutral-900/80 to-neutral-950/50 border-neutral-800/50">
                            <div className="flex items-center justify-between mb-5">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-purple-400" />
                                Grades & Assessments
                              </h3>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {selectedCourseGrades.length} graded
                              </Badge>
                            </div>

                            {selectedCourseGrades.length > 0 ? (
                              <div className="space-y-3">
                                {selectedCourseGrades.map((grade, idx) => (
                                  <motion.div
                                    key={grade.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                  >
                                    <Card className="p-5 bg-black/40 border-neutral-800/50 hover:border-purple-400/30 transition-all group">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                              <Award className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                              <h4 className="text-white font-semibold text-base group-hover:text-purple-300 transition-colors">
                                                {grade.assessment.title}
                                              </h4>
                                              <p className="text-neutral-500 text-xs mt-0.5">
                                                {new Date(
                                                  grade.createdAt
                                                ).toLocaleDateString("en-US", {
                                                  month: "long",
                                                  day: "numeric",
                                                  year: "numeric",
                                                })}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-4 flex-wrap">
                                            <Badge className="bg-neutral-800/80 text-neutral-300 border-neutral-700 capitalize">
                                              {grade.assessment.type}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-sm">
                                              <span className="text-neutral-400">
                                                Score:
                                              </span>
                                              <span className="text-white font-semibold">
                                                {grade.score}
                                              </span>
                                              <span className="text-neutral-600">
                                                /
                                              </span>
                                              <span className="text-neutral-400">
                                                {grade.assessment.maxScore}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                              <span className="text-neutral-400">
                                                Percentage:
                                              </span>
                                              <span className="text-amber-200 font-semibold">
                                                {(
                                                  (grade.score /
                                                    grade.assessment.maxScore) *
                                                  100
                                                ).toFixed(1)}
                                                %
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <div className="text-4xl font-bold text-amber-200 mb-1">
                                            {grade.grade}
                                          </div>
                                          <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
                                            Grade
                                          </Badge>
                                        </div>
                                      </div>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <div className="p-4 bg-neutral-900/50 rounded-2xl inline-block mb-4">
                                  <GraduationCap className="w-16 h-16 text-neutral-700 mx-auto" />
                                </div>
                                <p className="text-neutral-400 text-lg mb-2">
                                  No Grades Yet
                                </p>
                                <p className="text-neutral-600 text-sm">
                                  Assessments will appear here once graded
                                </p>
                              </div>
                            )}
                          </Card>
                        </motion.div>

                        {/* Course Materials */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Card className="p-6 bg-gradient-to-br from-neutral-900/80 to-neutral-950/50 border-neutral-800/50">
                            <div className="flex items-center justify-between mb-5">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Study Materials
                              </h3>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {selectedCourseMaterials.length} files
                              </Badge>
                            </div>

                            {selectedCourseMaterials.length > 0 ? (
                              <div className="grid grid-cols-2 gap-4">
                                {selectedCourseMaterials.map(
                                  (material, idx) => (
                                    <motion.div
                                      key={material.id}
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.5 + idx * 0.05 }}
                                    >
                                      <Card
                                        className="p-5 bg-black/40 border-neutral-800/50 hover:border-blue-400/40 transition-all cursor-pointer group"
                                        onClick={() =>
                                          window.open(
                                            material.fileUrl,
                                            "_blank"
                                          )
                                        }
                                      >
                                        <div className="flex items-start gap-4 mb-4">
                                          <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors shrink-0">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-blue-300 transition-colors">
                                              {material.title}
                                            </h4>
                                            <p className="text-neutral-500 text-xs truncate">
                                              {material.fileName}
                                            </p>
                                          </div>
                                          <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors shrink-0" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 capitalize text-xs">
                                              {material.type}
                                            </Badge>
                                            <span className="text-neutral-600 text-xs">
                                              {(
                                                material.fileSize / 1024
                                              ).toFixed(0)}{" "}
                                              KB
                                            </span>
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 px-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-500/10"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(
                                                material.fileUrl,
                                                "_blank"
                                              );
                                            }}
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-neutral-800/50">
                                          <p className="text-xs text-neutral-500">
                                            Uploaded{" "}
                                            {new Date(
                                              material.uploadedAt
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </p>
                                        </div>
                                      </Card>
                                    </motion.div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <div className="p-4 bg-neutral-900/50 rounded-2xl inline-block mb-4">
                                  <FileText className="w-16 h-16 text-neutral-700 mx-auto" />
                                </div>
                                <p className="text-neutral-400 text-lg mb-2">
                                  No Materials Yet
                                </p>
                                <p className="text-neutral-600 text-sm">
                                  Study materials will appear here when uploaded
                                </p>
                              </div>
                            )}
                          </Card>
                        </motion.div>
                      </div>
                    </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <Card className="p-16 bg-neutral-950/50 border-neutral-800/50 text-center">
                    <div className="p-6 bg-blue-500/10 rounded-3xl inline-block mb-6">
                      <BookOpen className="w-24 h-24 text-blue-400/50 mx-auto" />
                    </div>
                    <p className="text-neutral-300 text-2xl mb-3 font-semibold">
                      Select a Course
                    </p>
                    <p className="text-neutral-500 text-sm max-w-md mx-auto">
                      Choose a course from the sidebar to view detailed
                      information, grades, materials, and attendance records
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsCourses;
