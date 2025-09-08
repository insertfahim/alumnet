"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, X, Clock, MessageCircle, Loader2, Users } from "lucide-react";

interface Connection {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED";
    message?: string;
    createdAt: string;
    isOutgoing: boolean;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        currentCompany?: string;
        currentPosition?: string;
        graduationYear: number;
        major: string;
    };
}

export default function ConnectionsPage() {
    const { user, loading, token } = useAuth();
    const router = useRouter();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted">(
        "all"
    );
    const [actionLoading, setActionLoading] = useState<{
        [key: string]: boolean;
    }>({});

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (token) {
            fetchConnections();
        }
    }, [token, activeTab]);

    const fetchConnections = async () => {
        try {
            setLoadingConnections(true);
            const status =
                activeTab === "all" ? "all" : activeTab.toUpperCase();
            const response = await fetch(`/api/connections?status=${status}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setConnections(data.connections);
            }
        } catch (error) {
            console.error("Error fetching connections:", error);
        } finally {
            setLoadingConnections(false);
        }
    };

    const handleConnectionAction = async (
        connectionId: string,
        action: "ACCEPTED" | "DECLINED"
    ) => {
        setActionLoading((prev) => ({ ...prev, [connectionId]: true }));

        try {
            const response = await fetch(`/api/connections/${connectionId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: action }),
            });

            if (response.ok) {
                // Update the connection status locally
                setConnections((prev) =>
                    prev.map((conn) =>
                        conn.id === connectionId
                            ? { ...conn, status: action }
                            : conn
                    )
                );
            } else {
                alert("Failed to update connection status");
            }
        } catch (error) {
            console.error("Error updating connection:", error);
            alert("Failed to update connection status");
        } finally {
            setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
        }
    };

    const handleMessage = async (userId: string) => {
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    participantId: userId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const threadId = data.thread?.id || data.id;
                router.push(`/messages/${threadId}`);
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    };

    const getFilteredConnections = () => {
        switch (activeTab) {
            case "pending":
                return connections.filter(
                    (conn) => conn.status === "PENDING" && !conn.isOutgoing
                );
            case "accepted":
                return connections.filter((conn) => conn.status === "ACCEPTED");
            default:
                return connections;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const filteredConnections = getFilteredConnections();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">
                            My Connections
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage your professional network
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex space-x-8">
                            {[
                                {
                                    key: "all",
                                    label: "All Connections",
                                    count: connections.length,
                                },
                                {
                                    key: "pending",
                                    label: "Pending Requests",
                                    count: connections.filter(
                                        (c) =>
                                            c.status === "PENDING" &&
                                            !c.isOutgoing
                                    ).length,
                                },
                                {
                                    key: "accepted",
                                    label: "Accepted",
                                    count: connections.filter(
                                        (c) => c.status === "ACCEPTED"
                                    ).length,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.key
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Connections List */}
                    <div className="divide-y divide-gray-200">
                        {loadingConnections ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                <span>Loading connections...</span>
                            </div>
                        ) : filteredConnections.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {activeTab === "pending"
                                        ? "No pending requests"
                                        : activeTab === "accepted"
                                        ? "No accepted connections yet"
                                        : "No connections yet"}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === "pending"
                                        ? "Connection requests you receive will appear here"
                                        : "Start building your network by connecting with alumni"}
                                </p>
                                {activeTab === "all" && (
                                    <button
                                        onClick={() =>
                                            router.push("/directory")
                                        }
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        Browse Alumni Directory
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredConnections.map((connection) => (
                                <div
                                    key={connection.id}
                                    className="p-6 hover:bg-gray-50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            {connection.user.profilePicture ? (
                                                <img
                                                    src={
                                                        connection.user
                                                            .profilePicture
                                                    }
                                                    alt={`${connection.user.firstName} ${connection.user.lastName}`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <span className="text-gray-600 font-medium">
                                                        {
                                                            connection.user
                                                                .firstName[0]
                                                        }
                                                        {
                                                            connection.user
                                                                .lastName[0]
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {
                                                            connection.user
                                                                .firstName
                                                        }{" "}
                                                        {
                                                            connection.user
                                                                .lastName
                                                        }
                                                    </h3>
                                                    <div
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            connection.status ===
                                                            "ACCEPTED"
                                                                ? "bg-green-100 text-green-800"
                                                                : connection.status ===
                                                                  "PENDING"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {connection.status ===
                                                            "ACCEPTED" && (
                                                            <Check className="w-3 h-3 mr-1" />
                                                        )}
                                                        {connection.status ===
                                                            "PENDING" && (
                                                            <Clock className="w-3 h-3 mr-1" />
                                                        )}
                                                        {connection.status ===
                                                            "DECLINED" && (
                                                            <X className="w-3 h-3 mr-1" />
                                                        )}
                                                        {connection.status}
                                                    </div>
                                                </div>

                                                <div className="mt-1 text-sm text-gray-600">
                                                    <div>
                                                        Class of{" "}
                                                        {
                                                            connection.user
                                                                .graduationYear
                                                        }{" "}
                                                        •{" "}
                                                        {connection.user.major}
                                                    </div>
                                                    {connection.user
                                                        .currentPosition &&
                                                        connection.user
                                                            .currentCompany && (
                                                            <div>
                                                                {
                                                                    connection
                                                                        .user
                                                                        .currentPosition
                                                                }{" "}
                                                                at{" "}
                                                                {
                                                                    connection
                                                                        .user
                                                                        .currentCompany
                                                                }
                                                            </div>
                                                        )}
                                                </div>

                                                {connection.message && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                        <p className="text-sm text-gray-700 italic">
                                                            "
                                                            {connection.message}
                                                            "
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-2 text-xs text-gray-500">
                                                    {connection.isOutgoing
                                                        ? "Sent"
                                                        : "Received"}{" "}
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            connection.createdAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {connection.status === "PENDING" &&
                                                !connection.isOutgoing && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                handleConnectionAction(
                                                                    connection.id,
                                                                    "ACCEPTED"
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading[
                                                                    connection
                                                                        .id
                                                                ]
                                                            }
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {actionLoading[
                                                                connection.id
                                                            ] ? (
                                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                            ) : (
                                                                <Check className="w-4 h-4 mr-1" />
                                                            )}
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleConnectionAction(
                                                                    connection.id,
                                                                    "DECLINED"
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading[
                                                                    connection
                                                                        .id
                                                                ]
                                                            }
                                                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                                        >
                                                            {actionLoading[
                                                                connection.id
                                                            ] ? (
                                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                            ) : (
                                                                <X className="w-4 h-4 mr-1" />
                                                            )}
                                                            Decline
                                                        </button>
                                                    </>
                                                )}

                                            {connection.status ===
                                                "ACCEPTED" && (
                                                <button
                                                    onClick={() =>
                                                        handleMessage(
                                                            connection.user.id
                                                        )
                                                    }
                                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    Message
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
