"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
    return (
        <div className="bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-gray-600">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Acceptance of Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                By accessing and using re-Soldium (&quot;the
                                Service&quot;), you accept and agree to be bound
                                by the terms and provision of this agreement. If
                                you do not agree to abide by the above, please
                                do not use this service.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>2. Description of Service</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                re-Soldium is an online marketplace that allows
                                users to buy and sell items. We provide a
                                platform for users to list products, communicate
                                with each other, and facilitate transactions. We
                                are not a party to any transaction between
                                users.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>3. User Accounts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Account Creation
                                </h4>
                                <p className="text-gray-600">
                                    You must create an account to use certain
                                    features of our service. You are responsible
                                    for maintaining the confidentiality of your
                                    account credentials and for all activities
                                    that occur under your account.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Account Requirements
                                </h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>
                                        • You must be at least 18 years old to
                                        create an account
                                    </li>
                                    <li>
                                        • You must provide accurate and complete
                                        information
                                    </li>
                                    <li>
                                        • You may only create one account per
                                        person
                                    </li>
                                    <li>
                                        • You are responsible for keeping your
                                        information up to date
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>4. User Conduct</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Prohibited Activities
                                </h4>
                                <p className="text-gray-600 mb-2">
                                    You agree not to:
                                </p>
                                <ul className="space-y-1 text-gray-600">
                                    <li>
                                        • Post false, misleading, or fraudulent
                                        listings
                                    </li>
                                    <li>
                                        • Sell illegal, stolen, or counterfeit
                                        items
                                    </li>
                                    <li>
                                        • Harass, abuse, or threaten other users
                                    </li>
                                    <li>
                                        • Spam or send unsolicited
                                        communications
                                    </li>
                                    <li>
                                        • Violate any applicable laws or
                                        regulations
                                    </li>
                                    <li>
                                        • Attempt to circumvent our security
                                        measures
                                    </li>
                                    <li>
                                        • Use automated systems to access our
                                        service
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>5. Listings and Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Product Listings
                                </h4>
                                <p className="text-gray-600">
                                    When listing items, you must provide
                                    accurate descriptions, clear photos, and
                                    honest condition assessments. You are
                                    responsible for the accuracy of your
                                    listings.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Transactions
                                </h4>
                                <p className="text-gray-600">
                                    All transactions are between individual
                                    users. re-Soldium is not involved in the
                                    actual sale or purchase of items and is not
                                    responsible for the quality, safety, or
                                    legality of items sold.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Payment and Delivery
                                </h4>
                                <p className="text-gray-600">
                                    Users are responsible for arranging payment
                                    and delivery methods. We recommend using
                                    secure payment methods and meeting in safe,
                                    public locations for in-person transactions.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>6. Intellectual Property</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                The re-Soldium platform, including its design,
                                functionality, and content, is protected by
                                intellectual property laws. You may not copy,
                                modify, or distribute our platform without
                                permission. You retain ownership of content you
                                post, but grant us a license to use it in
                                connection with our service.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                7. Privacy and Data Protection
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Your privacy is important to us. Please review
                                our Privacy Policy to understand how we collect,
                                use, and protect your information. By using our
                                service, you consent to our data practices as
                                described in our Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                8. Disclaimers and Limitations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Service Availability
                                </h4>
                                <p className="text-gray-600">
                                    We strive to provide reliable service, but
                                    we cannot guarantee uninterrupted access.
                                    The service is provided &quot;as is&quot;
                                    without warranties of any kind.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Limitation of Liability
                                </h4>
                                <p className="text-gray-600">
                                    re-Soldium shall not be liable for any
                                    indirect, incidental, special, or
                                    consequential damages arising from your use
                                    of the service or any transactions conducted
                                    through our platform.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>9. Account Termination</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                We reserve the right to suspend or terminate
                                your account if you violate these terms or
                                engage in prohibited activities. You may also
                                terminate your account at any time. Upon
                                termination, your right to use the service will
                                cease immediately.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>10. Dispute Resolution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Any disputes arising from your use of our
                                service will be resolved through binding
                                arbitration in accordance with the rules of the
                                American Arbitration Association. You waive your
                                right to participate in class action lawsuits or
                                class-wide arbitration.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>11. Changes to Terms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                We may modify these terms at any time. We will
                                notify users of significant changes by posting
                                the updated terms on our website. Your continued
                                use of the service after changes constitutes
                                acceptance of the new terms.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>12. Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                If you have questions about these Terms of
                                Service, please contact us:
                            </p>
                            <div className="mt-4 space-y-2">
                                <p className="text-gray-600">
                                    <strong>Email:</strong> legal@re-soldium.com
                                </p>
                                <p className="text-gray-600">
                                    <strong>Address:</strong> re-Soldium Legal
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
