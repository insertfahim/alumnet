"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    XCircle,
    Download,
    RefreshCw,
    Eye,
    Mail,
    Calendar,
    MapPin,
    Building,
    GraduationCap,
} from "lucide-react";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    graduationYear: number;
    degree: string;
    major: string;
    currentCompany?: string;
    currentPosition?: string;
    location?: string;
    role: "ADMIN" | "ALUMNI" | "STUDENT";
    isVerified: boolean;
    emailVerified: Date | null;
    createdAt: string;
    updatedAt: string;
    _count: {
        posts: number;
        jobs: number;
        organizedEvents: number;
        donations: number;
    };
}

interface UserFilters {
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [filters, setFilters] = useState<UserFilters>({
        search: "",
        role: "all",
        status: "all",
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    useEffect(() => {
        fetchUsers();
    }, [page, filters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...filters,
            });

            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/users?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data.users);
            setTotalPages(data.pagination.totalPages);
            setTotalUsers(data.pagination.totalUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId,
                    ...updates,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update user");
            }

            await fetchUsers();
            return true;
        } catch (error) {
            console.error("Error updating user:", error);
            return false;
        }
    };

    const deleteUser = async (userId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this user? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            await fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const exportUsers = async () => {
        try {
            const params = new URLSearchParams({
                search: filters.search,
                role: filters.role,
                status: filters.status,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            });
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/users/export?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to export users");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `users-export-${
                new Date().toISOString().split("T")[0]
            }.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting users:", error);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedUsers.length === 0) return;

        const updates: any = {};
        switch (action) {
            case "verify":
                updates.isVerified = true;
                break;
            case "unverify":
                updates.isVerified = false;
                break;
            case "delete":
                if (
                    !confirm(
                        `Are you sure you want to delete ${selectedUsers.length} users?`
                    )
                ) {
                    return;
                }
                // Handle bulk delete
                for (const userId of selectedUsers) {
                    await deleteUser(userId);
                }
                setSelectedUsers([]);
                return;
        }

        for (const userId of selectedUsers) {
            await updateUser(userId, updates);
        }
        setSelectedUsers([]);
    };

    const getRoleBadge = (role: string) => {
        const roleColors = {
            ADMIN: "bg-red-100 text-red-800",
            ALUMNI: "bg-blue-100 text-blue-800",
            STUDENT: "bg-green-100 text-green-800",
        };
        return (
            <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                    roleColors[role as keyof typeof roleColors]
                }`}
            >
                {role}
            </span>
        );
    };

    const getStatusBadge = (user: User) => {
        if (user.isVerified) {
            return (
                <span className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                </span>
            );
        }
        return (
            <span className="flex items-center text-yellow-600 text-sm">
                <XCircle className="w-4 h-4 mr-1" />
                Unverified
            </span>
        );
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        User Management
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Manage {totalUsers} registered users
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                    <button
                        onClick={exportUsers}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={fetchUsers}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, company..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.search}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    search: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <select
                            value={filters.role}
                            onChange={(e) =>
                                setFilters({ ...filters, role: e.target.value })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="ALUMNI">Alumni</option>
                            <option value="STUDENT">Student</option>
                            <option value="ADMIN">Admin</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    status: e.target.value,
                                })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>

                        <select
                            value={filters.sortBy}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    sortBy: e.target.value,
                                })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt">Created Date</option>
                            <option value="firstName">First Name</option>
                            <option value="lastName">Last Name</option>
                            <option value="graduationYear">
                                Graduation Year
                            </option>
                        </select>

                        <select
                            value={filters.sortOrder}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    sortOrder: e.target.value as "asc" | "desc",
                                })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-medium">
                            {selectedUsers.length} users selected
                        </span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleBulkAction("verify")}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                                Verify All
                            </button>
                            <button
                                onClick={() => handleBulkAction("unverify")}
                                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                            >
                                Unverify All
                            </button>
                            <button
                                onClick={() => handleBulkAction("delete")}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                                Delete All
                            </button>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedUsers.length ===
                                                users.length && users.length > 0
                                        }
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUsers(
                                                    users.map((u) => u.id)
                                                );
                                            } else {
                                                setSelectedUsers([]);
                                            }
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role & Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Education
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className={`hover:bg-gray-50 ${
                                        selectedUsers.includes(user.id)
                                            ? "bg-blue-50"
                                            : ""
                                    }`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(
                                                user.id
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers([
                                                        ...selectedUsers,
                                                        user.id,
                                                    ]);
                                                } else {
                                                    setSelectedUsers(
                                                        selectedUsers.filter(
                                                            (id) =>
                                                                id !== user.id
                                                        )
                                                    );
                                                }
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.profilePicture ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={
                                                            user.profilePicture
                                                        }
                                                        alt=""
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {user.email}
                                                </div>
                                                {user.currentCompany && (
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Building className="w-3 h-3 mr-1" />
                                                        {user.currentPosition}{" "}
                                                        at {user.currentCompany}
                                                    </div>
                                                )}
                                                {user.location && (
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {user.location}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {getRoleBadge(user.role)}
                                            {getStatusBadge(user)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="space-y-1">
                                            <div className="flex items-center">
                                                <GraduationCap className="w-3 h-3 mr-1 text-gray-400" />
                                                {user.degree} in {user.major}
                                            </div>
                                            <div className="flex items-center text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                Class of {user.graduationYear}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="space-y-1">
                                            <div>{user._count.posts} posts</div>
                                            <div>{user._count.jobs} jobs</div>
                                            <div>
                                                {user._count.organizedEvents}{" "}
                                                events
                                            </div>
                                            <div>
                                                ${user._count.donations} donated
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(
                                            user.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() =>
                                                    setEditingUser(user)
                                                }
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    updateUser(user.id, {
                                                        isVerified:
                                                            !user.isVerified,
                                                    })
                                                }
                                                className={`${
                                                    user.isVerified
                                                        ? "text-yellow-600 hover:text-yellow-900"
                                                        : "text-green-600 hover:text-green-900"
                                                }`}
                                            >
                                                {user.isVerified ? (
                                                    <XCircle className="w-4 h-4" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                            </button>
                                            {user.role !== "ADMIN" && (
                                                <button
                                                    onClick={() =>
                                                        deleteUser(user.id)
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {(page - 1) * 20 + 1} to{" "}
                            {Math.min(page * 20, totalUsers)} of {totalUsers}{" "}
                            users
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onUpdate={(updates) => {
                        updateUser(editingUser.id, updates);
                        setEditingUser(null);
                    }}
                />
            )}
        </div>
    );
}

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onUpdate: (updates: Partial<User>) => void;
}

function EditUserModal({ user, onClose, onUpdate }: EditUserModalProps) {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified !== null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates: any = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            role: formData.role,
            isVerified: formData.isVerified,
            emailVerified: formData.emailVerified,
        };
        onUpdate(updates);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Edit User
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        firstName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value as any,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALUMNI">Alumni</option>
                            <option value="STUDENT">Student</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isVerified}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        isVerified: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Profile Verified
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.emailVerified}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        emailVerified: e.target.checked,
                                    })
                                }
                                className="rounded border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                                Email Verified
                            </span>
                        </label>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
