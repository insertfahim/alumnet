"use client";

import { useState } from "react";
import {
    HelpCircle,
    User,
    Users,
    Briefcase,
    Search,
    Mail,
    Phone,
    Calendar,
    MessageCircle,
    Shield,
    Settings,
    FileText,
    AlertTriangle,
    BookOpen,
    CheckCircle,
} from "lucide-react";

export default function HelpPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const helpCategories = [
        {
            icon: User,
            title: "Getting Started",
            description:
                "New to the alumni network? Learn how to create your account, verify your profile, and get started with our platform.",
            topics: [
                "Creating your account",
                "Email verification",
                "Profile setup",
                "Account security",
                "Password management",
                "Account settings",
            ],
        },
        {
            icon: Users,
            title: "Networking",
            description:
                "Connect with fellow BRACU alumni, build your professional network, and discover new opportunities.",
            topics: [
                "Using the alumni directory",
                "Sending connection requests",
                "Managing your network",
                "Privacy settings",
                "Search filters",
                "Advanced networking",
            ],
        },
        {
            icon: Briefcase,
            title: "Career Services",
            description:
                "Access job opportunities, career resources, and professional development tools designed for BRACU alumni.",
            topics: [
                "Job search and applications",
                "Resume building",
                "Career counseling",
                "Mentorship program",
                "Job posting guidelines",
                "Application tracking",
            ],
        },
        {
            icon: Calendar,
            title: "Events & Activities",
            description:
                "Discover and participate in alumni events, reunions, workshops, and professional development activities.",
            topics: [
                "Browsing events",
                "Event registration",
                "Creating events",
                "Virtual vs in-person events",
                "Event management",
                "RSVP system",
            ],
        },
        {
            icon: MessageCircle,
            title: "Messaging",
            description:
                "Communicate effectively with other alumni through our secure messaging system.",
            topics: [
                "Starting conversations",
                "Message threads",
                "File sharing",
                "Message notifications",
                "Privacy in messaging",
                "Blocking users",
            ],
        },
        {
            icon: Shield,
            title: "Account Verification",
            description:
                "Learn about our verification process to build trust and credibility in the alumni community.",
            topics: [
                "Verification requirements",
                "Document upload",
                "Verification status",
                "Appealing decisions",
                "Privacy of documents",
                "Verification benefits",
            ],
        },
        {
            icon: Settings,
            title: "Profile Management",
            description:
                "Customize your profile to showcase your achievements and connect with the right opportunities.",
            topics: [
                "Profile editing",
                "Adding experience",
                "Social media links",
                "Profile visibility",
                "Professional summary",
                "Skills and interests",
            ],
        },
        {
            icon: FileText,
            title: "Admin Features",
            description:
                "For administrators: Learn how to manage users, verify alumni, and maintain the platform.",
            topics: [
                "User verification process",
                "Dashboard analytics",
                "Managing events",
                "Content moderation",
                "System settings",
                "Support ticket handling",
            ],
        },
    ];

    const faqs = [
        {
            question: "How do I create an alumni account?",
            answer: "To create an alumni account, visit our registration page and provide your BRAC University student ID, graduation year, and basic contact information. You'll need to verify your email address to complete the registration process.",
            related: ["Account Creation", "Email Verification"],
        },
        {
            question: "How do I connect with other alumni?",
            answer: "Use our alumni directory to search for graduates by name, graduation year, industry, or location. Send connection requests to alumni you'd like to network with.",
            related: ["Alumni Directory", "Networking"],
        },
        {
            question: "What documents do I need for account verification?",
            answer: "For verification, you'll need to upload your BRAC University degree certificate or transcript, and a valid government-issued ID. All documents are securely stored and only visible to administrators.",
            related: ["Account Verification", "Document Upload"],
        },
        {
            question: "How do I reset my password?",
            answer: "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email. Make sure to check your spam folder if you don't see the reset email.",
            related: ["Account Security", "Password Management"],
        },
        {
            question: "How do I update my profile information?",
            answer: "Go to your profile page and click the 'Edit Profile' button. You can update your bio, work experience, social media links, and other professional information.",
            related: ["Profile Management", "Profile Editing"],
        },
        {
            question: "How do I search for jobs on the platform?",
            answer: "Use the jobs page to search by keywords, location, company, or job type. You can also filter by salary range and remote work options. Set up job alerts to get notified of new opportunities.",
            related: ["Career Services", "Job Search"],
        },
        {
            question: "How do I register for an alumni event?",
            answer: "Browse events on the events page, click on an event you're interested in, and click 'Register' or 'RSVP'. You'll receive confirmation and event details via email.",
            related: ["Events & Activities", "Event Registration"],
        },
        {
            question: "How do I start a conversation with another alumni?",
            answer: "Visit their profile from the directory and click 'Send Message'. You can also start conversations from the messages page by searching for alumni by name.",
            related: ["Messaging", "Starting Conversations"],
        },
        {
            question: "How do I post a job opportunity?",
            answer: "If you have verified status, go to the jobs page and click 'Post a Job'. Fill in the job details, requirements, and salary information. Your post will be reviewed before publishing.",
            related: ["Career Services", "Job Posting"],
        },
        {
            question: "What should I do if I can't access my account?",
            answer: "Try resetting your password first. If that doesn't work, contact support with your registered email address and any account details you remember. We'll help you regain access.",
            related: ["Account Security", "Support"],
        },
        {
            question: "How do I change my privacy settings?",
            answer: "Go to your profile settings and choose who can see your profile information, contact details, and activity. You can make your profile visible to all alumni, connections only, or completely private.",
            related: ["Privacy Settings", "Profile Management"],
        },
        {
            question: "Can I create and manage my own events?",
            answer: "Verified alumni can create events through the events page. Click 'Create Event' and fill in the details. You can set capacity limits, pricing, and manage registrations.",
            related: ["Events & Activities", "Event Management"],
        },
        {
            question: "How do I find a mentor or become a mentor?",
            answer: "Use the mentorship program section in career services. You can browse available mentors by industry and experience, or offer your expertise as a mentor to junior alumni.",
            related: ["Career Services", "Mentorship Program"],
        },
        {
            question: "What happens after I upload verification documents?",
            answer: "Our administrators will review your documents within 2-3 business days. You'll receive an email notification with the verification decision. If approved, you'll get a verified badge on your profile.",
            related: ["Account Verification", "Verification Process"],
        },
        {
            question: "How do I block or report inappropriate users?",
            answer: "From any user's profile or message thread, click the menu (three dots) and select 'Block' or 'Report'. Our moderation team will review reports within 24 hours.",
            related: ["Privacy", "Content Moderation"],
        },
        {
            question: "Can I export my profile data?",
            answer: "Yes, go to your account settings and click 'Download My Data'. This will give you a complete export of your profile information, connections, and activity history.",
            related: ["Privacy", "Data Export"],
        },
        {
            question: "How do I delete my account?",
            answer: "Contact support directly with your account deletion request. We'll process your request within 7 business days and provide confirmation once completed.",
            related: ["Account Management", "Data Privacy"],
        },
        {
            question: "What are the benefits of getting verified?",
            answer: "Verified alumni get priority in job postings, can create events, access exclusive networking opportunities, and have a trusted badge that builds credibility with other users.",
            related: ["Account Verification", "Verification Benefits"],
        },
        {
            question: "How do I manage my job applications?",
            answer: "Visit your dashboard to see all your job applications with their current status. You can also track applications directly from the jobs page under 'My Applications'.",
            related: ["Career Services", "Application Tracking"],
        },
        {
            question: "Can I attend virtual events?",
            answer: "Yes! Many events are held virtually. When you register for a virtual event, you'll receive meeting links and access instructions via email before the event starts.",
            related: ["Events & Activities", "Virtual Events"],
        },
    ];

    const filteredCategories = helpCategories.filter(
        (category) =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            category.topics.some((topic) =>
                topic.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.related.some((related) =>
                related.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <HelpCircle className="h-16 w-16 text-primary-200" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                            Help Center
                        </h1>
                        <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
                            Find answers to your questions and get the support
                            you need.
                        </p>
                        <div className="max-w-md mx-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for help..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Help Categories */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {searchTerm
                            ? `Search Results for "${searchTerm}"`
                            : "Browse by Category"}
                    </h2>
                    <p className="text-xl text-gray-600">
                        {searchTerm
                            ? `${filteredCategories.length} categories found`
                            : "Choose a category to find the help you need"}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredCategories.map((category, index) => {
                        const IconComponent = category.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center mb-4">
                                    <IconComponent className="h-8 w-8 text-primary-600 mr-3" />
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {category.title}
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    {category.description}
                                </p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {category.topics.map(
                                        (topic, topicIndex) => (
                                            <li key={topicIndex}>• {topic}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {searchTerm && filteredCategories.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No results found
                        </h3>
                        <p className="text-gray-600">
                            Try searching with different keywords.
                        </p>
                    </div>
                )}
            </div>

            {/* Frequently Asked Questions */}
            {(searchTerm === "" || filteredFaqs.length > 0) && (
                <div className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {searchTerm
                                    ? "Matching Questions"
                                    : "Frequently Asked Questions"}
                            </h2>
                            <p className="text-xl text-gray-600">
                                {searchTerm
                                    ? `${filteredFaqs.length} questions found`
                                    : "Quick answers to the most common questions"}
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <HelpCircle className="h-5 w-5 text-primary-600 mr-2" />
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        {faq.answer}
                                    </p>
                                    <div className="text-sm text-primary-600">
                                        <strong>Related:</strong>{" "}
                                        {faq.related.join(", ")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Start Guides */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Quick Start Guides
                        </h2>
                        <p className="text-xl text-gray-600">
                            Step-by-step guides to get you started quickly
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    New User Setup
                                </h3>
                            </div>
                            <ol className="space-y-2 text-gray-600 text-sm">
                                <li>1. Register with your BRACU email</li>
                                <li>2. Verify your email address</li>
                                <li>3. Complete your profile</li>
                                <li>4. Upload verification documents</li>
                                <li>5. Start networking!</li>
                            </ol>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <Users className="h-8 w-8 text-green-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Build Your Network
                                </h3>
                            </div>
                            <ol className="space-y-2 text-gray-600 text-sm">
                                <li>1. Search alumni directory</li>
                                <li>2. Send connection requests</li>
                                <li>3. Personalize your profile</li>
                                <li>4. Join alumni events</li>
                                <li>5. Engage in discussions</li>
                            </ol>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center mb-4">
                                <Briefcase className="h-8 w-8 text-purple-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Career Advancement
                                </h3>
                            </div>
                            <ol className="space-y-2 text-gray-600 text-sm">
                                <li>1. Update your resume</li>
                                <li>2. Browse job opportunities</li>
                                <li>3. Connect with mentors</li>
                                <li>4. Attend career events</li>
                                <li>5. Track applications</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Troubleshooting
                        </h2>
                        <p className="text-xl text-gray-600">
                            Common issues and their solutions
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-red-50 border-l-4 border-red-400 p-6">
                            <div className="flex items-center mb-3">
                                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                                <h3 className="text-lg font-semibold text-red-900">
                                    Can't log in to your account?
                                </h3>
                            </div>
                            <ul className="text-red-800 text-sm space-y-1">
                                <li>• Check if your email is verified</li>
                                <li>• Try resetting your password</li>
                                <li>• Clear your browser cache and cookies</li>
                                <li>• Contact support if issues persist</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                            <div className="flex items-center mb-3">
                                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
                                <h3 className="text-lg font-semibold text-yellow-900">
                                    Profile not showing up in search?
                                </h3>
                            </div>
                            <ul className="text-yellow-800 text-sm space-y-1">
                                <li>• Ensure your profile is set to public</li>
                                <li>• Complete your profile information</li>
                                <li>• Wait 24 hours for search indexing</li>
                                <li>• Check your privacy settings</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                            <div className="flex items-center mb-3">
                                <CheckCircle className="h-6 w-6 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-blue-900">
                                    Event registration not working?
                                </h3>
                            </div>
                            <ul className="text-blue-800 text-sm space-y-1">
                                <li>• Check event capacity and dates</li>
                                <li>• Ensure you're logged in</li>
                                <li>• Verify your account is verified</li>
                                <li>• Refresh the page and try again</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Still Need Help?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Can't find what you're looking for? Our support team
                            is here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <Mail className="h-8 w-8 text-primary-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Email Support
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Send us an email and we'll get back to you
                                within 24 hours.
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Support:</strong>{" "}
                                <a
                                    href="mailto:support@bracu-alumni.org"
                                    className="text-primary-600 hover:text-primary-700"
                                >
                                    support@bracu-alumni.org
                                </a>
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="flex items-center mb-6">
                                <Phone className="h-8 w-8 text-primary-600 mr-3" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Phone Support
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Speak directly with our support team during
                                business hours.
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Phone:</strong> +880 2 2222 3333
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
