"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}


export function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading, isAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuth && user?.role) {
      // User is logged in, redirect to their dashboard
      router.replace(`/${user.role}`);
    }
  }, [loading, isAuth, user, router]);

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

  // User is authenticated - show loading while redirecting
  if (isAuth && user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-300 mx-auto mb-4"></div>
          <p className="text-neutral-400 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated - show login/register page
  return <>{children}</>;
}
