"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useStudentStore } from "@/lib/store/useStudentStore";

const GradesPage = () => {
  const { grades, gpa, courses } = useStudentStore();
  const [selectedType, setSelectedType] = useState<string>("all");

  // Group grades by course
  const gradesByCourse = grades.reduce((acc, grade) => {
    const courseCode = grade.course.code;
    if (!acc[courseCode]) {
      acc[courseCode] = {
        courseName: grade.course.name,
        courseCode: grade.course.code,
        grades: [],
      };
    }
    acc[courseCode].grades.push(grade);
    return acc;
  }, {} as Record<string, { courseName: string; courseCode: string; grades: typeof grades }>);

  // Calculate statistics
  const totalGrades = grades.length;
  const averageScore = grades.length > 0
    ? grades.reduce((sum, g) => sum + (g.score / g.assessment.maxScore) * 100, 0) / grades.length
    : 0;

  // Grade distribution
  const gradeDistribution = grades.reduce((acc, grade) => {
    acc[grade.grade] = (acc[grade.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Assessment types distribution
  const assessmentTypes = [...new Set(grades.map(g => g.assessment.type))];
  
  // Filter grades by assessment type
  const filteredGrades = selectedType === "all" 
    ? grades 
    : grades.filter(g => g.assessment.type === selectedType);

  // Get grade color
  const getGradeColor = (letterGrade: string) => {
    if (letterGrade === 'A' || letterGrade === 'A+' || letterGrade === 'O') return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (letterGrade === 'A-' || letterGrade === 'B+' || letterGrade === 'B') return 'text-amber-200 bg-amber-200/20 border-amber-200/30';
    if (letterGrade === 'B-' || letterGrade === 'C+' || letterGrade === 'C') return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  // Get percentage color
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-amber-200';
    if (percentage >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">
              <GraduationCap className="inline-block w-6 h-6 mr-2 text-amber-200" />
              Academic <span className="font-medium text-amber-200">Performance</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-1">
              {totalGrades} assessments across {courses.length} courses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-neutral-500 text-xs">Current GPA</p>
              <p className="text-amber-200 text-xl font-semibold">{(gpa || 0).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500 text-xs">Avg Score</p>
              <p className="text-amber-200 text-xl font-semibold">{averageScore.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-neutral-950/50 border-neutral-800/50 hover:border-amber-200/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-200/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Total Grades</p>
                    <p className="text-2xl font-bold text-white">{totalGrades}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 bg-neutral-950/50 border-neutral-800/50 hover:border-amber-200/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">GPA</p>
                    <p className="text-2xl font-bold text-white">{(gpa || 0).toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 bg-neutral-950/50 border-neutral-800/50 hover:border-amber-200/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Avg Score</p>
                    <p className="text-2xl font-bold text-white">{averageScore.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 bg-neutral-950/50 border-neutral-800/50 hover:border-amber-200/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Courses</p>
                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Grade Distribution */}
          <Card className="p-6 bg-neutral-950/50 border-neutral-800/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-200" />
              Grade Distribution
            </h3>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(gradeDistribution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([grade, count]) => (
                  <div
                    key={grade}
                    className={`px-4 py-3 rounded-lg border ${getGradeColor(grade)}`}
                  >
                    <p className="text-2xl font-bold">{grade}</p>
                    <p className="text-xs opacity-75">{count} {count === 1 ? 'grade' : 'grades'}</p>
                  </div>
                ))}
            </div>
          </Card>

          {/* Filter by Assessment Type */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Filter by:</span>
            <div className="flex gap-2 flex-wrap">
              <Badge
                onClick={() => setSelectedType("all")}
                className={`cursor-pointer transition-all ${
                  selectedType === "all"
                    ? "bg-amber-200/20 text-amber-200 border-amber-200/30"
                    : "bg-neutral-800/50 text-neutral-400 border-neutral-700 hover:border-amber-200/30"
                }`}
              >
                All ({grades.length})
              </Badge>
              {assessmentTypes.map((type) => (
                <Badge
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`cursor-pointer capitalize transition-all ${
                    selectedType === type
                      ? "bg-amber-200/20 text-amber-200 border-amber-200/30"
                      : "bg-neutral-800/50 text-neutral-400 border-neutral-700 hover:border-amber-200/30"
                  }`}
                >
                  {type} ({grades.filter(g => g.assessment.type === type).length})
                </Badge>
              ))}
            </div>
          </div>

          {/* Grades by Course */}
          {Object.entries(gradesByCourse).map(([courseCode, courseData], idx) => {
            const courseGrades = filteredGrades.filter(g => g.course.code === courseCode);
            if (courseGrades.length === 0) return null;

            const courseAverage = courseGrades.reduce((sum, g) => 
              sum + (g.score / g.assessment.maxScore) * 100, 0
            ) / courseGrades.length;

            return (
              <motion.div
                key={courseCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="p-6 bg-neutral-950/50 border-neutral-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
                          {courseData.courseCode}
                        </Badge>
                        <h3 className="text-white font-semibold">{courseData.courseName}</h3>
                      </div>
                      <p className="text-xs text-neutral-500">
                        {courseGrades.length} {courseGrades.length === 1 ? 'assessment' : 'assessments'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Course Average</p>
                      <p className={`text-2xl font-bold ${getPercentageColor(courseAverage)}`}>
                        {courseAverage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {courseGrades.map((grade) => {
                      const percentage = (grade.score / grade.assessment.maxScore) * 100;
                      
                      return (
                        <Card
                          key={grade.id}
                          className="p-4 bg-black/40 border-neutral-800/50 hover:border-amber-200/30 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-white font-medium">{grade.assessment.title}</h4>
                                <Badge className="bg-neutral-800/50 text-neutral-400 border-neutral-700 capitalize text-xs">
                                  {grade.assessment.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-neutral-500">
                                  Score: <span className="text-white font-medium">{grade.score}</span>
                                  <span className="text-neutral-600"> / {grade.assessment.maxScore}</span>
                                </span>
                                <span className="text-neutral-600">•</span>
                                <span className={`font-semibold ${getPercentageColor(percentage)}`}>
                                  {percentage.toFixed(1)}%
                                </span>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(grade.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge className={`text-2xl font-bold px-4 py-2 ml-4 ${getGradeColor(grade.grade)}`}>
                              {grade.grade}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {filteredGrades.length === 0 && (
            <Card className="p-12 bg-neutral-950/50 border-neutral-800/50 text-center">
              <GraduationCap className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-400 text-lg mb-2">No Grades Available</p>
              <p className="text-neutral-600 text-sm">
                {selectedType === "all" 
                  ? "Your grades will appear here once assessments are graded"
                  : `No ${selectedType} assessments found`}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradesPage;