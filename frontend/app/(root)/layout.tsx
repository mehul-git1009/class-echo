"use client";

import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { useStudentStore } from "@/lib/store/useStudentStore";
import { useTeacherStore } from "@/lib/store/useTeacherStore";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchAllData: fetchStudentData, isInitialLoading: studentLoading } = useStudentStore();
  const { fetchAllData: fetchTeacherData, isInitialLoading: teacherLoading } = useTeacherStore();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only fetch data once when user is authenticated and not already loading
    if (user && !authLoading) {
      if (user.role === 'student') {
        fetchStudentData();
      } else if (user.role === 'teacher') {
        fetchTeacherData();
      }
    }
  }, [user, authLoading, fetchStudentData, fetchTeacherData]);

  // Determine which loading state to show
  const isInitialLoading = user?.role === 'student' ? studentLoading : teacherLoading;

  // Show loading screen only during initial data fetch (after auth is complete)
  if (!authLoading && user && isInitialLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-200 mb-4"></div>
          <p className="text-neutral-400 text-lg">Loading your data...</p>
          <p className="text-neutral-600 text-sm mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}