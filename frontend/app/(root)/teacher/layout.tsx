"use client";

import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTeacherStore } from "@/lib/store/useTeacherStore";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchAllData, courses } = useTeacherStore();

  useEffect(() => {
    // Fetch all teacher data when layout mounts
    if (courses.length === 0) {
      fetchAllData();
    }
  }, []);

  return (
    <ProtectedRoute requiredRole="teacher">
      {children}
    </ProtectedRoute>
  );
}
