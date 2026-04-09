"use client";

import React from "react";
import { GuestRoute } from "@/components/GuestRoute";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background gradient shapes */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[50%] rounded-[50%] opacity-20 bg-[radial-gradient(circle_at_center,#9C7B41,transparent_70%)]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[80%] h-[50%] rounded-[50%] opacity-20 bg-[radial-gradient(circle_at_center,#736E67,transparent_70%)]" />
        </div>

        {/* Soft noise texture */}
        <div 
          className="fixed inset-0 opacity-[0.015] pointer-events-none" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            transform: 'translate3d(0, 0, 0)',
          }} 
        />

        {/* Main container with glass effect */}
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.05] shadow-2xl" />
          
          {/* Content */}
          <div className="relative flex min-h-[600px] rounded-[2.5rem]">
            {children}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-6 left-6 w-24 h-24 border rounded-full" />
            <div className="absolute bottom-6 right-6 w-32 h-32 border rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/[0.05] rounded-full" />
          </div>
        </div>

        {/* Bottom text */}
        <div className="fixed bottom-6 text-center">
          <p className="text-neutral-600 text-sm">
            Secure Authentication • Open Source • Privacy Focused
          </p>
        </div>
      </div>
    </GuestRoute>
  );
}
