"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuth) {
        // Not authenticated at all
        router.replace('/login');
      } else if (requiredRole && user?.role) {
        // Normalize roles to lowercase for comparison
        const userRole = user.role.toLowerCase();
        const required = requiredRole.toLowerCase();
        
        if (userRole !== required) {
          // Wrong role - redirect to correct dashboard
          router.replace(`/${userRole}`);
        }
      }
    }
  }, [loading, isAuth, user, requiredRole, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-300 mx-auto mb-4"></div>
          <p className="text-neutral-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show nothing (will redirect via useEffect)
  if (!isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-300 mx-auto mb-4"></div>
          <p className="text-neutral-400 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Wrong role - show nothing (will redirect via useEffect)
  if (requiredRole && user?.role) {
    const userRole = user.role.toLowerCase();
    const required = requiredRole.toLowerCase();
    
    if (userRole !== required) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-300 mx-auto mb-4"></div>
            <p className="text-neutral-400 text-sm">Redirecting...</p>
          </div>
        </div>
      );
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}
