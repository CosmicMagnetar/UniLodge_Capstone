/**
 * User Profile Page
 * Edit user information and account settings
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  university?: string;
  bio?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    university: "",
    bio: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    fetchProfile(token, userId);
  }, []);

  async function fetchProfile(token: string, userId: string) {
    try {
      // In a real app, you'd have a /api/user/profile endpoint
      // For now, we'll use localStorage data
      const profile: UserProfile = {
        id: userId,
        name: localStorage.getItem("user_name") || "User",
        email: localStorage.getItem("user_email") || "",
        phone: localStorage.getItem("user_phone") || "",
        address: localStorage.getItem("user_address") || "",
        university: localStorage.getItem("user_university") || "",
        bio: localStorage.getItem("user_bio") || "",
        role: "guest",
        createdAt: new Date().toISOString(),
      };

      setProfile(profile);
      setFormData({
        name: profile.name,
        phone: profile.phone || "",
        address: profile.address || "",
        university: profile.university || "",
        bio: profile.bio || "",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      // Store in localStorage for now
      localStorage.setItem("user_name", formData.name);
      localStorage.setItem("user_phone", formData.phone);
      localStorage.setItem("user_address", formData.address);
      localStorage.setItem("user_university", formData.university);
      localStorage.setItem("user_bio", formData.bio);

      setProfile({
        ...profile,
        ...formData,
      });

      setMessage({ type: "success", text: "Profile updated successfully" });
      setEditing(false);

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={40} />
            <p className="text-gray-600">Failed to load profile</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          </div>
          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {saving && <Loader size={20} className="animate-spin" />}
            {saving ? "Saving..." : editing ? "Save Changes" : "Edit Profile"}
            {!saving && <Edit2 size={20} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div
            className={`p-4 rounded-lg flex gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <AlertCircle className="text-red-600" size={20} />
            )}
            <p
              className={
                message.type === "success" ? "text-green-700" : "text-red-700"
              }
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-12 pb-12 border-b">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <p className="text-gray-600 capitalize">
                {profile.role} • Joined
              </p>
              <p className="text-sm text-gray-500">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={18} /> Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={18} /> Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-2">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={18} /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                disabled={!editing}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={18} /> Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!editing}
                placeholder="123 Main St, City, State"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* University */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                disabled={!editing}
                placeholder="MIT, Harvard, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                disabled={!editing}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              />
            </div>
          </div>

          {/* Cancel Button (when editing) */}
          {editing && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Change Password
            </h3>
            <p className="text-gray-600 mb-6">
              Update your password to keep your account secure
            </p>
            <button className="px-6 py-3 border border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50">
              Update Password
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6">
              Permanently delete your account and all associated data
            </p>
            <button className="px-6 py-3 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
