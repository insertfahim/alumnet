"use client";

import { useState, useEffect } from "react";
import VerifiedBadge from "@/components/verification/VerifiedBadge";
import {
    Search,
    Filter,
    MapPin,
    Building,
    GraduationCap,
    UserPlus,
    MessageCircle,
} from "lucide-react";
import { User } from "@/types";

// Mock data for demonstration
const mockAlumni: User[] = [
    {
        id: "1",
        email: "fahima.rahman@email.com",
        firstName: "Fahima",
        lastName: "Rahman",
        graduationYear: 2020,
        degree: "Bachelor's",
        major: "Computer Science and Engineering",
        currentCompany: "Samsung R&D Institute Bangladesh",
        currentPosition: "Software Engineer",
        location: "Dhaka, Bangladesh",
        bio: "BRACU CSE graduate passionate about mobile app development and AI. Currently working on innovative tech solutions in Bangladesh.",
        isVerified: true,
        role: "ALUMNI",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "2",
        email: "rafiq.ahmed@email.com",
        firstName: "Rafiq",
        lastName: "Ahmed",
        graduationYear: 2018,
        degree: "Master's",
        major: "Business Administration",
        currentCompany: "BRAC Bank Limited",
        currentPosition: "Assistant Vice President",
        location: "Dhaka, Bangladesh",
        bio: "BRAC Business School graduate with expertise in financial services and digital banking solutions.",
        isVerified: true,
        role: "ALUMNI",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "3",
        email: "sadia.akter@email.com",
        firstName: "Sadia",
        lastName: "Akter",
        graduationYear: 2019,
        degree: "Master's",
        major: "Public Health",
        currentCompany: "World Health Organization",
        currentPosition: "Public Health Consultant",
        location: "Geneva, Switzerland",
        bio: "BRACU JPGSPH graduate working on global health initiatives. Specializing in epidemiology and health policy.",
        isVerified: true,
        role: "ALUMNI",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "4",
        email: "arif.hassan@email.com",
        firstName: "Arif",
        lastName: "Hassan",
        graduationYear: 2017,
        degree: "Bachelor's",
        major: "Architecture",
        currentCompany: "Shatotto Architecture",
        currentPosition: "Senior Architect",
        location: "Dhaka, Bangladesh",
        bio: "BRACU School of Architecture graduate passionate about sustainable design and urban planning in Bangladesh.",
        isVerified: true,
        role: "ALUMNI",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "5",
        email: "maria.islam@email.com",
        firstName: "Maria",
        lastName: "Islam",
        graduationYear: 2021,
        degree: "Bachelor's",
        major: "English and Humanities",
        currentCompany: "The Daily Star",
        currentPosition: "Staff Reporter",
        location: "Dhaka, Bangladesh",
        bio: "BRACU English graduate working in journalism. Covering social issues and development stories in Bangladesh.",
        isVerified: true,
        role: "ALUMNI",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "6",
        email: "nazmus.sakib@email.com",
        firstName: "Nazmus",
        lastName: "Sakib",
        graduationYear: 2016,
        degree: "Bachelor's",
        major: "Electrical and Electronic Engineering",
        currentCompany: "Grameenphone Ltd",
        currentPosition: "Network Engineer",
        location: "Dhaka, Bangladesh",
        bio: "BRACU EEE graduate specializing in telecommunications and network infrastructure in Bangladesh.",
        isVerified: true,
        role: "ALUMNI",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export default function DirectoryPage() {
    const [alumni, setAlumni] = useState<User[]>(mockAlumni);
    const [filteredAlumni, setFilteredAlumni] = useState<User[]>(mockAlumni);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        graduationYear: "",
        major: "",
        location: "",
        company: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        filterAlumni();
    }, [searchTerm, filters]);

    const filterAlumni = () => {
        let filtered = alumni;

        // Text search
        if (searchTerm) {
            filtered = filtered.filter(
                (person) =>
                    `${person.firstName} ${person.lastName}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    person.major
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (person.currentCompany &&
                        person.currentCompany
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) ||
                    (person.currentPosition &&
                        person.currentPosition
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by graduation year
        if (filters.graduationYear) {
            filtered = filtered.filter(
                (person) =>
                    person.graduationYear.toString() === filters.graduationYear
            );
        }

        // Filter by major
        if (filters.major) {
            filtered = filtered.filter((person) =>
                person.major.toLowerCase().includes(filters.major.toLowerCase())
            );
        }

        // Filter by location
        if (filters.location) {
            filtered = filtered.filter(
                (person) =>
                    person.location &&
                    person.location
                        .toLowerCase()
                        .includes(filters.location.toLowerCase())
            );
        }

        // Filter by company
        if (filters.company) {
            filtered = filtered.filter(
                (person) =>
                    person.currentCompany &&
                    person.currentCompany
                        .toLowerCase()
                        .includes(filters.company.toLowerCase())
            );
        }

        setFilteredAlumni(filtered);
    };

    const handleConnect = (userId: string) => {
        // TODO: Implement connection request
        console.log("Connect with user:", userId);
    };

    const handleMessage = (userId: string) => {
        // TODO: Implement messaging
        console.log("Message user:", userId);
    };

    const clearFilters = () => {
        setFilters({
            graduationYear: "",
            major: "",
            location: "",
            company: "",
        });
        setSearchTerm("");
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    BRACU Alumni Directory
                </h1>
                <p className="text-lg text-gray-600">
                    Connect with fellow BRAC University graduates worldwide
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Search by name, major, company, or position..."
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <Filter className="h-5 w-5 mr-2" />
                        Filters
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label
                                    htmlFor="graduationYear"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Graduation Year
                                </label>
                                <select
                                    id="graduationYear"
                                    value={filters.graduationYear}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            graduationYear: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Any Year</option>
                                    {Array.from(
                                        { length: 20 },
                                        (_, i) => new Date().getFullYear() - i
                                    ).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="major"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Major
                                </label>
                                <input
                                    type="text"
                                    id="major"
                                    value={filters.major}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            major: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Computer Science"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="location"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    value={filters.location}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            location: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., San Francisco"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="company"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Company
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    value={filters.company}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            company: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Google"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                    Showing {filteredAlumni.length} of {alumni.length} alumni
                </p>
            </div>

            {/* Alumni Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((person) => (
                    <div
                        key={person.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold text-lg">
                                        {person.firstName[0]}
                                        {person.lastName[0]}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {person.firstName} {person.lastName}
                                        </h3>
                                        <VerifiedBadge
                                            isVerified={person.isVerified}
                                            size="sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                                <span>
                                    Class of {person.graduationYear} •{" "}
                                    {person.major}
                                </span>
                            </div>

                            {person.currentPosition &&
                                person.currentCompany && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>
                                            {person.currentPosition} at{" "}
                                            {person.currentCompany}
                                        </span>
                                    </div>
                                )}

                            {person.location && (
                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{person.location}</span>
                                </div>
                            )}
                        </div>

                        {person.bio && (
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                {person.bio}
                            </p>
                        )}

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleConnect(person.id)}
                                className="flex-1 flex items-center justify-center px-3 py-2 border border-primary-600 text-primary-600 rounded-md text-sm font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Connect
                            </button>
                            <button
                                onClick={() => handleMessage(person.id)}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Message
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredAlumni.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No alumni found
                    </h3>
                    <p className="text-gray-600">
                        Try adjusting your search criteria or filters to find
                        more alumni.
                    </p>
                </div>
            )}
        </div>
    );
}
