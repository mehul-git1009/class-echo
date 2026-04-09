//Create Supabase Client

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher" | "admin"; 
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

//Login
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Step 1: Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error("No session returned");
    }

    // Step 2: Exchange Supabase token for backend JWT
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supabaseToken: data.session.access_token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Authentication failed");
    }

    const result = await response.json();
    const authData: AuthResponse = result.data;

    // Clear any existing Supabase session from localStorage
    await supabase.auth.signOut({ scope: "local" });

    // Store only our tokens
    localStorage.setItem("access_token", authData.accessToken);
    localStorage.setItem("refresh_token", authData.refreshToken);
    localStorage.setItem("user", JSON.stringify(authData.user));

    return authData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

//Register User
export async function register(
  email: string,
  password: string,
  name: string,
  role: "STUDENT" | "TEACHER" = "STUDENT"
): Promise<AuthResponse> {
  try {
    // Step 1: Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error(
        "Registration successful. Please check your email for verification."
      );
    }

    // Step 2: Exchange Supabase token for backend JWT
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supabaseToken: data.session.access_token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    const result = await response.json();
    const authData: AuthResponse = result.data;

    // Clear any existing Supabase session from localStorage
    await supabase.auth.signOut({ scope: "local" });

    // Store only our tokens
    localStorage.setItem("access_token", authData.accessToken);
    localStorage.setItem("refresh_token", authData.refreshToken);
    localStorage.setItem("user", JSON.stringify(authData.user));

    return authData;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

//Logout User
export async function logout(): Promise<void> {
  // Sign out from Supabase (clears any Supabase session data)
  await supabase.auth.signOut();

  // Clear our custom tokens and user data
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  // Clear face verification data (pattern: faceData_<userId>)
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("sb-") || key.startsWith("faceData_"))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

//Ger Current User Details from Backend
export async function getUserDetails(token?: string): Promise<User> {
  try {
    const accessToken = token || getAccessToken();
    if (!accessToken) {
      throw new Error("No access token available");
    }

    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const result = await response.json();
    const user: User = result.data;

    // Cache user data
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("Get user details error:", error);
    throw new Error("Failed to fetch user details");
  }
}

//Get Cached User
export function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

//Check if user is authenticaed
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

//Get Access Token
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}
