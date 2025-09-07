const stats = [
    { number: "22,000+", label: "BRACU Alumni Worldwide" },
    { number: "80+", label: "Countries Represented" },
    { number: "23", label: "Years of Excellence" },
    { number: "7", label: "Schools & Institutes" },
];

export function Stats() {
    return (
        <div className="bg-primary-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        BRAC University by the Numbers
                    </h2>
                    <p className="text-lg text-gray-600">
                        Join a thriving global community of BRACU graduates
                        making an impact
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
                                {stat.number}
                            </div>
                            <div className="text-lg text-gray-600">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
