"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    ArrowLeft,
    Save,
} from "lucide-react";

interface EventFormData {
    title: string;
    description: string;
    location: string;
    virtual: boolean;
    type: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    maxAttendees?: number;
    price?: number;
}

interface EventData {
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
}

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [formData, setFormData] = useState<EventFormData>({
        title: "",
        description: "",
        location: "",
        virtual: false,
        type: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        maxAttendees: undefined,
        price: undefined,
    });

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setFetchLoading(true);
            setError(null);

            const response = await fetch(`/api/events/${eventId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Event not found");
                }
                throw new Error("Failed to fetch event details");
            }

            const event: EventData = await response.json();

            // Check if user is the organizer
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    if (payload.userId === event.organizerId) {
                        setIsOrganizer(true);
                    } else {
                        setError(
                            "You don't have permission to edit this event"
                        );
                        return;
                    }
                } catch (error) {
                    setError("Invalid authentication token");
                    return;
                }
            } else {
                setError("Please log in to edit events");
                return;
            }

            // Pre-populate form with existing data
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            setFormData({
                title: event.title,
                description: event.description,
                location: event.location,
                virtual: event.virtual,
                type: event.type || "",
                startDate: startDate.toISOString().split("T")[0],
                startTime: startDate.toTimeString().slice(0, 5),
                endDate: endDate.toISOString().split("T")[0],
                endTime: endDate.toTimeString().slice(0, 5),
                maxAttendees: event.maxAttendees || undefined,
                price: event.price || undefined,
            });
        } catch (err) {
            console.error("Error fetching event details:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load event details"
            );
        } finally {
            setFetchLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "number"
                    ? value
                        ? parseInt(value)
                        : undefined
                    : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const validateForm = (): string | null => {
        if (!formData.title.trim()) return "Event title is required";
        if (!formData.description.trim())
            return "Event description is required";
        if (!formData.location.trim()) return "Event location is required";
        if (!formData.startDate) return "Start date is required";
        if (!formData.startTime) return "Start time is required";
        if (!formData.endDate) return "End date is required";
        if (!formData.endTime) return "End time is required";

        const startDateTime = new Date(
            `${formData.startDate}T${formData.startTime}`
        );
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (isNaN(startDateTime.getTime())) return "Invalid start date/time";
        if (isNaN(endDateTime.getTime())) return "Invalid end date/time";
        if (endDateTime <= startDateTime)
            return "End date/time must be after start date/time";

        if (formData.maxAttendees && formData.maxAttendees <= 0) {
            return "Maximum attendees must be greater than 0";
        }

        if (formData.price && formData.price < 0) {
            return "Price cannot be negative";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOrganizer) {
            setError("You don't have permission to edit this event");
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to edit events");
                return;
            }

            const startDateTime = new Date(
                `${formData.startDate}T${formData.startTime}`
            );
            const endDateTime = new Date(
                `${formData.endDate}T${formData.endTime}`
            );

            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                location: formData.location.trim(),
                virtual: formData.virtual,
                type: formData.type || null,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                maxAttendees: formData.maxAttendees || null,
                price: formData.price || null,
            };

            const response = await fetch(`/api/events/${eventId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update event");
            }

            const result = await response.json();
            alert("Event updated successfully!");
            router.push(`/events/${eventId}`);
        } catch (error) {
            console.error("Error updating event:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update event"
            );
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
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

    if (error && !isOrganizer) {
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
                        Access Denied
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push(`/events/${eventId}`)}
                        className="btn-primary"
                    >
                        Back to Event
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Event
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Edit Event
                </h1>
                <p className="text-lg text-gray-600">
                    Update your event details
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="text-red-800 text-sm">{error}</div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Basic Information
                        </h3>

                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Event Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Enter event title"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Describe your event"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="type"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Event Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select event type</option>
                                <option value="networking">Networking</option>
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

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="virtual"
                                name="virtual"
                                checked={formData.virtual}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="virtual"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                This is a virtual event
                            </label>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Location *
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder={
                                formData.virtual
                                    ? "Zoom meeting link or virtual platform"
                                    : "Physical location"
                            }
                            required
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Date & Time
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="startDate"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="startTime"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    id="startTime"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="endDate"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="endTime"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    End Time *
                                </label>
                                <input
                                    type="time"
                                    id="endTime"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity and Pricing */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            Capacity & Pricing
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="maxAttendees"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Maximum Attendees
                                </label>
                                <input
                                    type="number"
                                    id="maxAttendees"
                                    name="maxAttendees"
                                    value={formData.maxAttendees || ""}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Price (BDT)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price || ""}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Free event"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update Event
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
