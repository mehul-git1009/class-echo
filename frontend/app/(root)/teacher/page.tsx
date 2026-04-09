"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  ClipboardCheck,
  GraduationCap,
  QrCode,
  TrendingUp,
  ChevronRight,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useTeacherStore } from "@/lib/store/useTeacherStore";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const {
    courses,
    students,
    attendanceSessions,
    coursesLoading,
    isInitialLoading,
  } = useTeacherStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Calculate stats
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const activeSessions = attendanceSessions.filter((s) => s.isActive).length;

  return (
    <div className="h-full bg-black text-[90%] overflow-hidden flex flex-col">
      {/* Hero Header */}
      <div className="px-6 py-6 border-b border-neutral-800/30 bg-gradient-to-br from-neutral-950 via-black to-black relative overflow-hidden shrink-0">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        
          <div className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-900/80 border border-neutral-800/50 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h1 className="text-3xl font-light text-white tracking-tight">
                    {getGreeting()}, <span className="font-medium text-amber-200">{user?.name?.split(' ')[0]}</span>
                  </h1>
                  <p className="text-neutral-500 text-sm mt-0.5">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Courses</p>
                <p className="text-2xl font-semibold text-amber-200">{totalCourses}</p>
              </div>
              <div className="h-12 w-px bg-neutral-800" />
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Students</p>
                <p className="text-2xl font-semibold text-green-400">{totalStudents}</p>
              </div>
              <div className="h-12 w-px bg-neutral-800" />
              <div className="text-center">
                <p className="text-xs text-neutral-500 mb-1">Active Sessions</p>
                <p className="text-2xl font-semibold text-blue-400">{activeSessions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-12 gap-4 auto-rows-min">

          {/* My Courses - 8 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-8"
          >
            <Card className="p-5 bg-neutral-950/50 border-neutral-800/50 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-200/10 rounded-lg">
                    <BookOpen className="w-4 h-4 text-amber-200" />
                  </div>
                  <h3 className="text-base font-medium text-white">My Courses</h3>
                  <Badge className="bg-amber-200/20 text-amber-200 ml-2">{courses.length}</Badge>
                </div>
                <Button variant="ghost" className="text-amber-200 hover:bg-amber-200/10 h-8 text-sm">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {courses.slice(0, 6).map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      <Card className="p-4 bg-neutral-900/50 border-neutral-800/50 hover:border-amber-200/30 hover:bg-neutral-900/70 transition-all cursor-pointer h-full">
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-1.5 bg-gradient-to-br from-amber-200/20 to-amber-400/20 rounded-lg">
                            <GraduationCap className="w-4 h-4 text-amber-200" />
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                            {course.credits} credits
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                          {course.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mb-2">{course.code}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
                          <span className="text-xs text-neutral-400">{course.semester}</span>
                          <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-amber-200 transition-colors" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {courses.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <BookOpen className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No courses assigned yet</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Quick Stats & Activities */}
          <div className="col-span-4 space-y-4">
            {/* Top Performing Students */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-200/10 rounded-lg">
                      <Award className="w-4 h-4 text-amber-200" />
                    </div>
                    <h3 className="text-base font-medium text-white">Top Performers</h3>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {students.slice(0, 5).map((student, idx) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50 hover:bg-neutral-900/70 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-200/20 text-amber-200 text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{student.name}</p>
                            <p className="text-xs text-neutral-500">{student.email}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {student.gpa ? `${student.gpa.toFixed(1)} GPA` : "Excellent"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}

                  {students.length === 0 && (
                    <div className="text-center py-8">
                      <Award className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                      <p className="text-neutral-500 text-xs">No students yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Recent Course Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-base font-medium text-white">Course Activity</h3>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {courses.slice(0, 3).map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold text-white line-clamp-1 flex-1">
                          {course.name}
                        </p>
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs shrink-0 ml-2">
                          {course.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {course.description || "No description available"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-neutral-600">
                          {course.credits} credits
                        </span>
                        <span className="text-xs text-neutral-500">
                          {course.semester}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {courses.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
                      <p className="text-neutral-500 text-xs">No courses yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Active QR Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12"
          >
            <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <QrCode className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-base font-medium text-white">Active Attendance Sessions</h3>
                  <Badge className="bg-green-500/20 text-green-300 ml-2">{activeSessions}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {attendanceSessions
                  .filter((s) => s.isActive)
                  .slice(0, 4)
                  .map((session, idx) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="p-4 bg-neutral-900/50 border-green-500/30 hover:border-green-500/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-green-500/20 text-green-300 text-xs">Active</Badge>
                          <Clock className="w-3 h-3 text-neutral-500" />
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                          {session.courseName}
                        </h4>
                        <p className="text-xs text-neutral-500 mb-2">{session.courseCode} • {session.section}</p>
                        <div className="text-xs text-neutral-400">
                          Expires: {new Date(session.expiresAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </Card>
                    </motion.div>
                  ))}

                {activeSessions === 0 && (
                  <div className="col-span-4 text-center py-8">
                    <QrCode className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                    <p className="text-neutral-500 text-sm">No active attendance sessions</p>
                    <Button className="mt-3 bg-amber-200 hover:bg-amber-300 text-black text-sm">
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
