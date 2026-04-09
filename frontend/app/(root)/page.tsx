"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading, isAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuth) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else if (user?.role) {
        // Redirect based on role
        const roleRedirect = user.role.toLowerCase();
        if (roleRedirect === 'student') {
          router.push('/student');
        } else if (roleRedirect === 'teacher') {
          router.push('/teacher');
        } else {
          // Default fallback (admin or other roles)
          router.push('/student');
        }
      }
    }
  }, [loading, isAuth, user, router]);

  // Show loading state while determining redirect
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-200 mx-auto mb-4" />
        <p className="text-neutral-400">Redirecting...</p>
      </div>
    </div>
  );
}