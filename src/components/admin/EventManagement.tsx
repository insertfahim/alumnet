"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Clock,
    Filter,
} from "lucide-react";

interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    virtual: boolean;
    startDate: string;
    endDate: string;
    maxAttendees: number | null;
    price: number | null;
    organizerName: string;
    attendeesCount: number;
    status: "upcoming" | "ongoing" | "past";
    createdAt: string;
}

const EventManagement: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "upcoming" | "ongoing" | "past"
    >("all");
    const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
        new Set()
    );

    useEffect(() => {
        fetchEvents();
    }, [statusFilter, searchTerm]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                status: statusFilter,
                search: searchTerm,
                page: "1",
                limit: "50",
            });

            const response = await fetch(`/api/admin/events?${params}`);
            if (!response.ok) throw new Error("Failed to fetch events");

            const data = await response.json();
            setEvents(data.events || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch events"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this event? This will also remove all attendees."
            )
        )
            return;

        try {
            const response = await fetch("/api/admin/events", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) throw new Error("Failed to delete event");

            await fetchEvents();
            setSelectedEvents(new Set());
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete event"
            );
        }
    };

    const handleBulkDelete = async () => {
        if (selectedEvents.size === 0) return;
        if (
            !confirm(
                `Are you sure you want to delete ${selectedEvents.size} events?`
            )
        )
            return;

        try {
            const eventsArray = Array.from(selectedEvents);
            for (const eventId of eventsArray) {
                await fetch("/api/admin/events", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: eventId }),
                });
            }

            await fetchEvents();
            setSelectedEvents(new Set());
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete events"
            );
        }
    };

    const toggleSelectAll = () => {
        if (selectedEvents.size === events.length) {
            setSelectedEvents(new Set());
        } else {
            setSelectedEvents(new Set(events.map((event) => event.id)));
        }
    };

    const toggleSelectEvent = (id: string) => {
        const newSelected = new Set(selectedEvents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedEvents(newSelected);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        const classes = {
            upcoming: "bg-blue-100 text-blue-800",
            ongoing: "bg-green-100 text-green-800",
            past: "bg-gray-100 text-gray-800",
        };

        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                    classes[status as keyof typeof classes]
                }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Event Management
                </h2>
                {selectedEvents.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedEvents.size})
                    </button>
                )}
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value as
                                        | "all"
                                        | "upcoming"
                                        | "ongoing"
                                        | "past"
                                )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Events</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="past">Past</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Events Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {events.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedEvents.size ===
                                                    events.length &&
                                                events.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Event
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attendees
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Organizer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map((event) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.has(
                                                    event.id
                                                )}
                                                onChange={() =>
                                                    toggleSelectEvent(event.id)
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <Calendar className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {event.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-md">
                                                        {event.description.substring(
                                                            0,
                                                            100
                                                        )}
                                                        {event.description
                                                            .length > 100 &&
                                                            "..."}
                                                    </div>
                                                    {event.price !== null && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <DollarSign className="h-3 w-3 text-green-500" />
                                                            <span className="text-xs text-green-600">
                                                                ${event.price}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(event.startDate)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                to {formatDate(event.endDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {event.virtual
                                                        ? "Virtual"
                                                        : event.location}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {event.attendeesCount}
                                                    {event.maxAttendees &&
                                                        ` / ${event.maxAttendees}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {event.organizerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(event.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    handleDelete(event.id)
                                                }
                                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No events found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No events match your current filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventManagement;
