"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getCachedUser, getAccessToken, logout as logoutUser, getUserDetails } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/lib/store/useStudentStore';
import { useTeacherStore } from '@/lib/store/useTeacherStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const userData = await getUserDetails();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    
    // Clear all stores on logout
    useStudentStore.getState().clearStore();
    useTeacherStore.getState().clearStore();
    
    router.push('/login');
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initial load - check for cached user
        const cachedUser = getCachedUser();
        const token = getAccessToken();
        
        if (token && cachedUser) {
          setUser(cachedUser);
          // Optionally refresh user data in background
          refreshUser().catch(() => {});
        } else if (token) {
          // Has token but no cached user
          await refreshUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Compute isAuth reactively based on user state
  const isAuth = !!user && !!getAccessToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuth,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
