import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Star, Clock, DollarSign } from "lucide-react";

interface MentorProfile {
    id: string;
    userId: string;
    skills: string[];
    expertise: string[];
    bio?: string;
    experience?: string;
    availability?: string;
    isActive: boolean;
    hourlyRate?: number;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        currentCompany?: string;
        currentPosition?: string;
        graduationYear: number;
        major: string;
    };
}

interface MentorCardProps {
    mentor: MentorProfile;
}

export function MentorCard({ mentor }: MentorCardProps) {
    const handleRequestMentorship = () => {
        // TODO: Implement mentorship request
        console.log("Request mentorship from:", mentor.user.firstName);
    };

    const handleMessage = () => {
        // TODO: Implement messaging
        console.log("Message mentor:", mentor.user.firstName);
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage
                        src={mentor.user.profilePicture}
                        alt={`${mentor.user.firstName} ${mentor.user.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                        {mentor.user.firstName[0]}
                        {mentor.user.lastName[0]}
                    </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold text-gray-900">
                    {mentor.user.firstName} {mentor.user.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                    {mentor.user.currentPosition} at{" "}
                    {mentor.user.currentCompany}
                </p>
                <p className="text-xs text-gray-500">
                    BRACU {mentor.user.graduationYear} • {mentor.user.major}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                {mentor.bio && (
                    <p className="text-sm text-gray-700 line-clamp-3">
                        {mentor.bio}
                    </p>
                )}

                {mentor.experience && (
                    <p className="text-sm text-gray-600">
                        <strong>Experience:</strong> {mentor.experience}
                    </p>
                )}

                {mentor.availability && (
                    <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {mentor.availability}
                    </div>
                )}

                {mentor.hourlyRate && (
                    <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />$
                        {mentor.hourlyRate}/hour
                    </div>
                )}

                <div className="space-y-2">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {mentor.skills.slice(0, 3).map((skill) => (
                                <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {skill}
                                </Badge>
                            ))}
                            {mentor.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{mentor.skills.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Expertise
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {mentor.expertise.slice(0, 3).map((exp) => (
                                <Badge
                                    key={exp}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {exp}
                                </Badge>
                            ))}
                            {mentor.expertise.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{mentor.expertise.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        onClick={handleRequestMentorship}
                        className="flex-1"
                        size="sm"
                    >
                        Request Mentorship
                    </Button>
                    <Button onClick={handleMessage} variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
