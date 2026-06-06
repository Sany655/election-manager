"use client";

import React, { useState } from "react";
import DefaultLayout from "@/app/components/layout/DefaultLayout";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaUserTie, FaSave, FaArrowLeft, FaImage, FaUpload } from "react-icons/fa";
import Link from "next/link";

export default function AddCandidatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    msisdn: "",
    membership_number: "",
    organization: "",
    election_position: "",
    educational_background: "",
    professional_experience: "",
    biography: "",
    achievements: "",
    vision_mission: "",
    election_manifesto: "",
    contact_information: "",
    photo: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files[0]) {
      setFormData({ ...formData, photo: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      const res = await fetch("/frontapi/candidates", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        toast.success("Candidate created successfully!");
        router.push("/candidates/view");
      } else {
        const errorData = await res.json();
        toast.error(errorData.msg || "Failed to create candidate");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DefaultLayout title="Add Candidate">
      <ProtectedRoute permissions={["view-candidates"]}>
        <div className="p-6 bg-gray-50 min-h-screen">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/candidates/view" className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaUserTie className="text-blue-600" /> Add New Candidate
              </h1>
              <p className="text-sm text-gray-500">Fill in the candidate details below.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 space-y-8">
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3 w-full md:w-1/4">
                <div className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 relative overflow-hidden group">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FaImage className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <span className="text-xs">Upload Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer text-white flex flex-col items-center text-sm font-medium">
                      <FaUpload className="mb-1" /> Change Photo
                      <input type="file" name="photo" className="hidden" accept="image/*" onChange={handleChange} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="johndoe@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (MSISDN) *</label>
                  <input type="text" name="msisdn" required value={formData.msisdn} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+8801..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Min 6 characters" />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Membership Number</label>
                <input type="text" name="membership_number" value={formData.membership_number} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Election Position</label>
                <input type="text" name="election_position" value={formData.election_position} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Educational Background</label>
                <textarea rows={3} name="educational_background" value={formData.educational_background} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Experience</label>
                <textarea rows={3} name="professional_experience" value={formData.professional_experience} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Biography</label>
                <textarea rows={4} name="biography" value={formData.biography} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Achievements</label>
                <textarea rows={3} name="achievements" value={formData.achievements} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vision & Mission</label>
                <textarea rows={3} name="vision_mission" value={formData.vision_mission} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Election Manifesto</label>
                <textarea rows={5} name="election_manifesto" value={formData.election_manifesto} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Information (Public)</label>
                <textarea rows={2} name="contact_information" value={formData.contact_information} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="e.g. Phone, Address, Social Links"></textarea>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaSave /> {saving ? "Saving..." : "Create Candidate"}
              </button>
            </div>
          </form>
        </div>
      </ProtectedRoute>
    </DefaultLayout>
  );
}
