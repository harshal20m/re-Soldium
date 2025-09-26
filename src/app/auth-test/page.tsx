"use client";

import { useAuthStore } from "@/store/authStore";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AuthTestPage() {
    const { user, isLoading } = useAuthStore();
    const { data: session, status } = useSession();
    const [localStorageData, setLocalStorageData] = useState<{
        token: string | null;
        user: string | null;
    }>({ token: null, user: null });

    useEffect(() => {
        if (typeof window !== "undefined") {
            setLocalStorageData({
                token: localStorage.getItem("token"),
                user: localStorage.getItem("user"),
            });
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">
                    Authentication Test Page
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Auth Store */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            Auth Store (Zustand)
                        </h2>
                        <div className="space-y-2">
                            <p>
                                <strong>Loading:</strong>{" "}
                                {isLoading ? "true" : "false"}
                            </p>
                            <p>
                                <strong>User:</strong>{" "}
                                {user ? user.name : "null"}
                            </p>
                            <p>
                                <strong>User ID:</strong> {user?._id || "null"}
                            </p>
                            <p>
                                <strong>Email:</strong> {user?.email || "null"}
                            </p>
                        </div>
                    </div>

                    {/* NextAuth Session */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            NextAuth Session
                        </h2>
                        <div className="space-y-2">
                            <p>
                                <strong>Status:</strong> {status}
                            </p>
                            <p>
                                <strong>User:</strong>{" "}
                                {session?.user?.name || "null"}
                            </p>
                            <p>
                                <strong>User ID:</strong>{" "}
                                {session?.user?.id || "null"}
                            </p>
                            <p>
                                <strong>Email:</strong>{" "}
                                {session?.user?.email || "null"}
                            </p>
                            <p>
                                <strong>JWT Token:</strong>{" "}
                                {(session as any)?.jwtToken ? "exists" : "null"}
                            </p>
                        </div>
                    </div>

                    {/* LocalStorage */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            LocalStorage
                        </h2>
                        <div className="space-y-2">
                            <p>
                                <strong>Token:</strong>{" "}
                                {localStorageData.token ? "exists" : "null"}
                            </p>
                            <p>
                                <strong>User:</strong>{" "}
                                {localStorageData.user ? "exists" : "null"}
                            </p>
                            {localStorageData.user && (
                                <div className="mt-4">
                                    <p>
                                        <strong>Stored User Data:</strong>
                                    </p>
                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                                        {JSON.stringify(
                                            JSON.parse(localStorageData.user),
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Actions</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        setLocalStorageData({
                                            token: localStorage.getItem(
                                                "token"
                                            ),
                                            user: localStorage.getItem("user"),
                                        });
                                    }
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Refresh LocalStorage
                            </button>
                            <button
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        localStorage.clear();
                                        setLocalStorageData({
                                            token: null,
                                            user: null,
                                        });
                                        window.location.reload();
                                    }
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Clear LocalStorage & Reload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
