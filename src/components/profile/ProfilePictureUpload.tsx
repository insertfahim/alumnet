"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, User } from "lucide-react";

interface ProfilePictureUploadProps {
    currentPicture?: string | null;
    onUpload: (file: File) => Promise<void>;
    isUploading?: boolean;
    className?: string;
}

export default function ProfilePictureUpload({
    currentPicture,
    onUpload,
    isUploading = false,
    className = "",
}: ProfilePictureUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload the file
            onUpload(file);
        } else {
            alert("Please select a valid image file");
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const clearPreview = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const pictureUrl = previewUrl || currentPicture;

    return (
        <div className={`relative ${className}`}>
            <div
                className={`relative group cursor-pointer transition-all duration-200 ${
                    isDragOver ? "scale-105" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                {/* Profile Picture Container */}
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {pictureUrl ? (
                        <img
                            src={pictureUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User className="w-12 h-12 text-primary-600" />
                    )}
                </div>

                {/* Upload Overlay */}
                <div
                    className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200 ${
                        isDragOver || isUploading
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <Camera className="w-6 h-6 text-white" />
                    )}
                </div>

                {/* Upload Button */}
                <div className="absolute -bottom-2 -right-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg transition-colors duration-200">
                    <Upload className="w-4 h-4" />
                </div>
            </div>

            {/* Clear Preview Button */}
            {previewUrl && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        clearPreview();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors duration-200"
                >
                    <X className="w-3 h-3" />
                </button>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Drag and Drop Instructions */}
            {isDragOver && (
                <div className="absolute inset-0 bg-primary-600 bg-opacity-90 rounded-full flex items-center justify-center">
                    <p className="text-white text-sm font-medium">
                        Drop image here
                    </p>
                </div>
            )}
        </div>
    );
}
