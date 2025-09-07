import { Metadata } from "next";
import {
    Users,
    Briefcase,
    Calendar,
    MessageCircle,
    Award,
    Target,
    Heart,
    Globe,
    BookOpen,
    TrendingUp,
    Mail,
    Phone,
    MapPin,
} from "lucide-react";

export const metadata: Metadata = {
    title: "About OCSAR | BRAC University Alumni Network",
    description:
        "Learn about the Office of Career Services and Alumni Relations (OCSAR) and how we connect BRAC University graduates worldwide.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                            About OCSAR
                        </h1>
                        <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
                            The Office of Career Services and Alumni Relations
                            (OCSAR) is dedicated to connecting BRAC University
                            graduates worldwide, fostering lifelong
                            relationships, and building successful careers
                            together.
                        </p>
                        <div className="flex justify-center items-center space-x-8 text-primary-200">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    22,000+
                                </div>
                                <div className="text-sm">Alumni Worldwide</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    200+
                                </div>
                                <div className="text-sm">Partner Companies</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">
                                    50+
                                </div>
                                <div className="text-sm">Countries</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="card">
                        <div className="flex items-center mb-6">
                            <Target className="h-8 w-8 text-primary-600 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Our Mission
                            </h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            To create a vibrant, inclusive community of BRAC
                            University alumni that fosters professional growth,
                            personal development, and lifelong connections. We
                            strive to be the bridge between our graduates and
                            opportunities that shape their future success.
                        </p>
                    </div>

                    <div className="card">
                        <div className="flex items-center mb-6">
                            <Award className="h-8 w-8 text-primary-600 mr-3" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Our Vision
                            </h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            To be the most engaged and impactful alumni network
                            in Bangladesh, recognized globally for our
                            commitment to excellence, innovation, and the
                            success of our alumni community across all sectors
                            and industries.
                        </p>
                    </div>
                </div>
            </div>

            {/* What We Do */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            What We Do
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            OCSAR provides comprehensive support to BRAC
                            University students and alumni through various
                            programs and services designed to enhance career
                            development and professional networking.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Career Services
                            </h3>
                            <p className="text-gray-600">
                                Comprehensive career counseling, job placement
                                assistance, resume building, and interview
                                preparation for students and recent graduates.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Alumni Network
                            </h3>
                            <p className="text-gray-600">
                                Connect with fellow BRACU graduates worldwide
                                through our comprehensive alumni directory and
                                networking events.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Events & Programs
                            </h3>
                            <p className="text-gray-600">
                                Regular alumni gatherings, career fairs,
                                workshops, and professional development seminars
                                throughout the year.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Mentorship Program
                            </h3>
                            <p className="text-gray-600">
                                Connect students with experienced alumni mentors
                                for career guidance and professional development
                                support.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Entrepreneurship
                            </h3>
                            <p className="text-gray-600">
                                Support for alumni entrepreneurs through
                                incubation programs, funding opportunities, and
                                business networking events.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Globe className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Global Connections
                            </h3>
                            <p className="text-gray-600">
                                International alumni chapters and partnerships
                                that connect BRACU graduates across the globe
                                for collaboration and opportunities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our History */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our History
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Since our founding, OCSAR has been at the forefront
                            of connecting BRAC University graduates and
                            supporting their professional journeys.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-white rounded-lg shadow-md p-6 h-full">
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    2001
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Foundation
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    BRAC University Alumni Association
                                    established to connect graduates and support
                                    their professional development.
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white rounded-lg shadow-md p-6 h-full">
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    2010
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Digital Transformation
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Launch of the first online alumni directory
                                    and networking platform, revolutionizing how
                                    alumni connect.
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white rounded-lg shadow-md p-6 h-full">
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    2018
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Global Expansion
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Establishment of international alumni
                                    chapters in North America, Europe, and Asia
                                    Pacific regions.
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="bg-white rounded-lg shadow-md p-6 h-full">
                                <div className="text-3xl font-bold text-primary-600 mb-2">
                                    2024
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Digital Innovation
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Launch of the new Alumni Network Portal with
                                    advanced features for career development and
                                    professional networking.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Values */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            The principles that guide everything we do at OCSAR
                            and define our commitment to our alumni community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <Heart className="h-10 w-10 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Community
                            </h3>
                            <p className="text-gray-600">
                                We believe in the power of community and the
                                strength that comes from supporting one another.
                                Our alumni network is built on trust, respect,
                                and mutual support.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <Award className="h-10 w-10 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Excellence
                            </h3>
                            <p className="text-gray-600">
                                We strive for excellence in everything we do,
                                from the quality of our programs to the impact
                                we make on our alumni&apos;s lives and careers.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <Globe className="h-10 w-10 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Innovation
                            </h3>
                            <p className="text-gray-600">
                                We embrace innovation and continuously evolve
                                our services to meet the changing needs of our
                                alumni and the dynamic global landscape.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Get in Touch
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Have questions about our programs or need
                            assistance? We&apos;re here to help. Reach out to
                            our team for support and guidance.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Visit Us
                            </h3>
                            <p className="text-gray-600">
                                BRAC University Campus
                                <br />
                                66 Mohakhali, Dhaka 1212
                                <br />
                                Bangladesh
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Email Us
                            </h3>
                            <p className="text-gray-600">
                                General Inquiries:
                                <br />
                                <a
                                    href="mailto:alumni@bracu.ac.bd"
                                    className="text-primary-600 hover:text-primary-700"
                                >
                                    alumni@bracu.ac.bd
                                </a>
                                <br />
                                Career Services:
                                <br />
                                <a
                                    href="mailto:careers@bracu.ac.bd"
                                    className="text-primary-600 hover:text-primary-700"
                                >
                                    careers@bracu.ac.bd
                                </a>
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Phone className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Call Us
                            </h3>
                            <p className="text-gray-600">
                                Phone: +880 2 2222 3333
                                <br />
                                Extension: 4001 (Alumni)
                                <br />
                                Extension: 4002 (Career Services)
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Office Hours
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-gray-600">
                                <div>
                                    <strong>Monday - Thursday:</strong>
                                    <br />
                                    9:00 AM - 6:00 PM
                                </div>
                                <div>
                                    <strong>Friday:</strong>
                                    <br />
                                    9:00 AM - 5:00 PM
                                </div>
                                <div>
                                    <strong>Saturday:</strong>
                                    <br />
                                    9:00 AM - 1:00 PM
                                </div>
                                <div>
                                    <strong>Sunday:</strong>
                                    <br />
                                    Closed
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
