import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/providers/Providers";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "re-Soldium | Buy & Sell Everything",
    description:
        "Buy and sell used goods, electronics, vehicles, and more on re-Soldium - your trusted marketplace",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
