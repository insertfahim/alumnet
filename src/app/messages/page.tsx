"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MessageList from "@/components/messages/MessageList";

export default function MessagesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Messages
                                </h1>
                                <p className="text-gray-600 mt-1 text-sm">
                                    Connect and communicate with fellow alumni
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                                    {unreadCount} unread
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white">
                        <MessageList onUnreadCountChange={setUnreadCount} />
                    </div>
                </div>
            </div>
        </div>
    );
}
