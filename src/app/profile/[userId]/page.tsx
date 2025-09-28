"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/utils/auth";
import { MessageCircle, Phone, MapPin, Calendar, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    location?: string;
    bio?: string;
    website?: string;
    createdAt: string;
}

interface Product {
    _id: string;
    title: string;
    price: number;
    images: string[];
    category: string;
    condition: string;
    location: string;
    views: number;
    createdAt: string;
}

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPhoneNumber, setShowPhoneNumber] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`/api/users/${params.userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserProducts = async () => {
            try {
                const response = await fetch(
                    `/api/users/${params.userId}/products`
                );
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                }
            } catch (error) {
                console.error("Error fetching user products:", error);
            }
        };

        if (params.userId) {
            fetchUserProfile();
            fetchUserProducts();
        }
    }, [params.userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        User Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The user profile you&apos;re looking for doesn&apos;t
                        exist.
                    </p>
                    <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleMessageUser = () => {
        if (!session) {
            toast.error("Please log in to message this user");
            router.push("/login");
            return;
        }

        if (
            session.user &&
            "id" in session.user &&
            session.user.id === user._id
        ) {
            toast.error("You cannot message yourself");
            return;
        }

        // Navigate to messages with this user
        router.push(`/messages?userId=${user._id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-6xl mx-auto p-6">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-blue-600">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900">User Profile</span>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center mb-6">
                                    <Avatar className="w-24 h-24 mx-auto mb-4">
                                        <AvatarImage
                                            src={user.image}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="text-2xl">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {user.name}
                                    </h1>
                                    <p className="text-gray-600 mb-4">
                                        Member since{" "}
                                        {formatDate(new Date(user.createdAt))}
                                    </p>

                                    {user.bio && (
                                        <p className="text-sm text-gray-700 mb-4">
                                            {user.bio}
                                        </p>
                                    )}

                                    <div className="flex space-x-3">
                                        <Button
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                            onClick={handleMessageUser}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Message
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() =>
                                                setShowPhoneNumber(
                                                    !showPhoneNumber
                                                )
                                            }
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            {showPhoneNumber ? "Hide" : "Call"}
                                        </Button>
                                    </div>

                                    {/* Phone Number Display */}
                                    {showPhoneNumber && user.phone && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-600 font-medium">
                                                        Phone Number
                                                    </p>
                                                    <p className="text-lg font-mono text-blue-900">
                                                        {user.phone}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        window.open(
                                                            `tel:${user.phone}`,
                                                            "_self"
                                                        );
                                                    }}
                                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    Call
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Package className="w-4 h-4 mr-2" />
                                        <span>
                                            {products.length} products listed
                                        </span>
                                    </div>
                                    {user.location && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span>{user.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>
                                            Joined{" "}
                                            {formatDate(
                                                new Date(user.createdAt)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {user.website && (
                                    <div className="mt-4 pt-4 border-t">
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Visit Website →
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* User's Products */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Products by {user.name}
                            </h2>
                            <p className="text-gray-600">
                                {products.length}{" "}
                                {products.length === 1 ? "product" : "products"}{" "}
                                listed
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Products Yet
                                    </h3>
                                    <p className="text-gray-600">
                                        This user hasn&apos;t listed any
                                        products yet.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {products.map((product) => (
                                    <Card
                                        key={product._id}
                                        className="overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <Link href={`/product/${product._id}`}>
                                            <div className="relative aspect-[4/3]">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlmYTZiNyI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzUsIDEyNSkiPgogICAgPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSJub25lIiBzdHJva2U9IiM5ZmE2YjciIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiLz4KICAgIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiM5ZmE2YjciLz4KICAgIDxwYXRoIGQ9Im0yMS0yIDUgNSA1LTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlmYTZiNyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8L2c+Cjwvc3ZnPg==";
                                                    }}
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <Badge
                                                        variant={
                                                            product.condition ===
                                                            "new"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {product.condition}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {product.title}
                                                </h3>
                                                <p className="text-lg font-bold text-green-600 mb-2">
                                                    ₹
                                                    {product.price.toLocaleString()}
                                                </p>
                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {product.location}
                                                    </span>
                                                    <span>
                                                        {product.views} views
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
