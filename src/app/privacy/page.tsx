"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
    return (
        <div className="bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-600">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Information We Collect</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Personal Information
                                </h4>
                                <p className="text-gray-600">
                                    When you create an account, we collect your
                                    name, email address, and profile
                                    information. We may also collect your phone
                                    number if you choose to provide it for
                                    contact purposes.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Usage Information
                                </h4>
                                <p className="text-gray-600">
                                    We collect information about how you use our
                                    platform, including the products you view,
                                    search queries, and interactions with other
                                    users.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Device Information
                                </h4>
                                <p className="text-gray-600">
                                    We may collect information about your
                                    device, including IP address, browser type,
                                    and operating system for security and
                                    analytics purposes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                2. How We Use Your Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-gray-600">
                                <li>
                                    • To provide and maintain our marketplace
                                    services
                                </li>
                                <li>
                                    • To facilitate communication between buyers
                                    and sellers
                                </li>
                                <li>
                                    • To send you notifications about messages,
                                    favorites, and account activity
                                </li>
                                <li>
                                    • To improve our platform and develop new
                                    features
                                </li>
                                <li>
                                    • To ensure platform security and prevent
                                    fraud
                                </li>
                                <li>• To comply with legal obligations</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>3. Information Sharing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    With Other Users
                                </h4>
                                <p className="text-gray-600">
                                    When you list a product or contact a seller,
                                    your name and contact information may be
                                    shared with other users as necessary for the
                                    transaction.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    With Service Providers
                                </h4>
                                <p className="text-gray-600">
                                    We may share information with third-party
                                    service providers who help us operate our
                                    platform, such as cloud storage providers
                                    and analytics services.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Legal Requirements
                                </h4>
                                <p className="text-gray-600">
                                    We may disclose information if required by
                                    law or to protect our rights, property, or
                                    safety, or that of our users.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>4. Data Security</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                We implement appropriate security measures to
                                protect your personal information against
                                unauthorized access, alteration, disclosure, or
                                destruction. However, no method of transmission
                                over the internet is 100% secure, and we cannot
                                guarantee absolute security.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>5. Your Rights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-gray-600">
                                <li>
                                    • Access and update your personal
                                    information
                                </li>
                                <li>
                                    • Delete your account and associated data
                                </li>
                                <li>• Opt out of marketing communications</li>
                                <li>• Request a copy of your data</li>
                                <li>
                                    • Object to certain processing activities
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>6. Cookies and Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                We use cookies and similar technologies to
                                enhance your experience, analyze usage patterns,
                                and provide personalized content. You can
                                control cookie settings through your browser
                                preferences.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>7. Children's Privacy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Our service is not intended for children under
                                13 years of age. We do not knowingly collect
                                personal information from children under 13. If
                                you are a parent or guardian and believe your
                                child has provided us with personal information,
                                please contact us.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>8. Changes to This Policy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                We may update this Privacy Policy from time to
                                time. We will notify you of any changes by
                                posting the new Privacy Policy on this page and
                                updating the "Last updated" date. You are
                                advised to review this Privacy Policy
                                periodically for any changes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>9. Contact Us</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                If you have any questions about this Privacy
                                Policy or our data practices, please contact us
                                at:
                            </p>
                            <div className="mt-4 space-y-2">
                                <p className="text-gray-600">
                                    <strong>Email:</strong>{" "}
                                    privacy@re-soldium.com
                                </p>
                                <p className="text-gray-600">
                                    <strong>Address:</strong> re-Soldium Privacy
                                    Team, Global Marketplace
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
