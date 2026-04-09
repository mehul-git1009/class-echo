"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Users,
  Edit2,
  Save,
  X,
  Award,
  Shield,
  Home,
  BookOpen,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import * as studentsApi from "@/lib/api/students";
import toast, { Toaster } from "react-hot-toast";

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<studentsApi.StudentProfile | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    contact: "",
    guardianName: "",
    guardianContact: "",
    dateOfBirth: "",
    address: "",
  });

  // Fetch profile only once on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await studentsApi.getMyProfile();
        setProfile(data);
        setFormData({
          contact: data.contact || "",
          guardianName: data.guardianName || "",
          guardianContact: data.guardianContact || "",
          dateOfBirth: data.dateOfBirth || "",
          address: data.address || "",
        });
      } catch (error: any) {
        toast.error("Failed to load profile");
      }
    };
    
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await studentsApi.updateMyProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        contact: profile.contact || "",
        guardianName: profile.guardianName || "",
        guardianContact: profile.guardianContact || "",
        dateOfBirth: profile.dateOfBirth || "",
        address: profile.address || "",
      });
    }
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="h-full bg-gradient-to-br from-black via-neutral-950 to-black flex items-center justify-center">
        <p className="text-neutral-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-black via-neutral-950 to-black overflow-y-auto">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a0a0a",
            color: "#fde68a",
            border: "1px solid rgba(251, 191, 36, 0.3)",
          },
          success: {
            iconTheme: {
              primary: "#4ade80",
              secondary: "#000",
            },
          },
          error: {
            iconTheme: {
              primary: "#f87171",
              secondary: "#000",
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section with Cover */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Cover Background */}
          <div className="h-48 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1MSwxOTEsMzYsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute top-4 right-4 flex gap-2">
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-amber-200 hover:bg-amber-300 text-black shadow-lg"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="save"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex gap-2"
                  >
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 bg-neutral-900/80 backdrop-blur"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-amber-200 hover:bg-amber-300 text-black shadow-lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="relative -mt-20 px-6 pb-6">
            <Card className="bg-neutral-950/95 backdrop-blur-xl border-neutral-800/50 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative"
                  >
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-400/30 to-purple-400/5 border-2 border-blue-400/40 flex items-center justify-center shadow-xl relative overflow-hidden">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-blue-400" />
                      )}
                      <div className="absolute -top-1 -right-1 bg-green-400 w-6 h-6 rounded-full border-4 border-neutral-950"></div>
                    </div>
                  </motion.div>

                  {/* Name and Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                          {profile.name}
                          <Sparkles className="w-6 h-6 text-blue-400" />
                        </h1>
                        <p className="text-neutral-400 text-lg mb-3">
                          Student · Roll No: {profile.rollNo}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 px-3 py-1">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {profile.rollNo}
                          </Badge>
                          {profile.gpa && (
                            <Badge className="bg-green-400/20 text-green-400 border-green-400/30 px-3 py-1">
                              <Award className="w-3 h-3 mr-1" />
                              GPA: {profile.gpa.toFixed(2)}
                            </Badge>
                          )}
                          <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30 px-3 py-1">
                            <User className="w-3 h-3 mr-1" />
                            Student
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                          <Mail className="w-3 h-3" />
                          Email
                        </div>
                        <p className="text-white text-sm truncate">{profile.email}</p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                          <Phone className="w-3 h-3" />
                          Contact
                        </div>
                        <p className="text-white text-sm truncate">
                          {profile.contact || "Not set"}
                        </p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                          <Shield className="w-3 h-3" />
                          Verification
                        </div>
                        <p className="text-white text-sm flex items-center gap-1">
                          {profile.faceDescriptor ? (
                            <><CheckCircle2 className="w-3 h-3 text-green-400" /> Active</>
                          ) : (
                            <><XCircle className="w-3 h-3 text-red-400" /> Pending</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-neutral-900/80 backdrop-blur border border-neutral-800/50 p-1">
              <TabsTrigger value="overview" className="gap-2">
                <User className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="academic" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Academic
              </TabsTrigger>
              <TabsTrigger value="guardian" className="gap-2">
                <Users className="w-4 h-4" />
                Guardian
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-400/20 rounded-xl">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </Label>
                        <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                          {profile.name}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </Label>
                        <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                          {profile.email}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Number
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.contact}
                            onChange={(e) =>
                              setFormData({ ...formData, contact: e.target.value })
                            }
                            placeholder="Enter contact number"
                            className="bg-neutral-900/50 border-neutral-700 text-white focus:border-blue-400/50"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                            {profile.contact || "Not provided"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="bg-neutral-900/50 border-neutral-700 text-white focus:border-blue-400/50"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                            {profile.dateOfBirth
                              ? new Date(profile.dateOfBirth).toLocaleDateString()
                              : "Not provided"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Contact & Address */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-purple-400/20 rounded-xl">
                          <Home className="w-5 h-5 text-purple-400" />
                        </div>
                        Address Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Residential Address
                        </Label>
                        {isEditing ? (
                          <textarea
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({ ...formData, address: e.target.value })
                            }
                            placeholder="Enter your complete address"
                            rows={6}
                            className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-400/50 resize-none"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50 min-h-[120px]">
                            {profile.address || "Not provided"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Academic Tab */}
            <TabsContent value="academic" className="space-y-6">
              <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-green-400/20 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-green-400" />
                    </div>
                    Academic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl border border-blue-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-400/20 rounded-xl">
                          <GraduationCap className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Roll Number</h3>
                          <p className="text-neutral-400 text-sm">Student ID</p>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-blue-400">
                        {profile.rollNo}
                      </p>
                    </div>

                    {profile.gpa && (
                      <div className="p-6 bg-gradient-to-br from-green-400/10 to-transparent rounded-2xl border border-green-400/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-green-400/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">GPA</h3>
                            <p className="text-neutral-400 text-sm">Grade Point Average</p>
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-green-400">
                          {profile.gpa.toFixed(2)}
                        </p>
                      </div>
                    )}

                    <div className="p-6 bg-gradient-to-br from-purple-400/10 to-transparent rounded-2xl border border-purple-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-400/20 rounded-xl">
                          <Award className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Status</h3>
                          <p className="text-neutral-400 text-sm">Academic Standing</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-purple-400">
                        Active Student
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guardian Tab */}
            <TabsContent value="guardian" className="space-y-6">
              <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-amber-200/20 rounded-xl">
                      <Users className="w-5 h-5 text-amber-200" />
                    </div>
                    Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Guardian Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.guardianName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              guardianName: e.target.value,
                            })
                          }
                          placeholder="Enter guardian's full name"
                          className="bg-neutral-900/50 border-neutral-700 text-white focus:border-amber-200/50"
                        />
                      ) : (
                        <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                          {profile.guardianName || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-neutral-400 text-sm flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Guardian Contact
                      </Label>
                      {isEditing ? (
                        <Input
                          value={formData.guardianContact}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              guardianContact: e.target.value,
                            })
                          }
                          placeholder="Enter guardian's contact number"
                          className="bg-neutral-900/50 border-neutral-700 text-white focus:border-amber-200/50"
                        />
                      ) : (
                        <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                          {profile.guardianContact || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-br from-amber-200/10 to-transparent rounded-2xl border border-amber-200/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-200/20 rounded-xl">
                        <Users className="w-6 h-6 text-amber-200" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">
                          Emergency Contact
                        </h3>
                        <p className="text-neutral-400 text-sm mb-3">
                          Guardian information is used for emergency situations and important notifications.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-amber-200" />
                            <span className="text-white">{profile.guardianName || "Not set"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-amber-200" />
                            <span className="text-white">{profile.guardianContact || "Not set"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-red-400/20 rounded-xl">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    Security & Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Face Verification Status */}
                    <div className="p-6 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl border border-blue-400/20">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-400/20 rounded-xl">
                          <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                            Face Verification
                            {profile.faceDescriptor ? (
                              <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-red-400/20 text-red-400 border-red-400/30">
                                <XCircle className="w-3 h-3 mr-1" />
                                Not Set Up
                              </Badge>
                            )}
                          </h3>
                          <p className="text-neutral-400 text-sm mb-4">
                            {profile.faceDescriptor
                              ? "Your face has been registered for attendance verification. This helps ensure secure and accurate attendance tracking."
                              : "Face verification is not set up yet. Please contact your administrator to enable this feature for secure attendance tracking."}
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                              <div className="text-neutral-400 text-xs mb-1">Status</div>
                              <div className="text-white font-medium">
                                {profile.faceDescriptor ? "Enabled" : "Disabled"}
                              </div>
                            </div>
                            <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                              <div className="text-neutral-400 text-xs mb-1">Security Level</div>
                              <div className="text-white font-medium">
                                {profile.faceDescriptor ? "High" : "Standard"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Information */}
                    <Card className="bg-neutral-900/50 border-neutral-800/50">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Account Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                            <div className="text-neutral-400 text-sm mb-1">User ID</div>
                            <div className="text-white font-mono text-sm">
                              {profile.userId}
                            </div>
                          </div>
                          <div className="p-4 bg-neutral-950/50 rounded-lg border border-neutral-800/50">
                            <div className="text-neutral-400 text-sm mb-1">Account Type</div>
                            <Badge className="bg-blue-400/10 text-blue-400 border-blue-400/20">
                              Student
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
