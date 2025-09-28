"use client";

import Link from "next/link";
import { Heart, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    R
                                </span>
                            </div>
                            <span className="text-xl font-bold">
                                re-Soldium
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted marketplace for buying and selling
                            quality items. Connect with local sellers and find
                            great deals in your area.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>Made with love for the community</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/sell"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Sell Item
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/favorites"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    My Favorites
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/messages"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Messages
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/profile"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    My Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Categories</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/?category=Electronics"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Electronics
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/?category=Fashion"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Fashion
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/?category=Home & Garden"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Home & Garden
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/?category=Sports"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Sports
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/?category=Books"
                                    className="text-gray-300 hover:text-white transition-colors text-sm"
                                >
                                    Books
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Owner Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Contact & Support
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 text-sm">
                                    support@re-soldium.com
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 text-sm">
                                    +91 9876543210
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 text-sm">
                                    Global Marketplace
                                </span>
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="pt-4 border-t border-gray-700">
                            <h4 className="text-sm font-medium text-gray-200 mb-2">
                                Created by
                            </h4>
                            <a
                                href="https://harshalmali.netlify.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                            >
                                <span>Harshal Mali</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                            <p className="text-gray-400 text-xs mt-1">
                                Full Stack Developer & UI/UX Designer
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} re-Soldium. All rights
                            reserved.
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <Link
                                href="/privacy"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/about"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                About Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
