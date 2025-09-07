"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { User, Menu, X, LogOut, Settings, Users } from "lucide-react";

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link
                                href="/"
                                className="flex items-center space-x-3"
                            >
                                <img
                                    src="https://www.bracu.ac.bd/sites/all/themes/sloth/images/f-logo.svg"
                                    alt="BRAC University Logo"
                                    className="w-10 h-10"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "/images/logos/bracu-logo.svg";
                                    }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-primary-600">
                                        BRAC University
                                    </span>
                                    <span className="text-xs text-gray-500 -mt-1">
                                        Alumni Network
                                    </span>
                                </div>
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {user && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/directory"
                                        className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                                    >
                                        Directory
                                    </Link>
                                    <Link
                                        href="/jobs"
                                        className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                                    >
                                        Jobs
                                    </Link>
                                    <Link
                                        href="/events"
                                        className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                                    >
                                        Events
                                    </Link>
                                    <Link
                                        href="/messages"
                                        className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium"
                                    >
                                        Messages
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {user ? (
                            <div className="ml-3 relative">
                                <div className="flex items-center space-x-4">
                                    {user.role === "ADMIN" && (
                                        <Link
                                            href="/admin"
                                            className="text-red-600 hover:text-red-700 px-3 py-1 rounded-md text-sm font-medium border border-red-200 hover:border-red-300"
                                        >
                                            Admin
                                        </Link>
                                    )}
                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                                    >
                                        <User className="h-5 w-5" />
                                        <span>{user.firstName}</span>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign in
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    Join Network
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/directory"
                                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Directory
                                </Link>
                                <Link
                                    href="/jobs"
                                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Jobs
                                </Link>
                                <Link
                                    href="/events"
                                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Events
                                </Link>
                                <Link
                                    href="/messages"
                                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Messages
                                </Link>
                                <button
                                    onClick={logout}
                                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    className="block px-3 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-gray-50"
                                >
                                    Join Network
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
