"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ChatModal from "@/components/ChatModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Product } from "@/types";
import { formatPrice, formatDate } from "@/utils/auth";
import {
    Heart,
    MapPin,
    Eye,
    Share2,
    Flag,
    Phone,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [product, setProduct] = useState<Product | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showPhoneNumber, setShowPhoneNumber] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const productData = data.product;

                    // Ensure dates are Date objects
                    if (
                        productData.createdAt &&
                        typeof productData.createdAt === "string"
                    ) {
                        productData.createdAt = new Date(productData.createdAt);
                    }
                    if (
                        productData.updatedAt &&
                        typeof productData.updatedAt === "string"
                    ) {
                        productData.updatedAt = new Date(productData.updatedAt);
                    }
                    if (
                        productData.seller?.createdAt &&
                        typeof productData.seller.createdAt === "string"
                    ) {
                        productData.seller.createdAt = new Date(
                            productData.seller.createdAt
                        );
                    }
                    if (
                        productData.seller?.updatedAt &&
                        typeof productData.seller.updatedAt === "string"
                    ) {
                        productData.seller.updatedAt = new Date(
                            productData.seller.updatedAt
                        );
                    }

                    setProduct(productData);
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

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

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Product Not Found
                    </h1>
                    <p className="text-gray-600 mb-6">
                        The product you&apos;re looking for doesn&apos;t exist
                        or has been removed.
                    </p>
                    <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.title,
                    text: product.description.slice(0, 100) + "...",
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const handleMessageSeller = () => {
        if (status === "unauthenticated") {
            toast.error("Please log in to message the seller");
            router.push("/login");
            return;
        }

        if (
            session?.user &&
            "id" in session.user &&
            session.user.id === product?.seller._id
        ) {
            toast.error("You cannot message yourself");
            return;
        }

        setIsChatOpen(true);
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
                        <Link
                            href={`/?category=${product.category}`}
                            className="hover:text-blue-600"
                        >
                            {product.category}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 truncate">
                            {product.title}
                        </span>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Images */}
                    <div className="lg:col-span-2">
                        <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                                src={product.images[currentImageIndex]}
                                alt={product.title}
                                fill
                                className="object-cover"
                                priority
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlmYTZiNyI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzUsIDEyNSkiPgogICAgPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSJub25lIiBzdHJva2U9IiM5ZmE2YjciIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiLz4KICAgIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiM5ZmE2YjciLz4KICAgIDxwYXRoIGQ9Im0yMS0yIDUgNSA1LTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlmYTZiNyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8L2c+Cjwvc3ZnPg==";
                                }}
                            />

                            {product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Image indicators */}
                            {product.images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                    {product.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                setCurrentImageIndex(index)
                                            }
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                index === currentImageIndex
                                                    ? "bg-white"
                                                    : "bg-white/50"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail images */}
                        {product.images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            setCurrentImageIndex(index)
                                        }
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                                            index === currentImageIndex
                                                ? "border-blue-600"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${product.title} ${
                                                index + 1
                                            }`}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target =
                                                    e.target as HTMLImageElement;
                                                target.src =
                                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjUsIDI1KSI+CiAgICA8cmVjdCB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlmYTZiNyIgc3Ryb2tlLXdpZHRoPSIyIiByeD0iMiIvPgogICAgPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzlmYTZiNyIvPgogICAgPHBhdGggZD0ibTE1LTE1IDggOCA4LTgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlmYTZiNyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8L2c+Cjwvc3ZnPg==";
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            {product.title}
                                        </h1>
                                        <p className="text-3xl font-bold text-green-600 mb-4">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsLiked(!isLiked)}
                                            className={`p-2 ${
                                                isLiked
                                                    ? "text-red-600 hover:text-red-700"
                                                    : "text-gray-600 hover:text-red-600"
                                            }`}
                                        >
                                            <Heart
                                                className={`w-5 h-5 ${
                                                    isLiked
                                                        ? "fill-current"
                                                        : ""
                                                }`}
                                            />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleShare}
                                            className="p-2 text-gray-600 hover:text-blue-600"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {product.location}
                                    </div>
                                    <div className="flex items-center">
                                        <Eye className="w-4 h-4 mr-1" />
                                        {product.views} views
                                    </div>
                                    <Badge
                                        variant={
                                            product.condition === "new"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="capitalize"
                                    >
                                        {product.condition}
                                    </Badge>
                                </div>

                                <div className="flex space-x-3 mb-6">
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={handleMessageSeller}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Message Seller
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() =>
                                            setShowPhoneNumber(!showPhoneNumber)
                                        }
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        {showPhoneNumber
                                            ? "Hide Number"
                                            : "Call"}
                                    </Button>
                                </div>

                                {/* Phone Number Display */}
                                {showPhoneNumber && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">
                                                    Seller&apos;s Phone Number
                                                </p>
                                                <p className="text-lg font-mono text-blue-900">
                                                    {product?.seller?.phone ||
                                                        "+1 (555) 123-4567"}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const phoneNumber =
                                                        product?.seller
                                                            ?.phone ||
                                                        "+15551234567";
                                                    window.open(
                                                        `tel:${phoneNumber}`,
                                                        "_self"
                                                    );
                                                }}
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                <Phone className="w-4 h-4 mr-1" />
                                                Call Now
                                            </Button>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2">
                                            💡 Tap &quot;Call Now&quot; to dial
                                            directly
                                        </p>
                                    </div>
                                )}

                                {/* Seller Info */}
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Seller Information
                                    </h3>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage
                                                src={product.seller.image}
                                                alt={product.seller.name}
                                            />
                                            <AvatarFallback>
                                                {product.seller.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {product.seller.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Member since{" "}
                                                {formatDate(
                                                    product.seller.createdAt
                                                )}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Safety Tips */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Safety Tips
                                </h3>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li>• Meet in a public place</li>
                                    <li>• Check the item before paying</li>
                                    <li>• Don&apos;t pay in advance</li>
                                    <li>• Trust your instincts</li>
                                </ul>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-3 text-red-600 hover:text-red-700"
                                >
                                    <Flag className="w-4 h-4 mr-2" />
                                    Report this listing
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Description */}
                <Card className="mt-8">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Description
                        </h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>
                                    Listed on {formatDate(product.createdAt)}
                                </span>
                                <span>Product ID: {product._id}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chat Modal */}
            {product && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    product={{
                        _id: product._id,
                        title: product.title,
                        price: product.price,
                        images: product.images,
                        location: product.location,
                        views: product.views,
                        createdAt: product.createdAt.toISOString(),
                    }}
                    seller={{
                        _id: product.seller._id,
                        name: product.seller.name,
                        email: product.seller.email,
                        image: product.seller.image,
                        createdAt: product.seller.createdAt.toISOString(),
                    }}
                />
            )}
        </div>
    );
}
