"use client";

import {
    useTabs,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { SearchFilters } from "@/components/mentorship/SearchFilters";
import { MentorCard } from "@/components/mentorship/MentorCard";
import { MyMentorships } from "@/components/mentorship/MyMentorships";
import { BecomeMentorForm } from "@/components/mentorship/BecomeMentorForm";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Search, UserPlus, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

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

function MentorshipTabsContent() {
    const { onValueChange } = useTabs();
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);

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

    return (
        <>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="browse" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Browse Mentors
                </TabsTrigger>
                <TabsTrigger
                    value="my-mentorships"
                    className="flex items-center gap-2"
                >
                    <Users className="h-4 w-4" />
                    My Mentorships
                </TabsTrigger>
                <TabsTrigger
                    value="become-mentor"
                    className="flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" />
                    Become a Mentor
                </TabsTrigger>
                <TabsTrigger
                    value="resources"
                    className="flex items-center gap-2"
                >
                    <BookOpen className="h-4 w-4" />
                    Resources
                </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
                <SearchFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedSkills={selectedSkills}
                    onSkillsChange={setSelectedSkills}
                    selectedExpertise={selectedExpertise}
                    onExpertiseChange={setSelectedExpertise}
                />
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : mentors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mentors.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No mentors found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your search criteria or check back
                                later.
                            </p>
                            <Button
                                onClick={() => onValueChange("become-mentor")}
                            >
                                Become a Mentor
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="my-mentorships">
                <MyMentorships />
            </TabsContent>

            <TabsContent value="become-mentor">
                <BecomeMentorForm />
            </TabsContent>

            <TabsContent value="resources">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentorship Guidelines</CardTitle>
                            <CardDescription>
                                Best practices for successful mentoring
                                relationships
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Set clear goals and expectations</li>
                                <li>• Schedule regular meetings</li>
                                <li>• Be respectful of each other's time</li>
                                <li>• Provide constructive feedback</li>
                                <li>• Maintain confidentiality</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentor Responsibilities</CardTitle>
                            <CardDescription>
                                What mentors can expect and should provide
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Share professional experiences</li>
                                <li>• Offer career guidance</li>
                                <li>• Help with skill development</li>
                                <li>• Provide networking opportunities</li>
                                <li>• Give honest feedback</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Mentee Responsibilities</CardTitle>
                            <CardDescription>
                                What mentees should bring to the relationship
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Come prepared to meetings</li>
                                <li>• Be open to feedback</li>
                                <li>• Set personal goals</li>
                                <li>• Follow through on commitments</li>
                                <li>• Show appreciation</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Success Stories</CardTitle>
                            <CardDescription>
                                Real experiences from our mentorship program
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary-500 pl-4">
                                    <p className="text-sm text-gray-600 italic">
                                        "My mentor helped me land my first job
                                        in tech. The guidance was invaluable!"
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        - Sarah, Software Engineer
                                    </p>
                                </div>
                                <div className="border-l-4 border-primary-500 pl-4">
                                    <p className="text-sm text-gray-600 italic">
                                        "Being a mentor has been incredibly
                                        rewarding. Giving back to the community
                                        feels great."
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        - Ahmed, Senior Developer
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </>
    );
}

export default function MentorshipTabs() {
    return (
        <Tabs defaultValue="browse" className="space-y-6">
            <MentorshipTabsContent />
        </Tabs>
    );
}
