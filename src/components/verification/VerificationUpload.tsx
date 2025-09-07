"use client";

import { useState, useRef } from "react";
import { Upload, FileCheck, AlertCircle, CheckCircle2, X } from "lucide-react";

interface VerificationUploadProps {
    onUploadComplete?: (verification: any) => void;
    currentVerification?: any;
}

export default function VerificationUpload({
    onUploadComplete,
    currentVerification,
}: VerificationUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState("graduation_certificate");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setSuccess(null);

        // Create preview for image
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            handleFileSelect(droppedFile);
        } else {
            setError("Please select a valid image file (JPEG, PNG, or WebP)");
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const uploadFile = async () => {
        if (!file) {
            setError("Please select a file");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("documentType", documentType);

            const token = localStorage.getItem("token");
            const response = await fetch("/api/verification/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setSuccess(
                "Verification proof uploaded successfully! Your submission is under review."
            );
            setFile(null);
            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (onUploadComplete) {
                onUploadComplete(data.verification);
            }
        } catch (err: any) {
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Pending Review
                    </div>
                );
            case "APPROVED":
                return (
                    <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Verified
                    </div>
                );
            case "REJECTED":
                return (
                    <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
                        <X className="w-4 h-4 mr-1" />
                        Rejected
                    </div>
                );
            default:
                return null;
        }
    };

    // If user already has a verification, show status
    if (currentVerification) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Profile Verification
                    </h3>
                    {getStatusBadge(currentVerification.status)}
                </div>

                {currentVerification.graduationProofUrl && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Submitted Document:
                        </p>
                        <img
                            src={currentVerification.graduationProofUrl}
                            alt="Graduation Proof"
                            className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                    </div>
                )}

                {currentVerification.status === "REJECTED" &&
                    currentVerification.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong>{" "}
                                {currentVerification.rejectionReason}
                            </p>
                        </div>
                    )}

                {(currentVerification.status === "REJECTED" ||
                    currentVerification.status === "PENDING") && (
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        Upload New Document
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Verification
            </h3>
            <p className="text-gray-600 mb-6">
                Upload proof of graduation to get your profile verified with a
                blue checkmark.
            </p>

            {/* Document Type Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                </label>
                <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="graduation_certificate">
                        Graduation Certificate
                    </option>
                    <option value="diploma">Diploma</option>
                    <option value="transcript">Official Transcript</option>
                    <option value="degree_certificate">
                        Degree Certificate
                    </option>
                </select>
            </div>

            {/* File Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    file
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {preview ? (
                    <div className="space-y-4">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-w-full h-48 object-cover mx-auto rounded-lg"
                        />
                        <div className="text-sm text-gray-600">
                            {file?.name} (
                            {(file?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                            <p className="text-gray-600">
                                Drag and drop your graduation document here, or{" "}
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    browse files
                                </button>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                PNG, JPG, or WebP up to 5MB
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {/* Upload Button */}
            {file && (
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={uploadFile}
                        disabled={uploading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <FileCheck className="w-4 h-4 mr-2" />
                                Submit for Verification
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setFile(null);
                            setPreview(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                            }
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
}
