"use client";

import Link from "next/link";
import {
    ArrowRight,
    Users,
    Briefcase,
    Calendar,
    MessageCircle,
} from "lucide-react";

export function Hero() {
    return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center">
                    <div className="flex justify-center items-center mb-8">
                        <img
                            src="https://www.bracu.ac.bd/sites/all/themes/sloth/images/f-logo.svg"
                            alt="BRAC University Logo"
                            className="w-20 h-20 mr-4 bg-white rounded-full p-2"
                            onError={(e) => {
                                e.currentTarget.src =
                                    "/images/logos/bracu-logo.svg";
                            }}
                        />
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-white">
                                BRAC University
                            </h2>
                            <p className="text-primary-200">
                                Alumni Network Portal
                            </p>
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                        Connect with Your
                        <span className="block text-primary-200">
                            BRACU Alumni Family
                        </span>
                    </h1>
                    <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
                        Join over 22,000 BRAC University graduates worldwide.
                        Build meaningful connections, share opportunities, and
                        advance your career with fellow Bracuites across the
                        globe.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Join the BRACU Network
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/directory"
                            className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
                        >
                            Explore BRACU Alumni
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
