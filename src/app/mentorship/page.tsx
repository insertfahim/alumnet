"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import MentorshipTabs from "@/components/mentorship/MentorshipTabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MentorProfile {
    id: string;
    userId: string;
    skills: string[];
    expertise: string[];
    bio?: string;
    experience?: string;
    availability?: string;
    isActive: boolean;
    hourlyRate?: number;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        currentCompany?: string;
        currentPosition?: string;
        graduationYear: number;
        major: string;
    };
}

export default function MentorshipPage() {
    const { user, loading: authLoading } = useAuth();
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
    const [showBecomeMentor, setShowBecomeMentor] = useState(false);

    useEffect(() => {
        fetchMentors();
    }, [searchTerm, selectedSkills, selectedExpertise]);

    const fetchMentors = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (selectedSkills.length > 0)
                params.append("skills", selectedSkills.join(","));
            if (selectedExpertise.length > 0)
                params.append("expertise", selectedExpertise.join(","));

            const response = await fetch(`/api/mentorship/mentors?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setMentors(data);
            }
        } catch (error) {
            console.error("Error fetching mentors:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading mentorship program...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>Access Restricted</CardTitle>
                        <CardDescription>
                            Please sign in to access the mentorship program.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button>
                            <a href="/login">Sign In</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Mentorship Program
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Connect with experienced BRACU alumni mentors or become
                        a mentor yourself. Share knowledge, gain insights, and
                        accelerate your career growth.
                    </p>
                </div>

                <MentorshipTabs />
            </div>
        </div>
    );
}
