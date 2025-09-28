"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {} = useAuthStore();
    const router = useRouter();
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Invalid email or password");
            } else if (result?.ok) {
                toast.success("Login successful!");
                router.push("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await signIn("google", {
                callbackUrl: "/",
            });
        } catch (error) {
            console.error("Google sign-in error:", error);
            toast.error("Google sign-in failed. Please try again.");
            setGoogleLoading(false);
        }
    };

    const handleTestUserClick = (email: string, password: string) => {
        setFormData({
            email,
            password,
        });
        toast.success("Test credentials filled! Click 'Sign In' to login.");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-fade-in-up">
                <CardHeader className="text-center animate-fade-in animate-delay-200">
                    <div className="flex items-center justify-center mb-4 animate-bounce-in">
                        <div className="bg-blue-600 text-white p-3 rounded-lg font-bold text-2xl">
                            rS
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold animate-fade-in-up animate-delay-300">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="animate-fade-in-up animate-delay-400">
                        Sign in to your re-Soldium account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="animate-fade-in-up animate-delay-500">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="transition-all duration-200 focus:scale-105"
                            />
                        </div>

                        <div className="relative animate-fade-in-up animate-delay-600">
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="pr-10 transition-all duration-200 focus:scale-105"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 animate-fade-in-up animate-delay-700 hover-scale"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center animate-fade-in-up animate-delay-800">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="text-blue-600 hover:underline font-medium hover-scale"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4 animate-fade-in-up animate-delay-900 hover-scale"
                            disabled={isLoading || googleLoading}
                            onClick={handleGoogleSignIn}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {googleLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in with Google...
                                </>
                            ) : (
                                "Continue with Google"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Test User Credentials for Recruiters */}
            <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-fade-in-up">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    🧪 Test Accounts for Recruiters
                </h3>
                <div className="space-y-2 text-xs">
                    <div
                        className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 hover-scale"
                        onClick={() =>
                            handleTestUserClick(
                                "rajesh@example.com",
                                "password123"
                            )
                        }
                    >
                        <p className="font-medium text-gray-700">
                            Email: rajesh@example.com
                        </p>
                        <p className="text-gray-600">Password: password123</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Click to auto-fill credentials
                </p>
            </div>
        </div>
    );
}
