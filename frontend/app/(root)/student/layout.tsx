"use client";

import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useStudentStore } from "@/lib/store/useStudentStore";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchAllData, courses } = useStudentStore();

  useEffect(() => {
    // Fetch all student data when layout mounts
    if (courses.length === 0) {
      fetchAllData();
    }
  }, []);

  return (
    <ProtectedRoute requiredRole="student">
      {children}
    </ProtectedRoute>
  );
}
