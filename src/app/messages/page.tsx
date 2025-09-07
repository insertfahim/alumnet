"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MessageList from "@/components/messages/MessageList";

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              Connect and communicate with fellow alumni
            </p>
          </div>
          
          <MessageList />
        </div>
      </div>
    </div>
  );
}

        // TODO: Implement message sending
        console.log("Sending message:", message);
        setMessage("");
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return "Just now";
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Please log in to view messages
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar - Conversations List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900 mb-4">
                        BRACU Alumni Messages
                    </h1>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Search conversations..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() =>
                                setSelectedConversation(conversation)
                            }
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                selectedConversation?.id === conversation.id
                                    ? "bg-primary-50 border-primary-200"
                                    : ""
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold">
                                        {conversation.participant.firstName[0]}
                                        {conversation.participant.lastName[0]}
                                    </span>
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {conversation.participant.firstName}{" "}
                                            {conversation.participant.lastName}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {formatTime(
                                                conversation.lastMessage
                                                    .createdAt
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate mt-1">
                                        {conversation.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Selected Conversation */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold">
                                        {
                                            selectedConversation.participant
                                                .firstName[0]
                                        }
                                        {
                                            selectedConversation.participant
                                                .lastName[0]
                                        }
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        {
                                            selectedConversation.participant
                                                .firstName
                                        }{" "}
                                        {
                                            selectedConversation.participant
                                                .lastName
                                        }
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Active now
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {selectedConversation.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.fromUserId === user.id
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            msg.fromUserId === user.id
                                                ? "bg-primary-600 text-white"
                                                : "bg-gray-200 text-gray-900"
                                        }`}
                                    >
                                        <p>{msg.content}</p>
                                        <p
                                            className={`text-xs mt-1 ${
                                                msg.fromUserId === user.id
                                                    ? "text-primary-100"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex space-x-2"
                            >
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Type a message..."
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                Select a conversation
                            </h3>
                            <p className="text-gray-600">
                                Choose a conversation from the sidebar to start
                                messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
