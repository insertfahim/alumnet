export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    bio?: string;
    graduationYear: number;
    degree: string;
    major: string;
    currentCompany?: string;
    currentPosition?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    website?: string;
    role: "ADMIN" | "ALUMNI";
    isVerified: boolean;
    emailVerified?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface AlumniProfile extends User {
    education: Education[];
    experience: Experience[];
    connections: Connection[];
    posts: Post[];
    events: EventAttendance[];
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    major: string;
    startYear: number;
    endYear: number;
    gpa?: number;
    honors?: string;
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
    location?: string;
}

export interface Connection {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: "pending" | "accepted" | "declined";
    createdAt: Date;
    message?: string;
}

export interface Post {
    id: string;
    authorId: string;
    author: User;
    content: string;
    images?: string[];
    type: "general" | "job" | "event" | "achievement";
    likes: number;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    author: User;
    content: string;
    createdAt: Date;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: "full-time" | "part-time" | "contract" | "internship";
    remote: boolean;
    description: string;
    requirements: string[];
    salary?: string;
    postedById: string;
    postedBy: User;
    applications: JobApplication[];
    createdAt: Date;
    expiresAt: Date;
}

export interface JobApplication {
    id: string;
    jobId: string;
    applicantId: string;
    applicant: User;
    coverLetter?: string;
    resumeUrl?: string;
    status: "pending" | "reviewed" | "rejected" | "accepted";
    createdAt: Date;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    virtual: boolean;
    startDate: Date;
    endDate: Date;
    maxAttendees?: number;
    price?: number;
    organizerId: string;
    organizer: User;
    attendees: EventAttendance[];
    createdAt: Date;
}

export interface EventAttendance {
    id: string;
    eventId: string;
    userId: string;
    user: User;
    status: "going" | "maybe" | "not-going";
    registeredAt: Date;
}

export interface Message {
    id: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    read: boolean;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    participants: User[];
    messages: Message[];
    lastMessage: Message;
    updatedAt: Date;
}

// Mentorship types
export interface MentorProfile {
    id: string;
    userId: string;
    skills: string[];
    expertise: string[];
    bio?: string;
    experience?: string;
    availability?: string;
    isActive: boolean;
    hourlyRate?: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}

export interface MentorshipPair {
    id: string;
    mentorId: string;
    menteeId: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
    message?: string;
    createdAt: Date;
    acceptedAt?: Date;
    endedAt?: Date;
    mentor: User;
    mentee: User;
    sessions: Session[];
}

export interface Session {
    id: string;
    pairId: string;
    title: string;
    description?: string;
    scheduledAt: Date;
    duration: number;
    meetingLink?: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    createdAt: Date;
    completedAt?: Date;
}

export interface Feedback {
    id: string;
    sessionId: string;
    authorId: string;
    rating: number;
    comments?: string;
    isPublic: boolean;
    createdAt: Date;
}
