"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Download,
  RefreshCw,
  UserCheck,
  Book,
  Grid3x3,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { useTeacherStore } from "@/lib/store/useTeacherStore";
import { useAuth } from "@/lib/contexts/AuthContext";
import * as attendanceApi from "@/lib/api/attendance";
import QRCode from 'react-qr-code';

interface StudentAttendance {
  id: string;
  rollNo: string;
  name: string;
  email?: string;
  status: "PRESENT" | "ABSENT" | "PENDING";
  markedAt?: string;
  markedBy?: "QR" | "MANUAL";
}

const TeachersAttendance = () => {
  const { user } = useAuth();
  const { courses, enrollments } = useTeacherStore();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrSession, setQrSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [qrTimer, setQrTimer] = useState(300);
  const [isQrActive, setIsQrActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [section, setSection] = useState("L2"); // Default section
  const [recentlyMarked, setRecentlyMarked] = useState<string[]>([]); // Track recently marked students
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const courseEnrollments = enrollments.filter(e => e.course.id === selectedCourse);

  useEffect(() => {
    if (selectedCourse && section) {
      loadStudentsAndAttendance();
      checkForActiveSession(); // Check if there's already an active QR session
    }
  }, [selectedCourse, section, attendanceDate]);

  // Check for active QR session when course/section/date changes
  const checkForActiveSession = async () => {
    if (!selectedCourse || !section) return;
    
    try {
      const activeSession = await attendanceApi.getActiveCourseSession(
        selectedCourse,
        attendanceDate,
        section
      );
      
      if (activeSession && activeSession.isActive) {
        const expiresAt = new Date(activeSession.expiresAt).getTime();
        const now = Date.now();
        
        if (expiresAt > now) {
          setQrSession(activeSession);
          setShowQR(true);
          setIsQrActive(true);
          
          const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          setQrTimer(remaining);
        }
      }
    } catch (error) {
      // Not a critical error, just means no active session
    }
  };

  // REMOVED AUTO-REFRESH - Use manual refresh button instead
  // This prevents too frequent API calls and gives teacher control

  const loadStudentsAndAttendance = async () => {
    if (!selectedCourse) return;
    
    setLoading(true);
    try {
      const courseStudents: StudentAttendance[] = courseEnrollments.map(e => ({
        id: e.student.id,
        rollNo: e.student.rollNo,
        name: e.student.name,
        email: undefined,
        status: "PENDING" as const,
      }));

      try {
        const attendance = await attendanceApi.getCourseAttendance(
          selectedCourse,
          attendanceDate,
          section
        );
        
        const updatedStudents = courseStudents.map(student => {
          const record = attendance.find((a: any) => a.student.id === student.id);
          if (record) {
            // Format the markedAt timestamp properly
            const markedAtDate = record.markedAt ? new Date(record.markedAt) : new Date(record.createdAt);
            const markedAtTime = markedAtDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
            
            return {
              ...student,
              status: record.status,
              markedAt: markedAtTime,
              markedBy: record.markedBy,
            };
          }
          return student;
        });
        
        // Track newly marked students for animation
        const previouslyPresent = students
          .filter(s => s.status === "PRESENT")
          .map(s => s.id);
        const currentlyPresent = updatedStudents
          .filter(s => s.status === "PRESENT")
          .map(s => s.id);
        const newlyMarked = currentlyPresent.filter(id => !previouslyPresent.includes(id));
        
        if (newlyMarked.length > 0) {
          setRecentlyMarked(newlyMarked);
          setTimeout(() => {
            setRecentlyMarked([]);
          }, 5000);
        }
        
        setStudents(updatedStudents);
      } catch (error) {
        setStudents(courseStudents);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQrActive && qrTimer > 0 && qrSession) {
      interval = setInterval(() => {
        const expiresAt = new Date(qrSession.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        setQrTimer(remaining);
        
        if (remaining <= 0) {
          setIsQrActive(false);
          setShowQR(false);
          setQrSession(null);
          // Automatically mark all pending students as absent when QR expires
          if (selectedCourse) {
            const pendingStudents = students.filter(s => s.status === "PENDING");
            if (pendingStudents.length > 0) {
              Promise.all(
                pendingStudents.map(student =>
                  attendanceApi.markAttendanceManually(
                    student.id,
                    selectedCourse,
                    attendanceDate,
                    section,
                    attendanceApi.AttendanceStatus.ABSENT
                  )
                )
              ).then(() => {
                loadStudentsAndAttendance();
              }).catch(error => {
                console.error("Failed to mark pending students as absent:", error);
              });
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQrActive, qrTimer, qrSession]);

  const generateQRCode = async () => {
    if (!selectedCourse || !user?.id) {
      alert("Please select a course first");
      return;
    }

    if (!section) {
      alert("Please enter a section name");
      return;
    }

    setLoading(true);
    try {
      const session = await attendanceApi.generateQRCode(
        selectedCourse,
        user.id,
        section,
        attendanceDate
      );
      
      if (!session || !session.qrCode) {
        throw new Error("Invalid session data received");
      }

      setQrSession(session);
      setShowQR(true);
      setIsQrActive(true);
      
      const expiresAt = new Date(session.expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setQrTimer(remaining);
      
      setTimeout(() => loadStudentsAndAttendance(), 2000);
    } catch (error: any) {
      console.error("Failed to generate QR code:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to generate QR code. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeQRCode = async (markPendingAsAbsent: boolean = false) => {
    // Mark all pending students as absent before closing if requested
    if (markPendingAsAbsent && selectedCourse) {
      try {
        const pendingStudents = students.filter(s => s.status === "PENDING");
        if (pendingStudents.length > 0) {
          for (const student of pendingStudents) {
            await attendanceApi.markAttendanceManually(
              student.id,
              selectedCourse,
              attendanceDate,
              section,
              attendanceApi.AttendanceStatus.ABSENT
            );
          }
          await loadStudentsAndAttendance();
        }
      } catch (error) {
        console.error("Failed to mark pending students as absent:", error);
      }
    }
    
    if (qrSession && qrSession.id) {
      try {
        await attendanceApi.closeAttendanceSession(qrSession.id);
      } catch (error) {
        console.error("Failed to invalidate session:", error);
      }
    }
    
    setShowQR(false);
    setIsQrActive(false);
    setQrTimer(300);
    setQrSession(null);
  };

  const markAttendance = async (studentId: string, status: "PRESENT" | "ABSENT") => {
    if (!selectedCourse) return;

    try {
      await attendanceApi.markAttendanceManually(
        studentId,
        selectedCourse,
        attendanceDate,
        section,
        status as any
      );
      
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? {
                ...student,
                status,
                markedAt: new Date().toLocaleTimeString(),
                markedBy: "MANUAL",
              }
            : student
        )
      );
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      alert("Failed to mark attendance. Please try again.");
    }
  };

  const markAllPresent = async () => {
    if (!selectedCourse) return;

    try {
      const pendingStudents = students.filter(s => s.status === "PENDING");
      for (const student of pendingStudents) {
        await attendanceApi.markAttendanceManually(
          student.id,
          selectedCourse,
          attendanceDate,
          section,
          attendanceApi.AttendanceStatus.PRESENT
        );
      }
      
      await loadStudentsAndAttendance();
    } catch (error) {
      console.error("Failed to mark all present:", error);
      alert("Failed to mark all present. Please try again.");
    }
  };

  const markAllAbsent = async () => {
    if (!selectedCourse) return;

    try {
      const pendingStudents = students.filter(s => s.status === "PENDING");
      for (const student of pendingStudents) {
        await attendanceApi.markAttendanceManually(
          student.id,
          selectedCourse,
          attendanceDate,
          section,
          attendanceApi.AttendanceStatus.ABSENT
        );
      }
      
      await loadStudentsAndAttendance();
    } catch (error) {
      console.error("Failed to mark all absent:", error);
      alert("Failed to mark all absent. Please try again.");
    }
  };

  const copyQRLink = () => {
    if (qrSession) {
      const link = `${window.location.origin}/attendance/${qrSession.qrCode}`;
      navigator.clipboard.writeText(qrSession.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.includes(searchQuery)
  );

  const attendanceStats = {
    present: students.filter((s) => s.status === "PRESENT").length,
    absent: students.filter((s) => s.status === "ABSENT").length,
    pending: students.filter((s) => s.status === "PENDING").length,
    total: students.length,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">
              <UserCheck className="inline-block w-6 h-6 mr-2 text-amber-200" />
              Attendance <span className="font-medium text-amber-200">Management</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-1">
              Mark attendance for your classes
            </p>
          </div>
          {selectedCourse && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Section (e.g., L2)"
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  className={`h-10 w-32 bg-neutral-950/50 text-white rounded-lg text-center font-semibold ${
                    !section ? 'border-red-500/50' : 'border-neutral-800'
                  }`}
                />
                {!section && (
                  <p className="absolute -bottom-5 left-0 text-xs text-red-400">Required</p>
                )}
              </div>
              <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-48 bg-neutral-950/50 border-neutral-800 text-white hover:bg-neutral-900 hover:text-white justify-start gap-2"
                  >
                    <Calendar className="w-4 h-4 text-amber-200" />
                    {selectedDate.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-neutral-950 border-neutral-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Select Date</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center py-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setAttendanceDate(date.toISOString().split("T")[0]);
                          setShowCalendar(false);
                        }
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      className="rounded-md border border-neutral-800"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!selectedCourse ? (
          /* Course Selection View */
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
              <div className="px-6 py-5 border-b border-neutral-800/50 shrink-0">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-amber-200" />
                  Select a Course
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Choose the course to mark attendance
                </p>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 grid grid-cols-3 gap-3">
                  {courses.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                      <Book className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                      <p className="text-neutral-400">No courses found</p>
                    </div>
                  ) : (
                    courses.map((course, idx) => {
                      const courseEnrollmentCount = enrollments.filter(e => e.course.id === course.id).length;
                      
                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card
                            onClick={() => setSelectedCourse(course.id)}
                            className="p-4 bg-black/40 border-neutral-800/50 hover:border-amber-200/50 hover:bg-amber-200/5 cursor-pointer transition-all group"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-10 h-10 rounded-lg bg-amber-200/20 flex items-center justify-center group-hover:bg-amber-200/30 transition-colors">
                                <Users className="w-5 h-5 text-amber-200" />
                              </div>
                              <Badge className="bg-neutral-800/50 text-neutral-400 border-neutral-700 text-xs">
                                {courseEnrollmentCount} Students
                              </Badge>
                            </div>
                            <h3 className="text-white font-semibold text-base mb-1">
                              {course.name}
                            </h3>
                            <p className="text-neutral-400 text-xs mb-2 line-clamp-2">
                              {course.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 text-xs">
                                {course.code}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2 pt-2 border-t border-neutral-800/50">
                              <Book className="w-3 h-3" />
                              <span className="truncate">{course.credits} Credits • {course.semester}</span>
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
          /* Attendance Marking View */
          <div className="flex-1 flex gap-6 p-6 overflow-hidden">
            {/* Left Column - Actions & Stats */}
            <div className="w-[380px] flex flex-col overflow-hidden min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-6 pr-4">
                  {/* Selected Course Info */}
                  <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">
                          {selectedCourseData?.name}
                        </h3>
                        <p className="text-neutral-400 text-sm">
                          Section {section}
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedCourse(null)}
                        variant="outline"
                        className="h-9 text-xs border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
                      >
                        Change Course
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30">
                        {selectedCourseData?.code}
                      </Badge>
                      <span>•</span>
                      <span>{students.length} Students</span>
                    </div>
                  </Card>

                  {/* Attendance Stats */}
                  <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-200" />
                      Today's Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400">Present</p>
                            <p className="text-white font-semibold text-lg">
                              {attendanceStats.present}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          {attendanceStats.total > 0
                            ? Math.round(
                                (attendanceStats.present / attendanceStats.total) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400">Absent</p>
                            <p className="text-white font-semibold text-lg">
                              {attendanceStats.absent}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          {attendanceStats.total > 0
                            ? Math.round(
                                (attendanceStats.absent / attendanceStats.total) * 100
                              )
                            : 0}
                          %
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-amber-200/10 border border-amber-200/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-200/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-200" />
                          </div>
                          <div>
                            <p className="text-xs text-neutral-400">Pending</p>
                            <p className="text-white font-semibold text-lg">
                              {attendanceStats.pending}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* QR Code Actions */}
                  <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-amber-200" />
                      QR Code Attendance
                    </h3>
                    <p className="text-sm text-neutral-400 mb-4">
                      Generate a QR code for students to scan and mark their attendance automatically.
                      {!section && <span className="block text-red-400 mt-1">⚠️ Please enter a section name first</span>}
                    </p>
                    {!showQR ? (
                      <Button
                        onClick={generateQRCode}
                        disabled={loading || !section}
                        className="w-full h-11 bg-amber-200 hover:bg-amber-300 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Generate QR Code
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {/* Live attendance counter */}
                        <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-sm text-green-400 font-medium">Live Updates Active</span>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              {attendanceStats.present} marked
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                          {qrSession && qrSession.qrCode ? (
                            <div className="text-center">
                              <QRCode 
                                value={qrSession.qrCode} 
                                size={180}
                                level="M"
                                bgColor="#ffffff"
                                fgColor="#000000"
                              />
                              <p className="text-xs text-neutral-600 font-mono mt-2 break-all px-2">{qrSession.qrCode}</p>
                            </div>
                          ) : (
                            <div className="py-8">
                              <p className="text-neutral-600 text-sm">Loading QR code...</p>
                            </div>
                          )}
                        </div>
                        {isQrActive && (
                          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-sm text-green-400 font-medium">Active</span>
                            </div>
                            <span className="text-white font-mono font-semibold">
                              {formatTime(qrTimer)}
                            </span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={copyQRLink}
                            variant="outline"
                            className="h-9 text-xs border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
                          >
                            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                            {copied ? "Copied!" : "Copy Code"}
                          </Button>
                          <Button
                            onClick={() => closeQRCode(false)}
                            variant="outline"
                            className="h-9 text-xs border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-500/50"
                          >
                            Close QR
                          </Button>
                        </div>
                        {attendanceStats.pending > 0 && (
                          <Button
                            onClick={() => closeQRCode(true)}
                            className="w-full h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-medium"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Close & Mark {attendanceStats.pending} Absent
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-5 bg-neutral-950/50 border-neutral-800/50">
                    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={markAllPresent}
                        variant="outline"
                        disabled={attendanceStats.pending === 0}
                        className="w-full h-10 text-sm border-green-500/50 text-green-400 hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark All Pending Present ({attendanceStats.pending})
                      </Button>
                      <Button
                        onClick={markAllAbsent}
                        variant="outline"
                        disabled={attendanceStats.pending === 0}
                        className="w-full h-10 text-sm border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Mark All Pending Absent ({attendanceStats.pending})
                      </Button>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </div>

            {/* Right Column - Students List */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <Card className="flex-1 bg-neutral-950/50 border-neutral-800/50 flex flex-col overflow-hidden min-h-0">
                {/* Search & Header */}
                <div className="px-6 py-5 border-b border-neutral-800/50 space-y-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-200" />
                      Students List ({filteredStudents.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={loadStudentsAndAttendance}
                        variant="outline"
                        className="h-9 text-xs border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 text-xs border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-200/50"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                      placeholder="Search by name or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 bg-black/40 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-amber-200/50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Students List */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-6 space-y-3">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-amber-200/20 border-t-amber-200 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-400">Loading students...</p>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-400">No students found</p>
                      </div>
                    ) : (
                      filteredStudents.map((student, idx) => {
                        const isRecentlyMarked = recentlyMarked.includes(student.id);
                        
                        return (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0,
                              scale: isRecentlyMarked ? [1, 1.02, 1] : 1
                            }}
                            transition={{ 
                              delay: idx * 0.03,
                              scale: { duration: 0.5, repeat: isRecentlyMarked ? 2 : 0 }
                            }}
                          >
                            <Card
                              className={`p-4 transition-all relative overflow-hidden ${
                                student.status === "PRESENT"
                                  ? "bg-green-500/10 border-green-500/30"
                                  : student.status === "ABSENT"
                                  ? "bg-red-500/10 border-red-500/30"
                                  : "bg-black/40 border-neutral-800/50"
                              } ${isRecentlyMarked ? "ring-2 ring-green-400/50 shadow-lg shadow-green-400/20" : ""}`}
                            >
                              {/* Recently marked pulse indicator */}
                              {isRecentlyMarked && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                                />
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                    isRecentlyMarked 
                                      ? "bg-green-400/30 ring-2 ring-green-400/50" 
                                      : "bg-amber-200/20"
                                  }`}>
                                    <span className={`font-semibold text-sm ${
                                      isRecentlyMarked ? "text-green-400" : "text-amber-200"
                                    }`}>
                                      {getInitials(student.name)}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="text-white font-semibold text-sm">
                                        {student.name}
                                      </h4>
                                      {isRecentlyMarked && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs animate-pulse">
                                          <Sparkles className="w-3 h-3 mr-1" />
                                          Just marked!
                                        </Badge>
                                      )}
                                      {student.markedBy && (
                                        <Badge
                                          className={`text-xs ${
                                            student.markedBy === "QR"
                                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                              : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                          }`}
                                        >
                                          {student.markedBy === "QR" ? "QR Scan" : "Manual"}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                                      <span>{student.rollNo}</span>
                                      {student.markedAt && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {student.markedAt}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => markAttendance(student.id, "PRESENT")}
                                  className={`h-9 px-4 ${
                                    student.status === "PRESENT"
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50"
                                  }`}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Present
                                </Button>
                                <Button
                                  onClick={() => markAttendance(student.id, "ABSENT")}
                                  className={`h-9 px-4 ${
                                    student.status === "ABSENT"
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                                  }`}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Absent
                                </Button>
                              </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersAttendance;