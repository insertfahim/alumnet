"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, X } from "lucide-react";

interface MentorshipRequestFormProps {
    mentorId: string;
    mentorName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function MentorshipRequestForm({
    mentorId,
    mentorName,
    onClose,
    onSuccess,
}: MentorshipRequestFormProps) {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetch("/api/mentorship/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    mentorId,
                    message: message.trim(),
                }),
            });
            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                console.error("Failed to send mentorship request");
            }
        } catch (error) {
            console.error("Error sending mentorship request:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Request Mentorship
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Send a mentorship request to {mentorName}
                </p>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label
                            htmlFor="message"
                            className="text-base font-medium"
                        >
                            Message
                        </Label>
                        <p className="text-sm text-gray-600 mb-2">
                            Introduce yourself and explain why you'd like to be
                            mentored by {mentorName}
                        </p>
                        <Textarea
                            id="message"
                            placeholder={`Hi ${mentorName.split(" ")[0]}, 

I'm a BRACU graduate interested in your expertise in...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                "Sending..."
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>

                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                        What happens next?
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• {mentorName} will receive your request</li>
                        <li>
                            • They can accept, decline, or ask for more
                            information
                        </li>
                        <li>
                            • If accepted, you'll be able to schedule sessions
                        </li>
                        <li>• You can message each other to coordinate</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
