"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="bg-gray-50">
            <Header />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        About re-Soldium
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Your trusted marketplace for buying and selling quality
                        items. We're building a community where great deals meet
                        great people.
                    </p>
                </div>

                {/* Mission Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            Our Mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 text-center text-lg leading-relaxed">
                            To create a safe, user-friendly marketplace that
                            connects people with the items they need while
                            helping others find new homes for their belongings.
                            We believe in the power of community-driven commerce
                            and sustainable consumption.
                        </p>
                    </CardContent>
                </Card>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Safe & Secure
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Advanced security measures and user verification
                                to ensure safe transactions.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Community Driven
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Built by the community, for the community. Real
                                people, real deals.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Fast & Easy
                            </h3>
                            <p className="text-gray-600 text-sm">
                                List items in minutes and find what you're
                                looking for quickly.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Made with Love
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Every feature is crafted with care to provide
                                the best user experience.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Story Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <Card>
                        <CardHeader>
                            <CardTitle>Our Story</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600">
                                re-Soldium was born from a simple idea: what if
                                buying and selling used items could be as easy
                                as posting on social media? We wanted to create
                                a platform that combines the convenience of
                                modern technology with the personal touch of
                                local marketplaces.
                            </p>
                            <p className="text-gray-600">
                                Our team of passionate developers and designers
                                worked tirelessly to build a platform that
                                prioritizes user experience, safety, and
                                community. Every feature is designed with our
                                users in mind.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>What Makes Us Different</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    User-Centric Design
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Every feature is designed based on real user
                                    feedback and needs.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Mobile-First Approach
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Optimized for mobile devices because that's
                                    how most people shop today.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Real-Time Communication
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Built-in messaging system for seamless
                                    buyer-seller communication.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Smart Notifications
                                </h4>
                                <p className="text-gray-600 text-sm">
                                    Stay updated with intelligent notifications
                                    about your listings and messages.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Team Section */}
                <Card className="mb-12">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            Meet the Creator
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-white text-2xl font-bold">
                                    HM
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Harshal Mali
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Full Stack Developer & UI/UX Designer
                            </p>
                            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                                The creative mind behind re-Soldium. A
                                passionate developer who believes in creating
                                technology that brings people together. With
                                expertise in modern web technologies and a keen
                                eye for design, Harshal built re-Soldium from
                                the ground up.
                            </p>
                            <Button asChild variant="outline">
                                <a
                                    href="https://harshalmali.netlify.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2"
                                >
                                    <span>Visit Portfolio</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                1000+
                            </div>
                            <div className="text-gray-600 text-sm">
                                Active Users
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                5000+
                            </div>
                            <div className="text-gray-600 text-sm">
                                Items Listed
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                10000+
                            </div>
                            <div className="text-gray-600 text-sm">
                                Messages Sent
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-red-600 mb-2">
                                99%
                            </div>
                            <div className="text-gray-600 text-sm">
                                User Satisfaction
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            Get in Touch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-4">
                            <p className="text-gray-600">
                                Have questions, feedback, or suggestions? We'd
                                love to hear from you!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button asChild>
                                    <Link href="/contact">Contact Us</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/support">Support Center</Link>
                                </Button>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-gray-500 text-sm">
                                    Email: support@re-soldium.com | Phone: +1
                                    (555) 123-4567
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
