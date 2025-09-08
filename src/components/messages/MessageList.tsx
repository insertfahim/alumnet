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

interface MessageListProps {
    onUnreadCountChange?: (count: number) => void;
}

export default function MessageList({ onUnreadCountChange }: MessageListProps) {
    const { user, token } = useAuth();
    const [threads, setThreads] = useState<ThreadPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalUnread, setTotalUnread] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredThreads, setFilteredThreads] = useState<ThreadPreview[]>([]);

    useEffect(() => {
        if (token) {
            fetchThreads();
            // Poll for new messages every 10 seconds
            const interval = setInterval(fetchThreads, 10000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useEffect(() => {
        filterThreads();
    }, [threads, searchTerm]);

    const filterThreads = () => {
        if (!searchTerm) {
            setFilteredThreads(threads);
            return;
        }

        const filtered = threads.filter((thread) => {
            const participantName =
                `${thread.participant?.firstName} ${thread.participant?.lastName}`.toLowerCase();
            const lastMessage = thread.lastMessage?.content.toLowerCase() || "";
            const searchLower = searchTerm.toLowerCase();

            return (
                participantName.includes(searchLower) ||
                lastMessage.includes(searchLower)
            );
        });

        setFilteredThreads(filtered);
    };

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
                // Calculate total unread messages
                const unreadCount = data.threads.reduce(
                    (total: number, thread: ThreadPreview) => {
                        return total + thread.unreadCount;
                    },
                    0
                );
                setTotalUnread(unreadCount);
                onUnreadCountChange?.(unreadCount);
                filterThreads();
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
        <div>
            {/* Search Bar */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Search conversations..."
                    />
                </div>
            </div>

            {/* Threads List */}
            <div className="divide-y divide-gray-200">
                {filteredThreads.map((thread) => (
                    <Link
                        key={thread.id}
                        href={`/messages/${thread.id}`}
                        className="block px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                    >
                        <div className="flex items-start space-x-4">
                            {thread.participant?.profilePicture ? (
                                <img
                                    src={thread.participant.profilePicture}
                                    alt={`${thread.participant.firstName} ${thread.participant.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-gray-200">
                                    <span className="text-white font-semibold text-sm">
                                        {thread.participant?.firstName?.[0]}
                                        {thread.participant?.lastName?.[0]}
                                    </span>
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                        {thread.participant?.firstName}{" "}
                                        {thread.participant?.lastName}
                                    </h3>
                                    {thread.lastMessage && (
                                        <span className="text-xs text-gray-500 font-medium">
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
                                    <p className="text-sm text-gray-600 truncate leading-5">
                                        {thread.lastMessage.senderId ===
                                        user?.id
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
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                            {thread.unreadCount} new
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
