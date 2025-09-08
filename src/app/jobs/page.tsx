"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    MapPin,
    Building,
    Clock,
    DollarSign,
    Plus,
    Briefcase,
    Users,
} from "lucide-react";
import { Job } from "@/types";
import { useAuth } from "@/components/providers/AuthProvider";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { MyApplications } from "@/components/jobs/MyApplications";

// Mock data for demonstration
const mockJobs: Job[] = [
    {
        id: "1",
        title: "Senior Software Engineer",
        company: "Samsung R&D Institute Bangladesh",
        location: "Dhaka, Bangladesh",
        type: "full-time",
        remote: false,
        description:
            "Join Samsung R&D Institute Bangladesh as a Senior Software Engineer. Work on cutting-edge mobile technologies and innovative software solutions.",
        requirements: [
            "5+ years of experience in software development",
            "React, Node.js, TypeScript",
            "Experience with Android/iOS development",
            "BRACU graduates preferred",
        ],
        salary: "৳80,000 - ৳120,000",
        postedById: "1",
        postedBy: {
            id: "1",
            email: "fahima.rahman@email.com",
            firstName: "Fahima",
            lastName: "Rahman",
            graduationYear: 2018,
            degree: "Bachelor's",
            major: "Computer Science and Engineering",
            role: "ALUMNI",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        applications: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
        id: "2",
        title: "Assistant Vice President",
        company: "BRAC Bank Limited",
        location: "Dhaka, Bangladesh",
        type: "full-time",
        remote: false,
        description:
            "BRAC Bank Limited is seeking an Assistant Vice President to join our corporate banking division. Lead strategic initiatives and drive business growth.",
        requirements: [
            "MBA or equivalent",
            "8+ years in banking/finance",
            "Leadership experience",
            "Strong analytical skills",
        ],
        salary: "৳150,000 - ৳200,000",
        postedById: "2",
        postedBy: {
            id: "2",
            email: "rafiq.ahmed@email.com",
            firstName: "Rafiq",
            lastName: "Ahmed",
            graduationYear: 2016,
            degree: "Master's",
            major: "Business Administration",
            role: "ALUMNI",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        applications: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
        id: "2",
        title: "Product Manager",
        company: "Global Consulting",
        location: "New York, NY",
        type: "full-time",
        remote: false,
        description:
            "Join our product team to drive innovation and deliver exceptional user experiences. You will work closely with engineering and design teams.",
        requirements: [
            "3+ years in product management",
            "Strong analytical skills",
            "Experience with agile methodologies",
        ],
        salary: "$90,000 - $130,000",
        postedById: "2",
        postedBy: {
            id: "2",
            email: "jane.smith@email.com",
            firstName: "Jane",
            lastName: "Smith",
            graduationYear: 2016,
            degree: "Master's",
            major: "Business Administration",
            role: "ALUMNI",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        applications: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
    {
        id: "3",
        title: "UX Designer",
        company: "Creative Agency",
        location: "Los Angeles, CA",
        type: "contract",
        remote: true,
        description:
            "We are seeking a talented UX Designer to create intuitive and engaging user experiences for our clients' digital products.",
        requirements: [
            "Portfolio demonstrating UX skills",
            "Figma and Adobe Creative Suite",
            "2+ years of experience",
        ],
        salary: "$70 - $90 per hour",
        postedById: "3",
        postedBy: {
            id: "3",
            email: "mike.johnson@email.com",
            firstName: "Mike",
            lastName: "Johnson",
            graduationYear: 2019,
            degree: "Bachelor's",
            major: "Design",
            role: "ALUMNI",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        applications: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
];

export default function JobsPage() {
    const { user, loading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        type: "",
        location: "",
        remote: "",
        company: "",
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedJobForApplication, setSelectedJobForApplication] =
        useState<Job | null>(null);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [activeTab, setActiveTab] = useState<"browse" | "applications">(
        "browse"
    );

    useEffect(() => {
        filterJobs();
    }, [searchTerm, filters]);

    const filterJobs = () => {
        let filtered = jobs;

        // Text search
        if (searchTerm) {
            filtered = filtered.filter(
                (job) =>
                    job.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    job.company
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    job.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Filter by job type
        if (filters.type) {
            filtered = filtered.filter((job) => job.type === filters.type);
        }

        // Filter by location
        if (filters.location) {
            filtered = filtered.filter((job) =>
                job.location
                    .toLowerCase()
                    .includes(filters.location.toLowerCase())
            );
        }

        // Filter by remote
        if (filters.remote) {
            const isRemote = filters.remote === "true";
            filtered = filtered.filter((job) => job.remote === isRemote);
        }

        // Filter by company
        if (filters.company) {
            filtered = filtered.filter((job) =>
                job.company
                    .toLowerCase()
                    .includes(filters.company.toLowerCase())
            );
        }

        setFilteredJobs(filtered);
    };

    const clearFilters = () => {
        setFilters({
            type: "",
            location: "",
            remote: "",
            company: "",
        });
        setSearchTerm("");
    };

    const handleApply = (jobId: string) => {
        if (!user) {
            alert("Please log in to apply for jobs");
            window.location.href = "/login";
            return;
        }

        const job = jobs.find((j) => j.id === jobId);
        if (job) {
            setSelectedJobForApplication(job);
            setShowApplicationForm(true);
        }
    };

    const handleApplicationSuccess = () => {
        // Refresh the jobs or show success message
        setShowApplicationForm(false);
        setSelectedJobForApplication(null);
        // Optionally switch to applications tab to show the new application
        setActiveTab("applications");
    };

    const getJobTypeColor = (type: string) => {
        switch (type) {
            case "full-time":
                return "bg-green-100 text-green-800";
            case "part-time":
                return "bg-blue-100 text-blue-800";
            case "contract":
                return "bg-purple-100 text-purple-800";
            case "internship":
                return "bg-orange-100 text-orange-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatJobType = (type: string) => {
        return type
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getDaysAgo = (date: Date) => {
        const days = Math.floor(
            (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";
        return `${days} days ago`;
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        BRACU Career Opportunities
                    </h1>
                    <p className="text-lg text-gray-600">
                        Discover opportunities shared by BRAC University alumni
                        worldwide
                    </p>
                </div>
                <button className="btn-primary flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Post a Job
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab("browse")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "browse"
                                    ? "border-primary-500 text-primary-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Browse Jobs
                            </div>
                        </button>
                        {user && (
                            <button
                                onClick={() => setActiveTab("applications")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "applications"
                                        ? "border-primary-500 text-primary-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    My Applications
                                </div>
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "browse" ? (
                <>
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
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Search by title, company, or keywords..."
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
                                            htmlFor="type"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Job Type
                                        </label>
                                        <select
                                            id="type"
                                            value={filters.type}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    type: e.target.value,
                                                }))
                                            }
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">All Types</option>
                                            <option value="full-time">
                                                Full Time
                                            </option>
                                            <option value="part-time">
                                                Part Time
                                            </option>
                                            <option value="contract">
                                                Contract
                                            </option>
                                            <option value="internship">
                                                Internship
                                            </option>
                                        </select>
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
                                            htmlFor="remote"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Remote Work
                                        </label>
                                        <select
                                            id="remote"
                                            value={filters.remote}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    remote: e.target.value,
                                                }))
                                            }
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="">Any</option>
                                            <option value="true">
                                                Remote OK
                                            </option>
                                            <option value="false">
                                                On-site Only
                                            </option>
                                        </select>
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
                            Showing {filteredJobs.length} of {jobs.length} job
                            opportunities
                        </p>
                    </div>

                    {/* Jobs List */}
                    <div className="space-y-6">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900 mr-3">
                                                {job.title}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getJobTypeColor(
                                                    job.type
                                                )}`}
                                            >
                                                {formatJobType(job.type)}
                                            </span>
                                            {job.remote && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Remote OK
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center text-gray-600 mb-3 space-x-4">
                                            <div className="flex items-center">
                                                <Building className="w-4 h-4 mr-1" />
                                                <span>{job.company}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span>{job.location}</span>
                                            </div>
                                            {job.salary && (
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 mr-1" />
                                                    <span>{job.salary}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                            {job.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span>
                                                    Posted by{" "}
                                                    {job.postedBy.firstName}{" "}
                                                    {job.postedBy.lastName}
                                                </span>
                                                <span className="mx-2">•</span>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    <span>
                                                        {getDaysAgo(
                                                            job.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleApply(job.id)
                                                }
                                                className="btn-primary"
                                            >
                                                Apply Now
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Requirements */}
                                {job.requirements.length > 0 && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            Key Requirements:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {job.requirements
                                                .slice(0, 3)
                                                .map((requirement, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        {requirement}
                                                    </span>
                                                ))}
                                            {job.requirements.length > 3 && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    +
                                                    {job.requirements.length -
                                                        3}{" "}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredJobs.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">
                                <Briefcase className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No jobs found
                            </h3>
                            <p className="text-gray-600">
                                Try adjusting your search criteria or filters to
                                find more opportunities.
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <MyApplications />
            )}

            {/* Job Application Form Modal */}
            {showApplicationForm && selectedJobForApplication && (
                <JobApplicationForm
                    job={selectedJobForApplication}
                    onClose={() => {
                        setShowApplicationForm(false);
                        setSelectedJobForApplication(null);
                    }}
                    onSuccess={handleApplicationSuccess}
                />
            )}
        </div>
    );
}
