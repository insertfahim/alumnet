"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, ArrowLeft, Loader2 } from "lucide-react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    readBy: string[];
}

interface Thread {
    id: string;
    participants: Array<{
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    }>;
}

interface ThreadData {
    thread: Thread;
    messages: Message[];
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
    };
}

export default function MessageThreadPage() {
    const { user, loading, token } = useAuth();
    const router = useRouter();
    const params = useParams();
    const threadId = params.threadId as string;

    const [threadData, setThreadData] = useState<ThreadData | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const fetchThreadMessages = useCallback(async () => {
        if (hasInitializedRef.current) {
            // For subsequent fetches, don't show loading state
            try {
                const response = await fetch(`/api/messages/${threadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setThreadData((prevData) => {
                        if (!prevData) return data;

                        // Check if messages have changed
                        const messagesChanged =
                            prevData.messages.length !== data.messages.length ||
                            prevData.messages.some(
                                (msg, index) =>
                                    !data.messages[index] ||
                                    msg.id !== data.messages[index].id
                            );

                        if (messagesChanged) {
                            return data;
                        }
                        return prevData;
                    });
                    return { success: true };
                } else if (response.status === 404) {
                    return { success: false, status: 404 };
                } else {
                    return { success: false, status: response.status };
                }
            } catch (error) {
                console.error("Error fetching thread messages:", error);
                return { success: false, error };
            }
        } else {
            // Initial fetch with loading state
            try {
                setInitialLoading(true);
                setError(null);
                const response = await fetch(`/api/messages/${threadId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setThreadData(data);
                    hasInitializedRef.current = true;
                    return { success: true };
                } else if (response.status === 404) {
                    setError("Thread not found");
                    return { success: false, status: 404 };
                } else {
                    setError("Failed to load messages");
                    return { success: false, status: response.status };
                }
            } catch (error) {
                console.error("Error fetching thread messages:", error);
                setError("Failed to load messages");
                return { success: false, error };
            } finally {
                setInitialLoading(false);
            }
        }
    }, [token, threadId]);

    useEffect(() => {
        if (token && threadId && !hasInitializedRef.current) {
            fetchThreadMessages().then((result) => {
                if (result && !result.success && result.status === 404) {
                    router.push("/messages");
                }
            });
        }
    }, [token, threadId, router, fetchThreadMessages]);

    // Separate effect for polling that only runs after initial load
    useEffect(() => {
        if (token && threadId && hasInitializedRef.current) {
            const interval = setInterval(() => {
                fetchThreadMessages().then((result) => {
                    if (result && !result.success && result.status === 404) {
                        router.push("/messages");
                    }
                });
            }, 30000); // Poll every 30 seconds instead of 10
            return () => clearInterval(interval);
        }
    }, [token, threadId, router, fetchThreadMessages]);

    // NO AUTO-SCROLLING - Removed all automatic scroll behavior

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setNewMessage(e.target.value);
        },
        []
    );

    const handleSendMessage = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newMessage.trim() || sendingMessage) return;

            setSendingMessage(true);
            try {
                const response = await fetch(`/api/messages/${threadId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ content: newMessage.trim() }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Immediately add the new message to the thread for instant feedback
                    setThreadData((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            messages: [...prev.messages, data.message],
                        };
                    });
                    setNewMessage("");
                    // Only scroll to bottom when user explicitly sends a message
                    setTimeout(() => {
                        if (messagesEndRef.current) {
                            messagesEndRef.current.scrollIntoView({
                                behavior: "smooth",
                            });
                        }
                    }, 100);
                }
            } catch (error) {
                console.error("Error sending message:", error);
            } finally {
                setSendingMessage(false);
            }
        },
        [newMessage, sendingMessage, threadId, token]
    );

    if (loading || initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading messages...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    hasInitializedRef.current = false;
                                    fetchThreadMessages();
                                }}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!threadData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-600">Thread not found</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const otherParticipant = threadData.thread.participants.find(
        (p) => p.id !== user.id
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                        <button
                            onClick={() => router.push("/messages")}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center">
                            {otherParticipant?.profilePicture ? (
                                <img
                                    src={otherParticipant.profilePicture}
                                    alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-gray-600 font-medium">
                                        {otherParticipant?.firstName?.[0]}
                                        {otherParticipant?.lastName?.[0]}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {otherParticipant?.firstName}{" "}
                                    {otherParticipant?.lastName}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {threadData.messages.length > 0
                                        ? `Last active ${formatDistanceToNow(
                                              new Date(
                                                  threadData.messages[
                                                      threadData.messages
                                                          .length - 1
                                                  ].createdAt
                                              ),
                                              { addSuffix: true }
                                          )}`
                                        : "Start a conversation"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-96 overflow-y-auto p-6 space-y-4">
                        {threadData.messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Send className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Start the conversation
                                </h3>
                                <p className="text-gray-500">
                                    Send a message to{" "}
                                    {otherParticipant?.firstName}
                                </p>
                            </div>
                        ) : (
                            threadData.messages.map((message) => {
                                const isOwnMessage =
                                    message.senderId === user.id;
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            isOwnMessage
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                isOwnMessage
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 text-gray-900"
                                            }`}
                                        >
                                            <p className="text-sm">
                                                {message.content}
                                            </p>
                                            <div
                                                className={`flex items-center mt-1 ${
                                                    isOwnMessage
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <p
                                                    className={`text-xs ${
                                                        isOwnMessage
                                                            ? "text-blue-200"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            message.createdAt
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </p>
                                                {isOwnMessage && (
                                                    <div className="ml-2 flex items-center">
                                                        {message.readBy.length >
                                                        1 ? (
                                                            <div className="text-blue-200 text-xs">
                                                                ✓✓
                                                            </div>
                                                        ) : (
                                                            <div className="text-blue-300 text-xs">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="px-6 py-4 border-t border-gray-200">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex space-x-4"
                        >
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleInputChange}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={sendingMessage}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sendingMessage}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {sendingMessage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
