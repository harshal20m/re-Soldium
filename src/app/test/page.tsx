"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
    const [testResults, setTestResults] = useState<string[]>([]);

    const addResult = (result: string) => {
        setTestResults((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()}: ${result}`,
        ]);
    };

    const testImageUpload = async () => {
        try {
            // Create a test file
            const canvas = document.createElement("canvas");
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(0, 0, 100, 100);
                ctx.fillStyle = "#ffffff";
                ctx.font = "12px Arial";
                ctx.fillText("TEST", 30, 50);
            }

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], "test.png", {
                    type: "image/png",
                });
                const formData = new FormData();
                formData.append("file", file);

                const token = localStorage.getItem("token");
                if (!token) {
                    addResult("❌ No auth token found");
                    return;
                }

                const response = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    addResult(
                        `✅ Upload successful: ${data.url.substring(0, 50)}...`
                    );
                } else {
                    addResult(`❌ Upload failed: ${data.error}`);
                }
            });
        } catch (error) {
            addResult(`❌ Upload error: ${error}`);
        }
    };

    const testProductAPI = async () => {
        try {
            const response = await fetch("/api/products");
            const data = await response.json();

            if (response.ok) {
                addResult(
                    `✅ Products API working: ${
                        data.products?.length || 0
                    } products`
                );
            } else {
                addResult(`❌ Products API failed: ${data.error}`);
            }
        } catch (error) {
            addResult(`❌ Products API error: ${error}`);
        }
    };

    const testMyAdsAPI = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                addResult("❌ No auth token for My Ads test");
                return;
            }

            const response = await fetch("/api/products/my-ads", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (response.ok) {
                addResult(
                    `✅ My Ads API working: ${
                        data.products?.length || 0
                    } user products`
                );
            } else {
                addResult(`❌ My Ads API failed: ${data.error}`);
            }
        } catch (error) {
            addResult(`❌ My Ads API error: ${error}`);
        }
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test APIs</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={testImageUpload}
                                className="w-full"
                            >
                                Test Image Upload
                            </Button>
                            <Button onClick={testProductAPI} className="w-full">
                                Test Products API
                            </Button>
                            <Button onClick={testMyAdsAPI} className="w-full">
                                Test My Ads API
                            </Button>
                            <Button
                                onClick={clearResults}
                                variant="outline"
                                className="w-full"
                            >
                                Clear Results
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Test Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {testResults.length === 0 ? (
                                    <p className="text-gray-500">
                                        No tests run yet
                                    </p>
                                ) : (
                                    testResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className="text-sm font-mono"
                                        >
                                            {result}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Environment Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                MongoDB:{" "}
                                {process.env.NEXT_PUBLIC_MONGODB_URI
                                    ? "✅ Configured"
                                    : "❌ Not configured"}
                            </div>
                            <div>
                                Cloudinary:{" "}
                                {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                                    ? "✅ Configured"
                                    : "❌ Not configured"}
                            </div>
                            <div>
                                Google OAuth:{" "}
                                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                                    ? "✅ Configured"
                                    : "❌ Not configured"}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
