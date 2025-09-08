"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface PostJobFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function PostJobForm({ onClose, onSuccess }: PostJobFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [requirements, setRequirements] = useState<string[]>([""]);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        type: "FULL_TIME",
        remote: false,
        description: "",
        salary: "",
        durationDays: 30,
    });

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const handleRequirementChange = (index: number, value: string) => {
        const newRequirements = [...requirements];
        newRequirements[index] = value;
        setRequirements(newRequirements);
    };

    const addRequirement = () => {
        setRequirements([...requirements, ""]);
    };

    const removeRequirement = (index: number) => {
        if (requirements.length > 1) {
            setRequirements(requirements.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Filter out empty requirements
            const filteredRequirements = requirements.filter(
                (req) => req.trim() !== ""
            );

            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    ...formData,
                    requirements: filteredRequirements,
                    durationDays: parseInt(formData.durationDays.toString()),
                }),
            });

            if (response.ok) {
                alert("Job posted successfully!");
                onSuccess();
                onClose();
            } else if (response.status === 401) {
                setError("Your session has expired. Please log in again to continue.");
                window.location.href = "/login";
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to post job");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to post job");
        } finally {
            setLoading(false);
        }
    };

    if (!user?.isVerified) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            Verification Required
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Only verified alumni can post job opportunities. Please
                        verify your account first.
                    </p>
                    <button onClick={onClose} className="w-full btn-primary">
                        Understood
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Post a Job</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Job Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Job Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., Senior Software Engineer"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label
                            htmlFor="company"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Company *
                        </label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., Samsung R&D Institute Bangladesh"
                        />
                    </div>

                    {/* Location and Remote */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="location"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g., Dhaka, Bangladesh"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <input
                                type="checkbox"
                                id="remote"
                                name="remote"
                                checked={formData.remote}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="remote"
                                className="ml-2 block text-sm text-gray-700"
                            >
                                Remote work available
                            </label>
                        </div>
                    </div>

                    {/* Job Type and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="type"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Job Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="durationDays"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Post Duration (Days)
                            </label>
                            <input
                                type="number"
                                id="durationDays"
                                name="durationDays"
                                value={formData.durationDays}
                                onChange={handleInputChange}
                                min="7"
                                max="90"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Salary */}
                    <div>
                        <label
                            htmlFor="salary"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Salary (Optional)
                        </label>
                        <input
                            type="text"
                            id="salary"
                            name="salary"
                            value={formData.salary}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., ৳80,000 - ৳120,000 or $50,000 - $70,000"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Job Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Describe the role, responsibilities, and what you're looking for..."
                        />
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Requirements
                        </label>
                        <div className="space-y-2">
                            {requirements.map((requirement, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={requirement}
                                        onChange={(e) =>
                                            handleRequirementChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="e.g., 3+ years of experience with React"
                                    />
                                    {requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeRequirement(index)
                                            }
                                            className="p-2 text-red-600 hover:text-red-800"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addRequirement}
                                className="flex items-center text-primary-600 hover:text-primary-800"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Requirement
                            </button>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? "Posting..." : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
