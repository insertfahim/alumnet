"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Save, X } from "lucide-react";

const availableSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Django",
    "Spring",
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "AWS",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "Data Science",
    "DevOps",
    "Cybersecurity",
];

const availableExpertise = [
    "Software Development",
    "Web Development",
    "Mobile Development",
    "Data Engineering",
    "System Architecture",
    "Product Management",
    "Technical Leadership",
    "Career Development",
    "Interview Preparation",
    "Startup Advice",
    "Entrepreneurship",
    "Research & Academia",
];

const availabilityOptions = [
    "Weekdays 9AM-5PM",
    "Evenings after 5PM",
    "Weekends",
    "Flexible",
    "Weekdays mornings",
    "Weekdays afternoons",
    "Limited availability",
];

export function BecomeMentorForm() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        skills: [] as string[],
        expertise: [] as string[],
        bio: "",
        experience: "",
        availability: "",
        hourlyRate: "",
    });

    useEffect(() => {
        fetchExistingProfile();
    }, []);

    const fetchExistingProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/mentorship/become-mentor", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.profile) {
                    setFormData({
                        skills: data.profile.skills || [],
                        expertise: data.profile.expertise || [],
                        bio: data.profile.bio || "",
                        experience: data.profile.experience || "",
                        availability: data.profile.availability || "",
                        hourlyRate: data.profile.hourlyRate?.toString() || "",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching existing profile:", error);
        }
    };
    const handleSkillToggle = (skill: string) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter((s) => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const handleExpertiseToggle = (expertise: string) => {
        setFormData((prev) => ({
            ...prev,
            expertise: prev.expertise.includes(expertise)
                ? prev.expertise.filter((e) => e !== expertise)
                : [...prev.expertise, expertise],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/mentorship/become-mentor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    hourlyRate: formData.hourlyRate
                        ? parseFloat(formData.hourlyRate)
                        : null,
                }),
            });

            if (response.ok) {
                setIsEditing(false);
                // TODO: Refresh mentor profile data
            } else {
                console.error("Failed to update mentor profile");
            }
        } catch (error) {
            console.error("Error updating mentor profile:", error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // TODO: Reset form data to current profile
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Become a Mentor
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Share your expertise and help fellow BRACU
                                alumni grow in their careers.
                            </p>
                        </div>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)}>
                                {formData.skills.length > 0
                                    ? "Edit Profile"
                                    : "Create Profile"}
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {!isEditing ? (
                        <div className="space-y-4">
                            {formData.skills.length > 0 ? (
                                <>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Your Skills
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.map((skill) => (
                                                <Badge
                                                    key={skill}
                                                    variant="secondary"
                                                >
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Areas of Expertise
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.expertise.map((exp) => (
                                                <Badge
                                                    key={exp}
                                                    variant="outline"
                                                >
                                                    {exp}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.bio && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Bio
                                            </h4>
                                            <p className="text-gray-700">
                                                {formData.bio}
                                            </p>
                                        </div>
                                    )}

                                    {formData.experience && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Experience
                                            </h4>
                                            <p className="text-gray-700">
                                                {formData.experience}
                                            </p>
                                        </div>
                                    )}

                                    {formData.availability && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Availability
                                            </h4>
                                            <p className="text-gray-700">
                                                {formData.availability}
                                            </p>
                                        </div>
                                    )}

                                    {formData.hourlyRate && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Hourly Rate
                                            </h4>
                                            <p className="text-gray-700">
                                                ${formData.hourlyRate}/hour
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Create Your Mentor Profile
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Set up your profile to start mentoring
                                        fellow BRACU alumni.
                                    </p>
                                    <Button onClick={() => setIsEditing(true)}>
                                        Get Started
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Skills */}
                            <div>
                                <Label className="text-base font-medium">
                                    Skills
                                </Label>
                                <p className="text-sm text-gray-600 mb-3">
                                    Select the technical skills you can help
                                    others with
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availableSkills.map((skill) => (
                                        <Button
                                            key={skill}
                                            type="button"
                                            variant={
                                                formData.skills.includes(skill)
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handleSkillToggle(skill)
                                            }
                                            className="text-xs"
                                        >
                                            {skill}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Expertise */}
                            <div>
                                <Label className="text-base font-medium">
                                    Areas of Expertise
                                </Label>
                                <p className="text-sm text-gray-600 mb-3">
                                    Select the areas where you can provide
                                    guidance
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availableExpertise.map((expertise) => (
                                        <Button
                                            key={expertise}
                                            type="button"
                                            variant={
                                                formData.expertise.includes(
                                                    expertise
                                                )
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handleExpertiseToggle(expertise)
                                            }
                                            className="text-xs"
                                        >
                                            {expertise}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <Label
                                    htmlFor="bio"
                                    className="text-base font-medium"
                                >
                                    Bio
                                </Label>
                                <p className="text-sm text-gray-600 mb-2">
                                    Tell potential mentees about yourself and
                                    your mentoring approach
                                </p>
                                <Textarea
                                    id="bio"
                                    placeholder="I'm a software engineer with 5+ years of experience..."
                                    value={formData.bio}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>
                                    ) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            bio: e.target.value,
                                        }))
                                    }
                                    rows={4}
                                />
                            </div>

                            {/* Experience */}
                            <div>
                                <Label
                                    htmlFor="experience"
                                    className="text-base font-medium"
                                >
                                    Professional Experience
                                </Label>
                                <p className="text-sm text-gray-600 mb-2">
                                    Briefly describe your relevant professional
                                    background
                                </p>
                                <Textarea
                                    id="experience"
                                    placeholder="Senior Software Engineer at Tech Corp, previously..."
                                    value={formData.experience}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>
                                    ) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            experience: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                />
                            </div>

                            {/* Availability */}
                            <div>
                                <Label className="text-base font-medium">
                                    Availability
                                </Label>
                                <p className="text-sm text-gray-600 mb-3">
                                    When are you typically available for
                                    mentoring sessions?
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availabilityOptions.map((option) => (
                                        <Button
                                            key={option}
                                            type="button"
                                            variant={
                                                formData.availability === option
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    availability: option,
                                                }))
                                            }
                                            className="text-xs"
                                        >
                                            {option}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div>
                                <Label
                                    htmlFor="hourlyRate"
                                    className="text-base font-medium"
                                >
                                    Hourly Rate (Optional)
                                </Label>
                                <p className="text-sm text-gray-600 mb-2">
                                    Set an hourly rate if you charge for
                                    mentoring sessions
                                </p>
                                <div className="flex items-center">
                                    <span className="text-gray-500 mr-2">
                                        $
                                    </span>
                                    <Input
                                        id="hourlyRate"
                                        type="number"
                                        placeholder="50"
                                        value={formData.hourlyRate}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                hourlyRate: e.target.value,
                                            }))
                                        }
                                        className="max-w-24"
                                    />
                                    <span className="text-gray-500 ml-2">
                                        /hour
                                    </span>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Profile
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
                <CardHeader>
                    <CardTitle>Mentor Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>
                                Be respectful and professional in all
                                interactions with mentees.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>
                                Set clear expectations about availability and
                                communication frequency.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>
                                Provide constructive feedback and actionable
                                advice.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>
                                Maintain confidentiality of personal and
                                professional information shared.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                            <p>
                                Help mentees develop their own problem-solving
                                skills rather than doing the work for them.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
