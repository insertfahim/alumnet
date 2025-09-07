"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"verifying" | "success" | "error">(
        "verifying"
    );
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link");
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (verificationToken: string) => {
        try {
            const response = await fetch("/api/auth/verify-email/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: verificationToken }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("success");
                setMessage("Your email has been verified successfully!");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login?verified=true");
                }, 3000);
            } else {
                setStatus("error");
                setMessage(data.error || "Verification failed");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Network error. Please try again later.");
        }
    };

    const resendVerification = async () => {
        // This would require the user's email, so redirect to a resend page
        router.push("/auth/resend-verification");
    };

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
                        {status === "verifying" && (
                            <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
                        )}
                        {status === "success" && (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        )}
                        {status === "error" && (
                            <AlertCircle className="h-12 w-12 text-red-600" />
                        )}
                    </div>

                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        {status === "verifying" && "Verifying your email..."}
                        {status === "success" && "Email verified!"}
                        {status === "error" && "Verification failed"}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">{message}</p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center space-y-4">
                        {status === "success" && (
                            <div>
                                <p className="text-sm text-gray-600 mb-4">
                                    You will be redirected to the login page in
                                    a few seconds.
                                </p>
                                <Link
                                    href="/login"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Continue to Login
                                </Link>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="space-y-3">
                                <button
                                    onClick={resendVerification}
                                    className="w-full flex justify-center py-2 px-4 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Request New Verification Email
                                </button>

                                <Link
                                    href="/login"
                                    className="block text-center text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        )}

                        {status === "verifying" && (
                            <div className="flex justify-center">
                                <div className="animate-pulse text-sm text-gray-500">
                                    Please wait while we verify your email
                                    address...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
