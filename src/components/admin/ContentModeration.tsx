"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Trash2,
    Eye,
    EyeOff,
    MessageSquare,
    Image,
    Filter,
    AlertTriangle,
} from "lucide-react";

interface ContentItem {
    id: string;
    type: "post" | "comment";
    content: string;
    authorName: string;
    createdAt: string;
    hasImages?: boolean;
    commentsCount?: number;
    postId?: string;
    postAuthor?: string;
    postPreview?: string;
}

interface ContentModerationProps {}

const ContentModeration: React.FC<ContentModerationProps> = () => {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "posts" | "comments">(
        "all"
    );
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchContent();
    }, [typeFilter, searchTerm]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                type: typeFilter,
                search: searchTerm,
                page: "1",
                limit: "50",
            });

            const response = await fetch(`/api/admin/content?${params}`);
            if (!response.ok) throw new Error("Failed to fetch content");

            const data = await response.json();
            setContent(data.content || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch content"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, type: "post" | "comment") => {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const response = await fetch("/api/admin/content", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, type }),
            });

            if (!response.ok) throw new Error("Failed to delete content");

            await fetchContent();
            setSelectedItems(new Set());
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete content"
            );
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) return;
        if (
            !confirm(
                `Are you sure you want to delete ${selectedItems.size} items?`
            )
        )
            return;

        try {
            const itemsArray = Array.from(selectedItems);
            for (const itemId of itemsArray) {
                const item = content.find((c) => c.id === itemId);
                if (item) {
                    await fetch("/api/admin/content", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: itemId, type: item.type }),
                    });
                }
            }

            await fetchContent();
            setSelectedItems(new Set());
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete content"
            );
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === content.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(content.map((item) => item.id)));
        }
    };

    const toggleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
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
                    Content Moderation
                </h2>
                {selectedItems.size > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedItems.size})
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
                                placeholder="Search content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(
                                    e.target.value as
                                        | "all"
                                        | "posts"
                                        | "comments"
                                )
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Content</option>
                            <option value="posts">Posts Only</option>
                            <option value="comments">Comments Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Content Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {content.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedItems.size ===
                                                    content.length &&
                                                content.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Content
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {content.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.has(
                                                    item.id
                                                )}
                                                onChange={() =>
                                                    toggleSelectItem(item.id)
                                                }
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {item.type === "post" ? (
                                                    <div className="flex items-center gap-1 text-blue-600">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span className="text-sm font-medium">
                                                            Post
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span className="text-sm font-medium">
                                                            Comment
                                                        </span>
                                                    </div>
                                                )}
                                                {item.hasImages && (
                                                    <Image className="h-4 w-4 text-purple-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-md">
                                                <p className="text-sm text-gray-900 truncate">
                                                    {item.content.substring(
                                                        0,
                                                        100
                                                    )}
                                                    {item.content.length >
                                                        100 && "..."}
                                                </p>
                                                {item.type === "comment" &&
                                                    item.postAuthor && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            On post by{" "}
                                                            {item.postAuthor}:{" "}
                                                            {item.postPreview}
                                                        </p>
                                                    )}
                                                {item.type === "post" &&
                                                    item.commentsCount !==
                                                        undefined && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {item.commentsCount}{" "}
                                                            comments
                                                        </p>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.authorName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(
                                                item.createdAt
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.id,
                                                            item.type
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No content found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No posts or comments match your current filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentModeration;
