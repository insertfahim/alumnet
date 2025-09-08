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
    Loader2,
} from "lucide-react";
import { User } from "@/types";

// Remove mock data - will fetch from API instead

export default function DirectoryPage() {
    const [alumni, setAlumni] = useState<User[]>([]);
    const [filteredAlumni, setFilteredAlumni] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        graduationYear: "",
        major: "",
        location: "",
        company: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch alumni data from API
    useEffect(() => {
        fetchAlumni();
    }, []);

    // Filter alumni when search term or filters change
    useEffect(() => {
        filterAlumni();
    }, [searchTerm, filters, alumni]);

    const fetchAlumni = async () => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append("search", searchTerm);
            if (filters.graduationYear)
                queryParams.append("graduationYear", filters.graduationYear);
            if (filters.major) queryParams.append("major", filters.major);
            if (filters.location)
                queryParams.append("location", filters.location);
            if (filters.company) queryParams.append("company", filters.company);

            const response = await fetch(
                `/api/alumni?${queryParams.toString()}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch alumni data");
            }

            const data = await response.json();
            setAlumni(data);
        } catch (err) {
            console.error("Error fetching alumni:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load alumni"
            );
        } finally {
            setLoading(false);
        }
    };

    const filterAlumni = () => {
        if (!alumni.length) return;

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
                {loading ? (
                    <div className="flex items-center text-gray-600">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading alumni...
                    </div>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <p className="text-gray-600">
                        Showing {filteredAlumni.length} of {alumni.length}{" "}
                        alumni
                    </p>
                )}
            </div>

            {/* Alumni Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="ml-3">
                                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="flex space-x-2">
                                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                                <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                        <Search className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error loading alumni
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchAlumni}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
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
                                                {person.firstName}{" "}
                                                {person.lastName}
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
            )}

            {!loading && !error && filteredAlumni.length === 0 && (
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
