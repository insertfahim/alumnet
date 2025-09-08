import {
    Users,
    Briefcase,
    Calendar,
    MessageCircle,
    Award,
    Globe,
} from "lucide-react";

const features = [
    {
        icon: Users,
        title: "BRACU Alumni Directory",
        description:
            "Search and connect with fellow BRAC University graduates by graduation year, school, location, and industry.",
    },
    {
        icon: Briefcase,
        title: "Career Opportunities",
        description:
            "Discover job opportunities posted by BRACU alumni and companies actively recruiting from our network.",
    },
    {
        icon: Calendar,
        title: "BRACU Events & Reunions",
        description:
            "Stay updated on BRAC University alumni events, networking meetups, and homecoming celebrations.",
    },
    {
        icon: MessageCircle,
        title: "Direct Messaging",
        description:
            "Connect privately with fellow Bracuites to discuss opportunities, seek advice, and collaborate on projects.",
    },
    {
        icon: Award,
        title: "Mentorship Network",
        description:
            "Find experienced BRACU mentors or become one yourself. Share expertise and guide fellow alumni.",
    },
    {
        icon: Globe,
        title: "Global BRACU Community",
        description:
            "Connect with BRAC University alumni across Asia Pacific, North America, Europe, and beyond.",
    },
];

export function Features() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Connect with the BRACU Community
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Our platform provides all the tools you need to build
                        and maintain meaningful relationships with your fellow
                        BRAC University graduates.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="card hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="bg-primary-100 p-3 rounded-lg">
                                    <feature.icon className="h-6 w-6 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 ml-4">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
