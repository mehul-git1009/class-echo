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
  Briefcase,
  GraduationCap,
  Clock,
  FileText,
  Edit2,
  Save,
  X,
  Award,
  BookOpen,
  Users,
  Calendar,
  Building,
  Phone,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import * as teachersApi from "@/lib/api/teachers";
import toast, { Toaster } from "react-hot-toast";

const TeacherProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<teachersApi.TeacherProfile | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    department: "",
    qualification: "",
    specialization: "",
    officeHours: "",
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await teachersApi.getMyProfile();
      setProfile(data);
      setFormData({
        department: data.department || "",
        qualification: data.qualification || "",
        specialization: data.specialization || "",
        officeHours: data.officeHours || "",
        bio: data.bio || "",
      });
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await teachersApi.updateMyProfile(formData);
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
        department: profile.department || "",
        qualification: profile.qualification || "",
        specialization: profile.specialization || "",
        officeHours: profile.officeHours || "",
        bio: profile.bio || "",
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
          <div className="h-48 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 relative">
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
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-200/30 to-amber-200/5 border-2 border-amber-200/40 flex items-center justify-center shadow-xl relative overflow-hidden">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-amber-200" />
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
                          <Sparkles className="w-6 h-6 text-amber-200" />
                        </h1>
                        <p className="text-neutral-400 text-lg mb-3">
                          {profile.qualification || "Faculty Member"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-amber-200/20 text-amber-200 border-amber-200/30 px-3 py-1">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {profile.department || "Department"}
                          </Badge>
                          <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 px-3 py-1">
                            <Award className="w-3 h-3 mr-1" />
                            Teacher
                          </Badge>
                          {profile.specialization && (
                            <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30 px-3 py-1">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {profile.specialization}
                            </Badge>
                          )}
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
                        <p className="text-white text-sm truncate">
                          {profile.email}
                        </p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                          <Clock className="w-3 h-3" />
                          Office Hours
                        </div>
                        <p className="text-white text-sm truncate">
                          {profile.officeHours || "Not set"}
                        </p>
                      </div>
                      <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-800/50">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                          <Building className="w-3 h-3" />
                          ID
                        </div>
                        <p className="text-white text-sm font-mono truncate">
                          {profile.userId.slice(0, 8)}...
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-neutral-900/80 backdrop-blur border border-neutral-800/50 p-1">
              <TabsTrigger value="overview" className="gap-2">
                <User className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="professional" className="gap-2">
                <Award className="w-4 h-4" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="about" className="gap-2">
                <FileText className="w-4 h-4" />
                About
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
                        <div className="p-2 bg-amber-200/20 rounded-xl">
                          <User className="w-5 h-5 text-amber-200" />
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
                          <Briefcase className="w-4 h-4" />
                          Department
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.department}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                department: e.target.value,
                              })
                            }
                            placeholder="Enter department"
                            className="bg-neutral-900/50 border-neutral-700 text-white focus:border-amber-200/50"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                            {profile.department || "Not provided"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Academic Credentials */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-400/20 rounded-xl">
                          <GraduationCap className="w-5 h-5 text-blue-400" />
                        </div>
                        Academic Credentials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Qualification
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.qualification}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                qualification: e.target.value,
                              })
                            }
                            placeholder="e.g., Ph.D. in Computer Science"
                            className="bg-neutral-900/50 border-neutral-700 text-white focus:border-amber-200/50"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                            {profile.qualification || "Not provided"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Specialization
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.specialization}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specialization: e.target.value,
                              })
                            }
                            placeholder="e.g., Machine Learning, AI"
                            className="bg-neutral-900/50 border-neutral-700 text-white focus:border-amber-200/50"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                            {profile.specialization || "Not provided"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-400 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Office Hours
                        </Label>
                        {isEditing ? (
                          <Input
                            value={formData.officeHours}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                officeHours: e.target.value,
                              })
                            }
                            placeholder="e.g., Mon-Fri 2:00 PM - 4:00 PM"
                            className="bg-neutral-900/50 border-neutral-700 text-white focus:border-amber-200/50"
                          />
                        ) : (
                          <div className="text-white font-medium bg-neutral-900/50 rounded-lg p-3 border border-neutral-800/50">
                            {profile.officeHours || "Not provided"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Professional Tab */}
            <TabsContent value="professional" className="space-y-6">
              <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-purple-400/20 rounded-xl">
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-amber-200/10 to-transparent rounded-2xl border border-amber-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-amber-200/20 rounded-xl">
                          <Briefcase className="w-6 h-6 text-amber-200" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Department
                          </h3>
                          <p className="text-neutral-400 text-sm">
                            Current Role
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-amber-200">
                        {profile.department || "Not specified"}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl border border-blue-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-400/20 rounded-xl">
                          <GraduationCap className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Specialization
                          </h3>
                          <p className="text-neutral-400 text-sm">
                            Area of Expertise
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">
                        {profile.specialization || "Not specified"}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-400/10 to-transparent rounded-2xl border border-green-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-400/20 rounded-xl">
                          <Award className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Qualification
                          </h3>
                          <p className="text-neutral-400 text-sm">Education</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-400">
                        {profile.qualification || "Not specified"}
                      </p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-400/10 to-transparent rounded-2xl border border-purple-400/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-400/20 rounded-xl">
                          <Clock className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Availability
                          </h3>
                          <p className="text-neutral-400 text-sm">
                            Office Hours
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-purple-400">
                        {profile.officeHours || "Not specified"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-green-400/20 rounded-xl">
                      <FileText className="w-5 h-5 text-green-400" />
                    </div>
                    Biography & Teaching Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label className="text-neutral-400">
                        Share your background, research interests, and teaching
                        approach
                      </Label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself, your research interests, achievements, and teaching philosophy..."
                        rows={10}
                        className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl p-4 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-200/50 resize-none"
                      />
                      <p className="text-neutral-500 text-sm">
                        {formData.bio.length} characters
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      {profile.bio ? (
                        <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap bg-neutral-900/30 rounded-xl p-6 border border-neutral-800/50">
                          {profile.bio}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                          <p className="text-neutral-500 italic">
                            No biography added yet. Click "Edit Profile" to add
                            your professional background and teaching
                            philosophy.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="bg-neutral-950/80 backdrop-blur border-neutral-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-amber-200/20 rounded-xl">
                      <Building className="w-5 h-5 text-amber-200" />
                    </div>
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                      <div className="text-neutral-400 text-sm mb-1">
                        User ID
                      </div>
                      <div className="text-white font-mono text-sm">
                        {profile.userId}
                      </div>
                    </div>
                    <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800/50">
                      <div className="text-neutral-400 text-sm mb-1">
                        Account Type
                      </div>
                      <Badge className="bg-amber-200/10 text-amber-200 border-amber-200/20">
                        Teacher
                      </Badge>
                    </div>
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

export default TeacherProfilePage;
