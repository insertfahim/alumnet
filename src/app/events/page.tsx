"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Plus,
    Filter,
    Search,
} from "lucide-react";
import { Event } from "@/types";

// Mock data for demonstration
const mockEvents: Event[] = [
    {
        id: "1",
        title: "BRACU Homecoming 2024",
        description:
            "Join us for the annual BRAC University Homecoming celebration with networking, cultural performances, and special presentations from distinguished alumni. Celebrate the legacy of Sir Fazle Hasan Abed.",
        location: "BRAC University Campus, Merul Badda, Dhaka",
        virtual: false,
        startDate: new Date("2024-12-15T15:00:00"),
        endDate: new Date("2024-12-15T20:00:00"),
        maxAttendees: 500,
        price: 2000,
        organizerId: "1",
        organizer: {
            id: "1",
            email: "ocsar@bracu.ac.bd",
            firstName: "OCSAR",
            lastName: "BRACU",
            graduationYear: 2001,
            degree: "Staff",
            major: "Alumni Relations",
            role: "ALUMNI",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        attendees: [],
        createdAt: new Date(),
    },
    {
        id: "2",
        title: "BRACU Tech Meetup - AI & Innovation",
        description:
            "Connect with BRAC University alumni working in technology and AI. Learn about career opportunities in Bangladesh's growing tech sector and share industry insights.",
        location: "Virtual Event",
        virtual: true,
        startDate: new Date("2024-05-20T19:00:00"),
        endDate: new Date("2024-05-20T21:00:00"),
        maxAttendees: 100,
        organizerId: "2",
        organizer: {
            id: "2",
            email: "john.doe@email.com",
            firstName: "John",
            lastName: "Doe",
            graduationYear: 2018,
            degree: "Bachelor's",
            major: "Computer Science",
            role: "ALUMNI",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        attendees: [],
        createdAt: new Date(),
    },
    {
        id: "3",
        title: "Business Alumni Breakfast",
        description:
            "Morning networking event for business alumni. Enjoy breakfast while discussing industry trends and opportunities.",
        location: "Downtown Business Center",
        virtual: false,
        startDate: new Date("2024-05-25T08:00:00"),
        endDate: new Date("2024-05-25T10:00:00"),
        maxAttendees: 50,
        price: 25,
        organizerId: "3",
        organizer: {
            id: "3",
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
        attendees: [],
        createdAt: new Date(),
    },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        type: "",
        date: "",
        location: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        filterEvents();
    }, [searchTerm, filters]);

    const filterEvents = () => {
        let filtered = events;

        // Text search
        if (searchTerm) {
            filtered = filtered.filter(
                (event) =>
                    event.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    event.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    event.location
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type (virtual/in-person)
        if (filters.type) {
            const isVirtual = filters.type === "virtual";
            filtered = filtered.filter((event) => event.virtual === isVirtual);
        }

        // Filter by date
        if (filters.date) {
            const now = new Date();
            const filterDate = new Date(filters.date);
            filtered = filtered.filter((event) => {
                const eventDate = new Date(event.startDate);
                return eventDate.toDateString() === filterDate.toDateString();
            });
        }

        // Filter by location
        if (filters.location) {
            filtered = filtered.filter((event) =>
                event.location
                    .toLowerCase()
                    .includes(filters.location.toLowerCase())
            );
        }

        setFilteredEvents(filtered);
    };

    const clearFilters = () => {
        setFilters({
            type: "",
            date: "",
            location: "",
        });
        setSearchTerm("");
    };

    const handleRSVP = (
        eventId: string,
        status: "going" | "maybe" | "not-going"
    ) => {
        // TODO: Implement RSVP functionality
        console.log("RSVP to event:", eventId, "Status:", status);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }).format(date);
    };

    const isEventPast = (endDate: Date) => {
        return endDate < new Date();
    };

    const isEventToday = (startDate: Date) => {
        const today = new Date();
        return startDate.toDateString() === today.toDateString();
    };

    return (
        <div className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        BRACU Alumni Events
                    </h1>
                    <p className="text-lg text-gray-600">
                        Discover and attend events organized by BRAC University
                        alumni community worldwide
                    </p>
                </div>
                <button className="btn-primary flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                </button>
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
                            placeholder="Search events by title, description, or location..."
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    htmlFor="type"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Event Type
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
                                    <option value="virtual">Virtual</option>
                                    <option value="in-person">In-Person</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    value={filters.date}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            date: e.target.value,
                                        }))
                                    }
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                    Showing {filteredEvents.length} of {events.length} events
                </p>
            </div>

            {/* Events List */}
            <div className="space-y-6">
                {filteredEvents.map((event) => (
                    <div
                        key={event.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                                            {event.title}
                                        </h3>
                                        {event.virtual ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Virtual
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                In-Person
                                            </span>
                                        )}
                                        {isEventToday(event.startDate) && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Today
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <div>
                                                <p className="font-medium">
                                                    {formatDate(
                                                        event.startDate
                                                    )}
                                                </p>
                                                <p className="text-sm">
                                                    {formatTime(
                                                        event.startDate
                                                    )}{" "}
                                                    -{" "}
                                                    {formatTime(event.endDate)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{event.location}</span>
                                        </div>

                                        <div className="flex items-center text-gray-600">
                                            <Users className="w-5 h-5 mr-2" />
                                            <span>
                                                {event.attendees.length}{" "}
                                                attending
                                                {event.maxAttendees &&
                                                    ` (${event.maxAttendees} max)`}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4">
                                        {event.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span>
                                                Organized by{" "}
                                                {event.organizer.firstName}{" "}
                                                {event.organizer.lastName}
                                            </span>
                                            {event.price && (
                                                <>
                                                    <span className="mx-2">
                                                        •
                                                    </span>
                                                    <span>${event.price}</span>
                                                </>
                                            )}
                                        </div>

                                        {!isEventPast(event.endDate) ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleRSVP(
                                                            event.id,
                                                            "going"
                                                        )
                                                    }
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                >
                                                    I'm Going
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleRSVP(
                                                            event.id,
                                                            "maybe"
                                                        )
                                                    }
                                                    className="px-4 py-2 border border-primary-600 text-primary-600 rounded-md text-sm font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                >
                                                    Maybe
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500 font-medium">
                                                Event Ended
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        <Calendar className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No events found
                    </h3>
                    <p className="text-gray-600">
                        Try adjusting your search criteria or filters to find
                        more events.
                    </p>
                </div>
            )}
        </div>
    );
}
