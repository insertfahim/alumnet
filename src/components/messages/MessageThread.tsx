"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
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

interface MessagesProps {
    threadId: string;
}

export default function MessageThread({ threadId }: MessagesProps) {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [thread, setThread] = useState<Thread | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (threadId && token) {
            fetchMessages();
        }
    }, [threadId, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages/${threadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
                setThread(data.thread);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
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
                setMessages((prev) => [...prev, data.message]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const getOtherParticipant = () => {
        return thread?.participants.find((p) => p.id !== user?.id);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const otherParticipant = getOtherParticipant();

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center space-x-3">
                    {otherParticipant?.profilePicture ? (
                        <img
                            src={otherParticipant.profilePicture}
                            alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                                {otherParticipant?.firstName?.[0]}
                                {otherParticipant?.lastName?.[0]}
                            </span>
                        </div>
                    )}
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {otherParticipant?.firstName}{" "}
                            {otherParticipant?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">Alumni</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${
                                    isOwn ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        isOwn
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-900"
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p
                                        className={`text-xs mt-1 ${
                                            isOwn
                                                ? "text-blue-100"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {formatDistanceToNow(
                                            new Date(message.createdAt),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
                <form onSubmit={sendMessage} className="flex space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? "Sending..." : "Send"}
                    </button>
                </form>
            </div>
        </div>
    );
}
