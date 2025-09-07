"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    User,
    Edit,
    MapPin,
    Building,
    GraduationCap,
    Calendar,
    Globe,
    Linkedin,
    Github,
} from "lucide-react";

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        bio: "",
        currentCompany: "",
        currentPosition: "",
        location: "",
        linkedinUrl: "",
        githubUrl: "",
        website: "",
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                bio: user.bio || "",
                currentCompany: user.currentCompany || "",
                currentPosition: user.currentPosition || "",
                location: user.location || "",
                linkedinUrl: user.linkedinUrl || "",
                githubUrl: user.githubUrl || "",
                website: user.website || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        // TODO: Implement profile update API call
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Please log in to view your profile
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-primary-600" />
                                )}
                            </div>
                            <div className="ml-6">
                                <h1 className="text-3xl font-bold text-white">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-primary-100">
                                    {profileData.currentPosition &&
                                    profileData.currentCompany
                                        ? `${profileData.currentPosition} at ${profileData.currentCompany}`
                                        : "Alumni Member"}
                                </p>
                                <div className="flex items-center mt-2 text-primary-100">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    <span>
                                        Class of {user.graduationYear} •{" "}
                                        {user.major}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* About Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    About
                                </h2>
                                {isEditing ? (
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) =>
                                            setProfileData((prev) => ({
                                                ...prev,
                                                bio: e.target.value,
                                            }))
                                        }
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="text-gray-700">
                                        {profileData.bio || "No bio added yet."}
                                    </p>
                                )}
                            </div>

                            {/* Experience Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Current Position
                                </h2>
                                {isEditing ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Position
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    profileData.currentPosition
                                                }
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        currentPosition:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Your current position"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                value={
                                                    profileData.currentCompany
                                                }
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        currentCompany:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Your current company"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-gray-700">
                                        <Building className="w-5 h-5 mr-3 text-gray-400" />
                                        <span>
                                            {profileData.currentPosition &&
                                            profileData.currentCompany
                                                ? `${profileData.currentPosition} at ${profileData.currentCompany}`
                                                : "No current position added"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Education Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Education
                                </h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <GraduationCap className="w-5 h-5 mr-3 text-primary-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {user.degree} in {user.major}
                                            </p>
                                            <p className="text-gray-600">
                                                Class of {user.graduationYear}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Contact Information */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Contact Information
                                </h3>
                                <div className="space-y-3">
                                    {/* Location */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Location
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        location:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Your location"
                                            />
                                        ) : (
                                            <div className="flex items-center text-gray-700">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>
                                                    {profileData.location ||
                                                        "Not specified"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* LinkedIn */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            LinkedIn
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                value={profileData.linkedinUrl}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        linkedinUrl:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="LinkedIn profile URL"
                                            />
                                        ) : profileData.linkedinUrl ? (
                                            <a
                                                href={profileData.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-primary-600 hover:text-primary-700"
                                            >
                                                <Linkedin className="w-4 h-4 mr-2" />
                                                <span>LinkedIn Profile</span>
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">
                                                Not added
                                            </span>
                                        )}
                                    </div>

                                    {/* GitHub */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            GitHub
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                value={profileData.githubUrl}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        githubUrl:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="GitHub profile URL"
                                            />
                                        ) : profileData.githubUrl ? (
                                            <a
                                                href={profileData.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-primary-600 hover:text-primary-700"
                                            >
                                                <Github className="w-4 h-4 mr-2" />
                                                <span>GitHub Profile</span>
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">
                                                Not added
                                            </span>
                                        )}
                                    </div>

                                    {/* Website */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Website
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="url"
                                                value={profileData.website}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        website: e.target.value,
                                                    }))
                                                }
                                                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Personal website URL"
                                            />
                                        ) : profileData.website ? (
                                            <a
                                                href={profileData.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center text-primary-600 hover:text-primary-700"
                                            >
                                                <Globe className="w-4 h-4 mr-2" />
                                                <span>Personal Website</span>
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">
                                                Not added
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <button
                                        onClick={handleSave}
                                        className="w-full mt-4 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Network Stats
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Connections
                                        </span>
                                        <span className="font-semibold">0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Posts
                                        </span>
                                        <span className="font-semibold">0</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Events Attended
                                        </span>
                                        <span className="font-semibold">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
