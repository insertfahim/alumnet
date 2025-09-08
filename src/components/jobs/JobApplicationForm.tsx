"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, X, FileText, Upload } from "lucide-react";
import { Job } from "@/types";

interface JobApplicationFormProps {
    job: Job;
    onClose: () => void;
    onSuccess: () => void;
}

export function JobApplicationForm({
    job,
    onClose,
    onSuccess,
}: JobApplicationFormProps) {
    const [formData, setFormData] = useState({
        coverLetter: "",
        resumeUrl: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.coverLetter.trim()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in to apply");
                return;
            }

            const response = await fetch("/api/jobs/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    jobId: job.id,
                    coverLetter: formData.coverLetter.trim(),
                    resumeUrl: formData.resumeUrl.trim() || null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();
                onClose();
                alert("Application submitted successfully!");
            } else {
                alert(data.error || "Failed to submit application");
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("An error occurred while submitting your application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Apply for Position
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {job.company} • {job.location}
                            {job.remote && " • Remote"}
                        </p>
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    {
                                        "full-time":
                                            "bg-green-100 text-green-800",
                                        "part-time":
                                            "bg-blue-100 text-blue-800",
                                        contract:
                                            "bg-purple-100 text-purple-800",
                                        internship:
                                            "bg-orange-100 text-orange-800",
                                    }[job.type] || "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {job.type.charAt(0).toUpperCase() +
                                    job.type.slice(1).replace("-", " ")}
                            </span>
                            {job.salary && (
                                <span className="text-sm font-medium text-gray-900">
                                    {job.salary}
                                </span>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Cover Letter */}
                        <div>
                            <Label
                                htmlFor="coverLetter"
                                className="text-base font-medium"
                            >
                                Cover Letter *
                            </Label>
                            <p className="text-sm text-gray-600 mb-2">
                                Tell the employer why you're interested in this
                                position and what makes you a great fit.
                            </p>
                            <Textarea
                                id="coverLetter"
                                placeholder={`Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. As a BRACU graduate with experience in...`}
                                value={formData.coverLetter}
                                onChange={(e) =>
                                    handleInputChange(
                                        "coverLetter",
                                        e.target.value
                                    )
                                }
                                rows={8}
                                className="resize-none"
                                required
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>
                                    {formData.coverLetter.length}/1000
                                    characters
                                </span>
                                <span>
                                    {
                                        formData.coverLetter
                                            .trim()
                                            .split(/\s+/)
                                            .filter((word) => word.length > 0)
                                            .length
                                    }{" "}
                                    words
                                </span>
                            </div>
                        </div>

                        {/* Resume URL */}
                        <div>
                            <Label
                                htmlFor="resumeUrl"
                                className="text-base font-medium"
                            >
                                Resume URL (Optional)
                            </Label>
                            <p className="text-sm text-gray-600 mb-2">
                                Link to your resume (Google Drive, Dropbox,
                                LinkedIn, etc.)
                            </p>
                            <Input
                                id="resumeUrl"
                                type="url"
                                placeholder="https://drive.google.com/file/d/..."
                                value={formData.resumeUrl}
                                onChange={(e) =>
                                    handleInputChange(
                                        "resumeUrl",
                                        e.target.value
                                    )
                                }
                                className="w-full"
                            />
                        </div>

                        {/* Job Requirements Preview */}
                        {job.requirements && job.requirements.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                    Key Requirements:
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {job.requirements.map(
                                        (requirement, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-2"
                                            >
                                                <span className="text-gray-400 mt-1">
                                                    •
                                                </span>
                                                {requirement}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting || !formData.coverLetter.trim()
                                }
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    "Submitting..."
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Application
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>

                    {/* Application Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            What happens next?
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>
                                • Your application will be sent to{" "}
                                {job.postedBy.firstName} {job.postedBy.lastName}
                            </li>
                            <li>
                                • They will review your application and may
                                contact you directly
                            </li>
                            <li>
                                • You can track your application status in your
                                dashboard
                            </li>
                            <li>
                                • You'll receive updates via email about your
                                application
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
