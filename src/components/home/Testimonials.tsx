const testimonials = [
    {
        name: "Fahima Rahman",
        class: "Class of 2018",
        school: "BRAC Business School",
        company: "BRAC Bank Limited",
        position: "Assistant Vice President",
        content:
            "The BRACU alumni network opened doors I never knew existed. Through connections made on this platform, I was able to transition from a fresh graduate to a leadership role in one of Bangladesh's leading financial institutions.",
        image: "/images/testimonials/fahima.jpg",
    },
    {
        name: "Rafiq Ahmed",
        class: "Class of 2016",
        school: "School of Computer Science",
        company: "Samsung R&D Institute",
        position: "Senior Software Engineer",
        content:
            "Being part of the BRAC University alumni community helped me land my dream job in tech. The mentorship and guidance from senior BRACU graduates has been invaluable for my career in software engineering.",
        image: "/images/testimonials/rafiq.jpg",
    },
    {
        name: "Sadia Akter",
        class: "Class of 2020",
        school: "James P Grant School of Public Health",
        company: "World Health Organization",
        position: "Public Health Consultant",
        content:
            "The global reach of BRACU's alumni network is incredible. Through this platform, I connected with alumni working in international organizations, which helped me secure my position with WHO during the pandemic.",
        image: "/images/testimonials/sadia.jpg",
    },
];

export function Testimonials() {
    return (
        <div className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Success Stories from BRACU Alumni
                    </h2>
                    <p className="text-xl text-gray-600">
                        Hear from BRAC University graduates who have found
                        success through our global alumni network
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md p-6"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold text-lg">
                                        {testimonial.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </span>
                                </div>
                                <div className="ml-4">
                                    <h4 className="font-semibold text-gray-900">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {testimonial.class}
                                    </p>
                                    <p className="text-xs text-primary-600 font-medium">
                                        {testimonial.school}
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4 italic">
                                "{testimonial.content}"
                            </p>

                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-gray-900">
                                    {testimonial.position}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {testimonial.company}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
