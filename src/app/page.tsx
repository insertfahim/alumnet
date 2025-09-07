import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Stats } from "@/components/home/Stats";
import { Testimonials } from "@/components/home/Testimonials";

export default function HomePage() {
    return (
        <div>
            <Hero />
            <Features />
            <Stats />
            <Testimonials />
        </div>
    );
}
