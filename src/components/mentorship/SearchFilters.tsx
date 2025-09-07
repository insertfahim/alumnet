"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";

interface SearchFiltersProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedSkills: string[];
    onSkillsChange: (skills: string[]) => void;
    selectedExpertise: string[];
    onExpertiseChange: (expertise: string[]) => void;
}

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

export function SearchFilters({
    searchTerm,
    onSearchChange,
    selectedSkills,
    onSkillsChange,
    selectedExpertise,
    onExpertiseChange,
}: SearchFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleSkillToggle = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            onSkillsChange(selectedSkills.filter((s) => s !== skill));
        } else {
            onSkillsChange([...selectedSkills, skill]);
        }
    };

    const handleExpertiseToggle = (expertise: string) => {
        if (selectedExpertise.includes(expertise)) {
            onExpertiseChange(selectedExpertise.filter((e) => e !== expertise));
        } else {
            onExpertiseChange([...selectedExpertise, expertise]);
        }
    };

    const clearAllFilters = () => {
        onSearchChange("");
        onSkillsChange([]);
        onExpertiseChange([]);
    };

    const hasActiveFilters =
        searchTerm || selectedSkills.length > 0 || selectedExpertise.length > 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Find Your Mentor</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search by name, company, or major..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-600">
                            Active filters:
                        </span>
                        {searchTerm && (
                            <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                Search: {searchTerm}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => onSearchChange("")}
                                />
                            </Badge>
                        )}
                        {selectedSkills.map((skill) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {skill}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => handleSkillToggle(skill)}
                                />
                            </Badge>
                        ))}
                        {selectedExpertise.map((expertise) => (
                            <Badge
                                key={expertise}
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                {expertise}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                        handleExpertiseToggle(expertise)
                                    }
                                />
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-xs"
                        >
                            Clear all
                        </Button>
                    </div>
                )}

                {/* Filter Options */}
                {showFilters && (
                    <div className="space-y-4 pt-4 border-t">
                        {/* Skills Filter */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {availableSkills.map((skill) => (
                                    <Button
                                        key={skill}
                                        variant={
                                            selectedSkills.includes(skill)
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => handleSkillToggle(skill)}
                                        className="text-xs"
                                    >
                                        {skill}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Expertise Filter */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Areas of Expertise
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {availableExpertise.map((expertise) => (
                                    <Button
                                        key={expertise}
                                        variant={
                                            selectedExpertise.includes(
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
