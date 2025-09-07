"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ThreadPreview {
    id: string;
    participant: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    lastMessage: {
        id: string;
        content: string;
        senderId: string;
        createdAt: string;
    } | null;
    unreadCount: number;
    updatedAt: string;
}

export default function MessageList() {
    const { user, token } = useAuth();
    const [threads, setThreads] = useState<ThreadPreview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchThreads();
        }
    }, [token]);

    const fetchThreads = async () => {
        try {
            const response = await fetch("/api/messages", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setThreads(data.threads);
            }
        } catch (error) {
            console.error("Error fetching threads:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (threads.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No messages yet
                </h3>
                <p className="text-gray-500 mb-6">
                    Start connecting with fellow alumni by browsing the
                    directory
                </p>
                <Link
                    href="/directory"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Browse Alumni Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {threads.map((thread) => (
                <Link
                    key={thread.id}
                    href={`/messages/${thread.id}`}
                    className="block p-4 hover:bg-gray-50 border-b border-gray-200 transition-colors"
                >
                    <div className="flex items-start space-x-3">
                        {thread.participant?.profilePicture ? (
                            <img
                                src={thread.participant.profilePicture}
                                alt={`${thread.participant.firstName} ${thread.participant.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                    {thread.participant?.firstName?.[0]}
                                    {thread.participant?.lastName?.[0]}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {thread.participant?.firstName}{" "}
                                    {thread.participant?.lastName}
                                </h3>
                                {thread.lastMessage && (
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(
                                            new Date(
                                                thread.lastMessage.createdAt
                                            ),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </span>
                                )}
                            </div>

                            {thread.lastMessage ? (
                                <p className="text-sm text-gray-500 truncate">
                                    {thread.lastMessage.senderId === user?.id
                                        ? "You: "
                                        : ""}
                                    {thread.lastMessage.content}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 italic">
                                    No messages yet
                                </p>
                            )}

                            {thread.unreadCount > 0 && (
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {thread.unreadCount} new
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
