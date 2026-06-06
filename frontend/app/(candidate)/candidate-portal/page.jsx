"use client";

import React, { useState, useEffect } from "react";
import CandidateLayout from "@/app/components/layout/CandidateLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Loader from "@/app/components/Loader";
import toast from "react-hot-toast";
import { FaUserEdit, FaSave, FaVideo, FaImage, FaFileAlt } from "react-icons/fa";

export default function CandidatePortal() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    bio: "",
    menifesto: "",
    intro_video_url: "",
    photo_url: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/frontapi/candidates/profile/me");
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setProfile({
            bio: result.data.bio || "",
            menifesto: result.data.menifesto || "",
            intro_video_url: result.data.intro_video_url || "",
            photo_url: result.data.photo || ""
          });
          if (result.data.photo) {
            setPhotoPreview(`${process.env.NEXT_PUBLIC_BASE_URL}/` + result.data.photo);
          }
        }
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("bio", profile.bio);
      formData.append("menifesto", profile.menifesto);
      formData.append("intro_video_url", profile.intro_video_url);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await fetch("/frontapi/candidates/profile/me", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        fetchProfile(); // Refresh
      } else {
        const errorData = await res.json();
        toast.error(errorData.msg || "Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CandidateLayout title="Candidate Dashboard">
      <ProtectedRoute allowedRoles={['candidate']}>
        {loading ? (
          <Loader />
        ) : (
          <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaUserEdit /> Update Your Candidate Profile
              </h2>
              <p className="text-blue-100 mt-2">
                Manage your public information, manifesto, and media.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-40 h-40 rounded-full border-4 border-gray-100 shadow-lg overflow-hidden bg-gray-50 flex justify-center items-center relative group">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FaImage className="text-gray-300 w-16 h-16" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer text-white flex flex-col items-center">
                        <FaUserEdit className="w-6 h-6 mb-1" />
                        <span className="text-sm font-medium">Change Photo</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Square image recommended</p>
                </div>

                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaVideo className="text-indigo-500" /> Introduction Video URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={profile.intro_video_url}
                      onChange={(e) => setProfile({ ...profile, intro_video_url: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FaFileAlt className="text-indigo-500" /> Short Bio
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell the voters about yourself..."
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FaFileAlt className="text-indigo-500" /> Manifesto
                </label>
                <textarea
                  rows={8}
                  placeholder="Detail your promises and vision here..."
                  value={profile.menifesto}
                  onChange={(e) => setProfile({ ...profile, menifesto: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all ${saving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}
                >
                  <FaSave />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </form>
          </div>
        )}
      </ProtectedRoute>
    </CandidateLayout>
  );
}
