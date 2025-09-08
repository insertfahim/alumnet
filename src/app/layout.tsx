import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "BRAC University Alumni Network Portal",
    description:
        "Connect with fellow BRAC University graduates worldwide. Join 22,000+ BRACU alumni, find career opportunities, and build lasting professional relationships.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <QueryProvider>
                    <AuthProvider>
                        <div className="min-h-screen flex flex-col">
                            <Navigation />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                    </AuthProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
