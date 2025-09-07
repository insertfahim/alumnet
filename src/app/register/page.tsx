"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    GraduationCap,
    Building,
    AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        graduationYear: "",
        degree: "",
        major: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            const success = await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                graduationYear: parseInt(formData.graduationYear),
                degree: formData.degree,
                major: formData.major,
            });

            if (success) {
                router.push("/dashboard");
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-4">
                        <img
                            src="https://www.bracu.ac.bd/sites/all/themes/sloth/images/f-logo.svg"
                            alt="BRAC University Logo"
                            className="w-12 h-12 mr-3"
                            onError={(e) => {
                                e.currentTarget.src =
                                    "/images/logos/bracu-logo.svg";
                            }}
                        />
                        <UserPlus className="h-12 w-12 text-primary-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Join the BRACU Alumni Network
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Connect with 22,000+ BRAC University graduates
                        worldwide. <br />
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="First name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Create a password"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="graduationYear"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Graduation Year
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <GraduationCap className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="graduationYear"
                                    name="graduationYear"
                                    required
                                    value={formData.graduationYear}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select year</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="degree"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Degree
                            </label>
                            <div className="mt-1">
                                <input
                                    id="degree"
                                    name="degree"
                                    type="text"
                                    required
                                    value={formData.degree}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Bachelor's, Master's, PhD"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="major"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Major/Field of Study
                            </label>
                            <div className="mt-1">
                                <input
                                    id="major"
                                    name="major"
                                    type="text"
                                    required
                                    value={formData.major}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Computer Science, Business"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
