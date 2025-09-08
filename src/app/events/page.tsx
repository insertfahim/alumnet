"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Plus, Filter, Search } from "lucide-react";
import { Event } from "@/types";

interface RSVPStatus {
    [eventId: string]: "GOING" | "MAYBE" | "NOT_GOING" | null;
}

export default function EventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rsvpStatuses, setRsvpStatuses] = useState<RSVPStatus>({});
    const [rsvpLoading, setRsvpLoading] = useState<{
        [eventId: string]: boolean;
    }>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        type: "",
        date: "",
        dateRange: {
            start: "",
            end: "",
        },
        location: "",
        organizer: "",
        priceRange: {
            min: "",
            max: "",
        },
        upcoming: true,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [searchTerm, filters, currentPage]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (filters.type) params.append("type", filters.type);
            if (filters.date) params.append("date", filters.date);
            if (filters.dateRange.start)
                params.append("startDate", filters.dateRange.start);
            if (filters.dateRange.end)
                params.append("endDate", filters.dateRange.end);
            if (filters.location) params.append("location", filters.location);
            if (filters.organizer)
                params.append("organizer", filters.organizer);
            if (filters.priceRange.min)
                params.append("minPrice", filters.priceRange.min);
            if (filters.priceRange.max)
                params.append("maxPrice", filters.priceRange.max);
            if (filters.upcoming) params.append("upcoming", "true");
            params.append("page", currentPage.toString());

            const queryString = params.toString();
            const url = queryString
                ? `/api/events?${queryString}`
                : "/api/events";

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            const data = await response.json();
            setEvents(data.events || []);
            setTotalPages(data.pagination?.totalPages || 1);

            // Fetch RSVP statuses for all events
            await fetchAllRsvpStatuses(data.events || []);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError("Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRsvpStatuses = async (eventsList: Event[]) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const statuses: RSVPStatus = {};

        for (const event of eventsList) {
            try {
                const response = await fetch(`/api/events/${event.id}/attend`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    statuses[event.id] = data.attendance?.status || null;
                }
            } catch (error) {
                console.error(
                    `Error fetching RSVP status for event ${event.id}:`,
                    error
                );
            }
        }

        setRsvpStatuses(statuses);
    };

    const handleRSVP = async (
        eventId: string,
        status: "GOING" | "MAYBE" | "NOT_GOING"
    ) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to RSVP to events");
            return;
        }

        setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));

        try {
            const response = await fetch(`/api/events/${eventId}/attend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update RSVP");
            }

            const result = await response.json();

            // Update local state
            setRsvpStatuses((prev) => ({
                ...prev,
                [eventId]: status,
            }));

            // Refresh events to get updated attendee count
            await fetchEvents();

            alert("RSVP updated successfully!");
        } catch (error) {
            console.error("Error updating RSVP:", error);
            alert(
                error instanceof Error ? error.message : "Failed to update RSVP"
            );
        } finally {
            setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const cancelRSVP = async (eventId: string) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to cancel RSVP");
            return;
        }

        setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));

        try {
            const response = await fetch(`/api/events/${eventId}/attend`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to cancel RSVP");
            }

            // Update local state
            setRsvpStatuses((prev) => ({
                ...prev,
                [eventId]: null,
            }));

            // Refresh events to get updated attendee count
            await fetchEvents();

            alert("RSVP cancelled successfully!");
        } catch (error) {
            console.error("Error cancelling RSVP:", error);
            alert(
                error instanceof Error ? error.message : "Failed to cancel RSVP"
            );
        } finally {
            setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
        }
    };

    const getRsvpButtonText = (
        eventId: string,
        status: "GOING" | "MAYBE" | "NOT_GOING"
    ) => {
        const currentStatus = rsvpStatuses[eventId];
        const isLoading = rsvpLoading[eventId];

        if (isLoading) return "Updating...";

        if (currentStatus === status) {
            switch (status) {
                case "GOING":
                    return "✓ Going";
                case "MAYBE":
                    return "✓ Maybe";
                case "NOT_GOING":
                    return "Not Going";
            }
        }

        switch (status) {
            case "GOING":
                return "I'm Going";
            case "MAYBE":
                return "Maybe";
            case "NOT_GOING":
                return "Not Going";
        }
    };

    const getButtonClass = (
        eventId: string,
        status: "GOING" | "MAYBE" | "NOT_GOING"
    ) => {
        const currentStatus = rsvpStatuses[eventId];
        const isLoading = rsvpLoading[eventId];

        const baseClass =
            "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500";

        if (isLoading) {
            return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
        }

        if (currentStatus === status) {
            switch (status) {
                case "GOING":
                    return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
                case "MAYBE":
                    return `${baseClass} bg-yellow-600 text-white hover:bg-yellow-700`;
                case "NOT_GOING":
                    return `${baseClass} bg-gray-600 text-white hover:bg-gray-700`;
            }
        }

        switch (status) {
            case "GOING":
                return `${baseClass} bg-primary-600 text-white hover:bg-primary-700`;
            case "MAYBE":
                return `${baseClass} border border-primary-600 text-primary-600 hover:bg-primary-50`;
            case "NOT_GOING":
                return `${baseClass} border border-gray-300 text-gray-700 hover:bg-gray-50`;
        }
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
                <button
                    onClick={() => router.push("/events/create")}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Event
                </button>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search events by title, description, or organizer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                        {showFilters ? (
                            <svg
                                className="w-5 h-5 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Event Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event Type
                                </label>
                                <select
                                    value={filters.type}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Types</option>
                                    <option value="networking">
                                        Networking
                                    </option>
                                    <option value="workshop">Workshop</option>
                                    <option value="seminar">Seminar</option>
                                    <option value="social">Social</option>
                                    <option value="career">Career</option>
                                    <option value="academic">Academic</option>
                                    <option value="sports">Sports</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <select
                                    value={filters.date}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            date: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Any Date</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="this_week">This Week</option>
                                    <option value="this_month">
                                        This Month
                                    </option>
                                    <option value="next_month">
                                        Next Month
                                    </option>
                                </select>
                            </div>

                            {/* Location Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter location..."
                                    value={filters.location}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            location: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Organizer Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Organizer
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by organizer..."
                                    value={filters.organizer}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            organizer: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            {/* Price Range */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Range (BDT)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.priceRange.min}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                priceRange: {
                                                    ...prev.priceRange,
                                                    min: e.target.value,
                                                },
                                            }))
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.priceRange.max}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                priceRange: {
                                                    ...prev.priceRange,
                                                    max: e.target.value,
                                                },
                                            }))
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => {
                                    setFilters({
                                        type: "",
                                        date: "",
                                        dateRange: { start: "", end: "" },
                                        location: "",
                                        organizer: "",
                                        priceRange: { min: "", max: "" },
                                        upcoming: true,
                                    });
                                    setSearchTerm("");
                                }}
                                className="text-gray-600 hover:text-gray-800 underline"
                            >
                                Clear All Filters
                            </button>

                            <div className="flex items-center">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.upcoming}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                upcoming: e.target.checked,
                                            }))
                                        }
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Show only upcoming events
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading events...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                        <svg
                            className="h-16 w-16 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error loading events
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={fetchEvents} className="btn-primary">
                        Try Again
                    </button>
                </div>
            )}

            {/* Events List */}
            {!loading && !error && (
                <div className="space-y-6">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <h3
                                                    className="text-xl font-semibold text-gray-900 mr-3 hover:text-primary-600 cursor-pointer"
                                                    onClick={() =>
                                                        router.push(
                                                            `/events/${event.id}`
                                                        )
                                                    }
                                                >
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
                                                {event.type && (
                                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {event.type
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            event.type.slice(1)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center text-gray-600">
                                                    <Calendar className="w-5 h-5 mr-2" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {new Intl.DateTimeFormat(
                                                                "en-US",
                                                                {
                                                                    weekday:
                                                                        "long",
                                                                    year: "numeric",
                                                                    month: "long",
                                                                    day: "numeric",
                                                                }
                                                            ).format(
                                                                event.startDate
                                                            )}
                                                        </p>
                                                        <p className="text-sm">
                                                            {new Intl.DateTimeFormat(
                                                                "en-US",
                                                                {
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }
                                                            ).format(
                                                                event.startDate
                                                            )}{" "}
                                                            -{" "}
                                                            {new Intl.DateTimeFormat(
                                                                "en-US",
                                                                {
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }
                                                            ).format(
                                                                event.endDate
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-gray-600">
                                                    <MapPin className="w-5 h-5 mr-2" />
                                                    <span>
                                                        {event.location}
                                                    </span>
                                                </div>

                                                <div className="flex items-center text-gray-600">
                                                    <Users className="w-5 h-5 mr-2" />
                                                    <span>
                                                        {event.attendees
                                                            ?.length || 0}{" "}
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
                                                        {
                                                            event.organizer
                                                                ?.firstName
                                                        }{" "}
                                                        {
                                                            event.organizer
                                                                ?.lastName
                                                        }
                                                    </span>
                                                    {event.price && (
                                                        <>
                                                            <span className="mx-2">
                                                                •
                                                            </span>
                                                            <span>
                                                                ${event.price}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleRSVP(
                                                                event.id,
                                                                "GOING"
                                                            )
                                                        }
                                                        disabled={
                                                            rsvpLoading[
                                                                event.id
                                                            ]
                                                        }
                                                        className={getButtonClass(
                                                            event.id,
                                                            "GOING"
                                                        )}
                                                    >
                                                        {getRsvpButtonText(
                                                            event.id,
                                                            "GOING"
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleRSVP(
                                                                event.id,
                                                                "MAYBE"
                                                            )
                                                        }
                                                        disabled={
                                                            rsvpLoading[
                                                                event.id
                                                            ]
                                                        }
                                                        className={getButtonClass(
                                                            event.id,
                                                            "MAYBE"
                                                        )}
                                                    >
                                                        {getRsvpButtonText(
                                                            event.id,
                                                            "MAYBE"
                                                        )}
                                                    </button>
                                                    {rsvpStatuses[event.id] && (
                                                        <button
                                                            onClick={() =>
                                                                cancelRSVP(
                                                                    event.id
                                                                )
                                                            }
                                                            disabled={
                                                                rsvpLoading[
                                                                    event.id
                                                                ]
                                                            }
                                                            className="px-3 py-2 text-xs text-red-600 hover:text-red-800 underline focus:outline-none"
                                                        >
                                                            Cancel RSVP
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">
                                <Calendar className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No events found
                            </h3>
                            <p className="text-gray-600">
                                Be the first to create an event for the BRACU
                                alumni community!
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex space-x-1">
                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === page
                                        ? "text-white bg-primary-600 border border-primary-600"
                                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
