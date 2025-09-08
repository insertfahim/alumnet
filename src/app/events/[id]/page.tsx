"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Clock,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { Event } from "@/types";

interface Attendee {
    id: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        graduationYear: number;
        degree: string;
        major: string;
    };
    status: "GOING" | "MAYBE" | "NOT_GOING";
    createdAt: string;
}

interface EventDetails {
    id: string;
    title: string;
    description: string;
    location: string;
    virtual: boolean;
    type?: string;
    startDate: Date;
    endDate: Date;
    maxAttendees?: number;
    price?: number;
    organizerId: string;
    organizer: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        graduationYear: number;
        degree: string;
        major: string;
        role: string;
        isVerified: boolean;
    };
    attendees: Attendee[];
    createdAt: Date;
}

export default function EventDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [rsvpStatus, setRsvpStatus] = useState<
        "GOING" | "MAYBE" | "NOT_GOING" | null
    >(null);
    const [rsvpLoading, setRsvpLoading] = useState(false);

    useEffect(() => {
        fetchEventDetails();
        fetchCurrentUser();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/events/${eventId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Event not found");
                }
                throw new Error("Failed to fetch event details");
            }

            const eventData = await response.json();
            // API returns shape { event: {...} }
            const e = eventData.event ?? eventData;
            const normalized: EventDetails = {
                ...e,
                startDate: e?.startDate ? new Date(e.startDate) : e.startDate,
                endDate: e?.endDate ? new Date(e.endDate) : e.endDate,
                createdAt: e?.createdAt ? new Date(e.createdAt) : e.createdAt,
                attendees: Array.isArray(e?.attendees)
                    ? e.attendees.map((a: any) => ({
                          ...a,
                          createdAt: a?.createdAt
                              ? new Date(a.createdAt).toISOString()
                              : a?.createdAt,
                      }))
                    : e?.attendees,
            };
            setEvent(normalized);
        } catch (err) {
            console.error("Error fetching event details:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load event details"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // Decode token to get user info (simplified - in real app you'd validate with API)
            const payload = JSON.parse(atob(token.split(".")[1]));
            setCurrentUser(payload);

            // Fetch RSVP status
            const response = await fetch(`/api/events/${eventId}/attend`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRsvpStatus(data.attendance?.status || null);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleRSVP = async (status: "GOING" | "MAYBE" | "NOT_GOING") => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to RSVP to events");
            return;
        }

        setRsvpLoading(true);

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
            setRsvpStatus(status);
            fetchEventDetails(); // Refresh attendee count
            alert("RSVP updated successfully!");
        } catch (error) {
            console.error("Error updating RSVP:", error);
            alert(
                error instanceof Error ? error.message : "Failed to update RSVP"
            );
        } finally {
            setRsvpLoading(false);
        }
    };

    const cancelRSVP = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to cancel RSVP");
            return;
        }

        setRsvpLoading(true);

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

            setRsvpStatus(null);
            fetchEventDetails(); // Refresh attendee count
            alert("RSVP cancelled successfully!");
        } catch (error) {
            console.error("Error cancelling RSVP:", error);
            alert(
                error instanceof Error ? error.message : "Failed to cancel RSVP"
            );
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this event? This action cannot be undone."
            )
        ) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to delete events");
            return;
        }

        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete event");
            }

            alert("Event deleted successfully!");
            router.push("/events");
        } catch (error) {
            console.error("Error deleting event:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete event"
            );
        }
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

    const isOrganizer = () => {
        return currentUser && event && currentUser.userId === event.organizerId;
    };

    const getAttendeeCount = (status: "GOING" | "MAYBE" | "NOT_GOING") => {
        return (
            event?.attendees?.filter((attendee) => attendee.status === status)
                .length || 0
        );
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Loading event details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
                        {error || "Event not found"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        The event you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <button
                        onClick={() => router.push("/events")}
                        className="btn-primary"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Events
                </button>

                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 mr-3">
                                {event.title}
                            </h1>
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
                                    {event.type.charAt(0).toUpperCase() +
                                        event.type.slice(1)}
                                </span>
                            )}
                            {isEventToday(event.startDate) && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Today
                                </span>
                            )}
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                            <User className="w-5 h-5 mr-2" />
                            <span>
                                Organized by {event.organizer.firstName}{" "}
                                {event.organizer.lastName}
                            </span>
                            {event.price && (
                                <>
                                    <span className="mx-2">•</span>
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    <span>{event.price} BDT</span>
                                </>
                            )}
                        </div>
                    </div>

                    {isOrganizer() && !isEventPast(event.endDate) && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() =>
                                    router.push(`/events/${eventId}/edit`)
                                }
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteEvent}
                                className="flex items-center px-4 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Details */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Event Details
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(event.startDate)}
                                    </p>
                                    <p className="text-gray-600">
                                        {formatTime(event.startDate)} -{" "}
                                        {formatTime(event.endDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {event.location}
                                    </p>
                                    {event.virtual && (
                                        <p className="text-sm text-gray-600">
                                            Virtual Event
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {event.attendees?.length || 0} attendees
                                        {event.maxAttendees &&
                                            ` (${event.maxAttendees} max)`}
                                    </p>
                                    <div className="flex space-x-4 mt-1 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                            {getAttendeeCount("GOING")} going
                                        </span>
                                        <span className="flex items-center">
                                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                                            {getAttendeeCount("MAYBE")} maybe
                                        </span>
                                        <span className="flex items-center">
                                            <XCircle className="w-4 h-4 text-red-500 mr-1" />
                                            {getAttendeeCount("NOT_GOING")} not
                                            going
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            About This Event
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {event.description}
                        </p>
                    </div>

                    {/* Attendees List */}
                    {event.attendees && event.attendees.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Attendees
                            </h2>
                            <div className="space-y-3">
                                {event.attendees.map((attendee) => (
                                    <div
                                        key={attendee.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                                {attendee.user
                                                    .profilePicture ? (
                                                    <img
                                                        src={
                                                            attendee.user
                                                                .profilePicture
                                                        }
                                                        alt={`${attendee.user.firstName} ${attendee.user.lastName}`}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-600 font-medium">
                                                        {
                                                            attendee.user
                                                                .firstName[0]
                                                        }
                                                        {
                                                            attendee.user
                                                                .lastName[0]
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {attendee.user.firstName}{" "}
                                                    {attendee.user.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {attendee.user.degree}{" "}
                                                    {attendee.user.major} •
                                                    Class of{" "}
                                                    {
                                                        attendee.user
                                                            .graduationYear
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            {attendee.status === "GOING" && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Going
                                                </span>
                                            )}
                                            {attendee.status === "MAYBE" && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Maybe
                                                </span>
                                            )}
                                            {attendee.status ===
                                                "NOT_GOING" && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Not Going
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* RSVP Section */}
                    {!isEventPast(event.endDate) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                RSVP
                            </h3>

                            {rsvpStatus ? (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <div className="text-green-600 mb-2">
                                            {rsvpStatus === "GOING" && (
                                                <CheckCircle className="w-8 h-8 mx-auto" />
                                            )}
                                            {rsvpStatus === "MAYBE" && (
                                                <AlertCircle className="w-8 h-8 mx-auto" />
                                            )}
                                            {rsvpStatus === "NOT_GOING" && (
                                                <XCircle className="w-8 h-8 mx-auto" />
                                            )}
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            You're {rsvpStatus.toLowerCase()}
                                        </p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleRSVP("GOING")}
                                            disabled={rsvpLoading}
                                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                                                rsvpStatus === "GOING"
                                                    ? "bg-green-600 text-white"
                                                    : "border border-green-600 text-green-600 hover:bg-green-50"
                                            }`}
                                        >
                                            Going
                                        </button>
                                        <button
                                            onClick={() => handleRSVP("MAYBE")}
                                            disabled={rsvpLoading}
                                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                                                rsvpStatus === "MAYBE"
                                                    ? "bg-yellow-600 text-white"
                                                    : "border border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                                            }`}
                                        >
                                            Maybe
                                        </button>
                                    </div>

                                    <button
                                        onClick={cancelRSVP}
                                        disabled={rsvpLoading}
                                        className="w-full py-2 px-4 border border-red-300 rounded-md text-red-700 hover:bg-red-50 text-sm font-medium"
                                    >
                                        Cancel RSVP
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-gray-600 text-center">
                                        Will you attend this event?
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleRSVP("GOING")}
                                            disabled={rsvpLoading}
                                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                                        >
                                            I'm Going
                                        </button>
                                        <button
                                            onClick={() => handleRSVP("MAYBE")}
                                            disabled={rsvpLoading}
                                            className="flex-1 py-2 px-4 border border-yellow-600 text-yellow-600 rounded-md hover:bg-yellow-50 text-sm font-medium"
                                        >
                                            Maybe
                                        </button>
                                    </div>
                                </div>
                            )}

                            {rsvpLoading && (
                                <div className="text-center mt-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Organizer Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Organizer
                        </h3>
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                                {event.organizer.profilePicture ? (
                                    <img
                                        src={event.organizer.profilePicture}
                                        alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-600 font-medium">
                                        {event.organizer.firstName[0]}
                                        {event.organizer.lastName[0]}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {event.organizer.firstName}{" "}
                                    {event.organizer.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {event.organizer.degree} • Class of{" "}
                                    {event.organizer.graduationYear}
                                </p>
                                {event.organizer.isVerified && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                        Verified Alumni
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
