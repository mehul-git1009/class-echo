"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const authData = await register(
        formData.email, 
        formData.password, 
        formData.name,
        'STUDENT' // Default role, can be changed later
      );

      // Manually update auth context with the user data we already have
      // This avoids the race condition of calling refreshUser() immediately
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect based on user role - the route will pick up cached user data
      const role = authData.user.role.toLowerCase();
      if (role === 'student') {
        await router.push('/student');
      } else if (role === 'teacher') {
        await router.push('/teacher');
      } else {
        await router.push('/');
      }
      
      // Force a page refresh to ensure AuthContext picks up the new data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <div className="flex flex-1">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[420px] relative">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-[2.5rem] font-light text-white mb-3 tracking-[-0.02em]">
              Create account<span className="text-amber-200">.</span>
            </h1>
            <p className="text-neutral-400">
              Join classEcho to access your university data
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label
                htmlFor="name"
                className="text-xs text-neutral-400 absolute -top-2 left-3 px-2 bg-black rounded-full"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-14 px-6 bg-neutral-950/50 border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:border-amber-300/50 focus:ring-amber-300/20 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <label
                htmlFor="email"
                className="text-xs text-neutral-400 absolute -top-2 left-3 px-2 bg-black rounded-full"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-14 px-6 bg-neutral-950/50 border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:border-amber-300/50 focus:ring-amber-300/20 transition-all"
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label
                htmlFor="password"
                className="text-xs text-neutral-400 absolute -top-2 left-3 px-2 bg-black rounded-full"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-14 px-6 bg-neutral-950/50 border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:border-amber-300/50 focus:ring-amber-300/20 transition-all"
                placeholder="Create a strong password"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="text-xs text-neutral-400 absolute -top-2 left-3 px-2 bg-black rounded-full"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-14 px-6 bg-neutral-950/50 border-neutral-800 rounded-2xl text-white placeholder:text-neutral-600 focus:border-amber-300/50 focus:ring-amber-300/20 transition-all"
                placeholder="Confirm your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-2xl">
                {error}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base bg-linear-to-b from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-black font-medium rounded-2xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  "Create your account"
                )}
              </Button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-neutral-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-200 hover:text-amber-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="flex-1 hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-300/10 to-amber-900/10" />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle at center, transparent 0%, #000 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,transparent_0%,#000_70%)]" />

        {/* Decorative circles with Framer Motion float animation */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-[20%] right-[20%] w-32 h-32 rounded-full border border-amber-200/20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[20%] w-40 h-40 rounded-full border border-amber-200/10"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 2 }}
          />
          <motion.div
            className="absolute top-[50%] left-[50%] w-48 h-48 rounded-full border border-amber-200/5"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, delay: 4 }}
          />
        </div>

        <div className="h-full flex flex-col relative">
          <div className="absolute top-20 left-0 right-0 flex justify-center">
            <span className="font-light text-7xl text-transparent bg-clip-text bg-linear-to-b from-white to-white/40">
              Class<span className="font-medium text-amber-200">Echo</span>
            </span>
          </div>

          <div className="absolute bottom-20 right-10 ">
            <div className="relative w-150 h-10 mb-3 ">
              {/* Feature text with Framer Motion fade animation */}
              {[
                "Modernize classrooms",
                "Secure attendance tracking",
                "Enhanced productivity tools",
                "Real-time collaboration",
                "Smart resource management",
                "Seamless communication",
              ].map((text, index) => (
                <motion.p
                  key={text}
                  className="text-xl font-light text-white/90"
                  style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    y: [10, 0, 0, -10]
                  }}
                  transition={{
                    duration: 3,
                    times: [0, 0.1, 0.9, 1],
                    repeat: Infinity,
                    repeatDelay: 15,
                    delay: index * 3
                  }}
                >
                  {text}
                </motion.p>
              ))}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-px w-16 bg-linear-to-r from-transparent to-amber-200/50" />
              <p className="text-base text-amber-200/80">
                The future of education
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
