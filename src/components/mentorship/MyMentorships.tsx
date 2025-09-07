"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    MessageCircle,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react";

interface MentorshipPair {
    id: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
    message?: string;
    createdAt: string;
    acceptedAt?: string;
    mentor: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        currentCompany?: string;
        currentPosition?: string;
    };
    mentee: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    sessions: Session[];
}

interface Session {
    id: string;
    title: string;
    scheduledAt: string;
    duration: number;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    meetingLink?: string;
}

export function MyMentorships() {
    const [mentorships, setMentorships] = useState<MentorshipPair[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMentorships();
    }, []);

    const fetchMentorships = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/mentorship/my-mentorships", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setMentorships(data);
            }
        } catch (error) {
            console.error("Error fetching mentorships:", error);
        } finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "ACCEPTED":
                return (
                    <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case "DECLINED":
                return (
                    <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Declined
                    </Badge>
                );
            case "COMPLETED":
                return (
                    <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge variant="outline">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleMessage = (userId: string) => {
        // TODO: Implement messaging
        console.log("Message user:", userId);
    };

    const handleScheduleSession = (mentorshipId: string) => {
        // TODO: Implement session scheduling
        console.log("Schedule session for mentorship:", mentorshipId);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    const asMentor = mentorships.filter(
        (m) => m.mentor.id === "current-user-id"
    ); // TODO: Get current user ID
    const asMentee = mentorships.filter(
        (m) => m.mentee.id === "current-user-id"
    ); // TODO: Get current user ID

    return (
        <Tabs defaultValue="as-mentee" className="space-y-6">
            <TabsList>
                <TabsTrigger value="as-mentee">
                    As Mentee ({asMentee.length})
                </TabsTrigger>
                <TabsTrigger value="as-mentor">
                    As Mentor ({asMentor.length})
                </TabsTrigger>
            </TabsList>

            <TabsContent value="as-mentee" className="space-y-4">
                {asMentee.length > 0 ? (
                    asMentee.map((mentorship) => (
                        <Card key={mentorship.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    mentorship.mentor
                                                        .profilePicture
                                                }
                                                alt={`${mentorship.mentor.firstName} ${mentorship.mentor.lastName}`}
                                            />
                                            <AvatarFallback>
                                                {mentorship.mentor.firstName[0]}
                                                {mentorship.mentor.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {mentorship.mentor.firstName}{" "}
                                                {mentorship.mentor.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {
                                                    mentorship.mentor
                                                        .currentPosition
                                                }{" "}
                                                at{" "}
                                                {
                                                    mentorship.mentor
                                                        .currentCompany
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(mentorship.status)}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {mentorship.message && (
                                    <p className="text-sm text-gray-700">
                                        <strong>Your message:</strong>{" "}
                                        {mentorship.message}
                                    </p>
                                )}

                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Requested on{" "}
                                    {new Date(
                                        mentorship.createdAt
                                    ).toLocaleDateString()}
                                </div>

                                {mentorship.status === "ACCEPTED" && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">
                                            Upcoming Sessions
                                        </h4>
                                        {mentorship.sessions.filter(
                                            (s) => s.status === "SCHEDULED"
                                        ).length > 0 ? (
                                            <div className="space-y-2">
                                                {mentorship.sessions
                                                    .filter(
                                                        (s) =>
                                                            s.status ===
                                                            "SCHEDULED"
                                                    )
                                                    .slice(0, 2)
                                                    .map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                                        >
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        session.title
                                                                    }
                                                                </p>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {new Date(
                                                                        session.scheduledAt
                                                                    ).toLocaleString()}{" "}
                                                                    (
                                                                    {
                                                                        session.duration
                                                                    }{" "}
                                                                    min)
                                                                </div>
                                                            </div>
                                                            {session.meetingLink && (
                                                                <Button size="sm">
                                                                    <a
                                                                        href={
                                                                            session.meetingLink
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Join
                                                                        Meeting
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                No upcoming sessions scheduled
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() =>
                                            handleMessage(mentorship.mentor.id)
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Message
                                    </Button>
                                    {mentorship.status === "ACCEPTED" && (
                                        <Button
                                            onClick={() =>
                                                handleScheduleSession(
                                                    mentorship.id
                                                )
                                            }
                                            size="sm"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule Session
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No mentorship requests yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Browse available mentors and send your first
                                mentorship request.
                            </p>
                            <Button>
                                <a href="#browse">Browse Mentors</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="as-mentor" className="space-y-4">
                {asMentor.length > 0 ? (
                    asMentor.map((mentorship) => (
                        <Card key={mentorship.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    mentorship.mentee
                                                        .profilePicture
                                                }
                                                alt={`${mentorship.mentee.firstName} ${mentorship.mentee.lastName}`}
                                            />
                                            <AvatarFallback>
                                                {mentorship.mentee.firstName[0]}
                                                {mentorship.mentee.lastName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {mentorship.mentee.firstName}{" "}
                                                {mentorship.mentee.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Mentee
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(mentorship.status)}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {mentorship.message && (
                                    <p className="text-sm text-gray-700">
                                        <strong>Their message:</strong>{" "}
                                        {mentorship.message}
                                    </p>
                                )}

                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Requested on{" "}
                                    {new Date(
                                        mentorship.createdAt
                                    ).toLocaleDateString()}
                                </div>

                                {mentorship.status === "PENDING" && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline">
                                            Accept Request
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Decline Request
                                        </Button>
                                    </div>
                                )}

                                {mentorship.status === "ACCEPTED" && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">
                                            Sessions
                                        </h4>
                                        {mentorship.sessions.length > 0 ? (
                                            <div className="space-y-2">
                                                {mentorship.sessions
                                                    .slice(0, 3)
                                                    .map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                                        >
                                                            <div>
                                                                <p className="font-medium">
                                                                    {
                                                                        session.title
                                                                    }
                                                                </p>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {new Date(
                                                                        session.scheduledAt
                                                                    ).toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline">
                                                                {session.status}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600">
                                                No sessions scheduled yet
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() =>
                                            handleMessage(mentorship.mentee.id)
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Message
                                    </Button>
                                    {mentorship.status === "ACCEPTED" && (
                                        <Button
                                            onClick={() =>
                                                handleScheduleSession(
                                                    mentorship.id
                                                )
                                            }
                                            size="sm"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule Session
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No mentorship requests received
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your mentor profile will appear here when
                                students request your guidance.
                            </p>
                            <Button>
                                <a href="#become-mentor">Update Your Profile</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    );
}
