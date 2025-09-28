"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { formatPrice, formatDate } from "@/utils/auth";
import {
    Eye,
    MapPin,
    Edit,
    Trash2,
    Plus,
    MoreVertical,
    Pause,
    Play,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function MyAdsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Redirect if not logged in (only after auth is loaded)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [session, status, router]);

    const fetchUserProducts = useCallback(
        async (isRefresh = false) => {
            // Only fetch if user is authenticated
            if (status !== "authenticated" || !session?.user) {
                return;
            }

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                const response = await fetch("/api/products/my-ads", {
                    cache: "no-store", // Ensure fresh data
                });

                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                    setLastUpdated(new Date());
                    if (isRefresh) {
                        toast.success("Listings refreshed!");
                    }
                } else {
                    console.error("Failed to fetch products:", response.status);
                    setProducts([]);
                    if (isRefresh) {
                        toast.error("Failed to refresh listings");
                    }
                }
            } catch (error) {
                console.error("Error fetching user products:", error);
                setProducts([]);
                if (isRefresh) {
                    toast.error("Failed to refresh listings");
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [status, session?.user]
    );

    useEffect(() => {
        fetchUserProducts();
    }, [session, status, fetchUserProducts]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const interval = setInterval(() => {
                fetchUserProducts(true);
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [session, status, fetchUserProducts]);

    const handleToggleActive = async (productId: string) => {
        try {
            const product = products.find((p) => p._id === productId);
            if (!product) return;

            const response = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isActive: !product.isActive,
                }),
            });

            if (response.ok) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p._id === productId
                            ? { ...p, isActive: !p.isActive }
                            : p
                    )
                );
                toast.success("Listing status updated!");
                // Refresh data to get latest from server
                fetchUserProducts(true);
            } else {
                const data = await response.json();
                if (response.status === 401) {
                    toast.error("Please log in to update listing");
                } else {
                    toast.error(data.error || "Failed to update listing");
                }
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update listing");
        }
    };

    const handleDelete = async (productId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this listing? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setProducts((prev) =>
                    prev.filter((product) => product._id !== productId)
                );
                toast.success("Listing deleted successfully!");
                // Refresh data to get latest from server
                fetchUserProducts(true);
            } else {
                const data = await response.json();
                if (response.status === 401) {
                    toast.error("Please log in to delete listing");
                } else {
                    toast.error(data.error || "Failed to delete listing");
                }
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete listing");
        }
    };

    const handleEdit = (productId: string) => {
        // Navigate to edit page with the product ID
        router.push(`/sell?edit=${productId}`);
    };

    // Show loading while auth is being checked
    if (status === "loading") {
        return (
            <div className="bg-gray-50 flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading or redirect if not authenticated
    if (status === "unauthenticated") {
        return (
            <div className="bg-gray-50 flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-50">
                <Header />
                <div className="flex items-center justify-center py-12 px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <span className="text-gray-600 text-sm lg:text-base">
                            Loading your ads...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const activeAds = products.filter((p) => p.isActive);
    const inactiveAds = products.filter((p) => !p.isActive);

    return (
        <div className="bg-gray-50">
            <Header />

            <div className="max-w-6xl mx-auto p-4 lg:p-6">
                {/* Header Section - Mobile Responsive */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
                    <div className="flex-1">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            My Listings
                        </h1>
                        <p className="text-sm lg:text-base text-gray-600">
                            Manage your active and inactive listings
                            {lastUpdated && (
                                <span className="block text-xs text-gray-500 mt-1">
                                    Last updated:{" "}
                                    {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Action Buttons - Mobile Stacked */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => fetchUserProducts(true)}
                            disabled={refreshing}
                            className="flex items-center justify-center w-full sm:w-auto"
                            size="sm"
                        >
                            <RefreshCw
                                className={`w-4 h-4 mr-2 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />
                            <span className="hidden sm:inline">
                                {refreshing ? "Refreshing..." : "Refresh"}
                            </span>
                        </Button>
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                            size="sm"
                        >
                            <Link
                                href="/sell"
                                className="flex items-center justify-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">
                                    Create New Listing
                                </span>
                                <span className="sm:hidden">New Listing</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats - Mobile Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 lg:p-6 text-center">
                            <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
                                {products.length}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-600">
                                Total Listings
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 lg:p-6 text-center">
                            <div className="text-xl lg:text-2xl font-bold text-green-600 mb-1 lg:mb-2">
                                {activeAds.length}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-600">
                                Active
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 lg:p-6 text-center">
                            <div className="text-xl lg:text-2xl font-bold text-gray-600 mb-1 lg:mb-2">
                                {inactiveAds.length}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-600">
                                Inactive
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 lg:p-6 text-center">
                            <div className="text-xl lg:text-2xl font-bold text-blue-600 mb-1 lg:mb-2">
                                {products.reduce((sum, p) => sum + p.views, 0)}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-600">
                                Total Views
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {products.length === 0 ? (
                    <Card className="shadow-sm">
                        <CardContent className="p-8 lg:p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Plus className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-4" />
                                <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">
                                    No listings yet
                                </h3>
                                <p className="text-sm lg:text-base text-gray-600 mb-6 max-w-md mx-auto">
                                    Start selling by creating your first
                                    listing.
                                </p>
                            </div>
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                                size="lg"
                            >
                                <Link
                                    href="/sell"
                                    className="flex items-center justify-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Listing
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6 lg:space-y-8">
                        {/* Active Listings */}
                        {activeAds.length > 0 && (
                            <div>
                                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
                                    Active Listings ({activeAds.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                    {activeAds.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            onToggleActive={handleToggleActive}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inactive Listings */}
                        {inactiveAds.length > 0 && (
                            <div>
                                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">
                                    Inactive Listings ({inactiveAds.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                                    {inactiveAds.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            onToggleActive={handleToggleActive}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProductCardProps {
    product: Product;
    onToggleActive: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

function ProductCard({
    product,
    onToggleActive,
    onDelete,
    onEdit,
}: ProductCardProps) {
    return (
        <Card
            className={`overflow-hidden hover:shadow-lg transition-all duration-200 ${
                !product.isActive ? "opacity-75" : ""
            }`}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzlmYTZiNyI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzUsIDEyNSkiPgogICAgPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSJub25lIiBzdHJva2U9IiM5ZmE2YjciIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiLz4KICAgIDxjaXJjbGUgY3g9IjE1IiBjeT0iMTUiIHI9IjMiIGZpbGw9IiM5ZmE2YjciLz4KICAgIDxwYXRoIGQ9Im0yMS0yIDUgNSA1LTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzlmYTZiNyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8L2c+Cjwvc3ZnPg==";
                    }}
                />

                {!product.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge
                            variant="secondary"
                            className="bg-white text-gray-900 text-xs"
                        >
                            Inactive
                        </Badge>
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-white/90 hover:bg-white p-1.5 lg:p-2 rounded-full shadow-sm"
                            >
                                <MoreVertical className="w-3 h-3 lg:w-4 lg:h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/product/${product._id}`}
                                    className="flex items-center"
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Listing
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onEdit(product._id)}
                                className="flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onToggleActive(product._id)}
                                className="flex items-center"
                            >
                                {product.isActive ? (
                                    <>
                                        <Pause className="w-4 h-4 mr-2" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(product._id)}
                                className="text-red-600 focus:text-red-600 flex items-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <CardContent className="p-3 lg:p-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-base lg:text-lg line-clamp-2 text-gray-900">
                        {product.title}
                    </h3>

                    <p className="text-xl lg:text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                    </p>

                    <div className="flex items-center justify-between text-xs lg:text-sm text-gray-500">
                        <div className="flex items-center min-w-0 flex-1">
                            <MapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{product.location}</span>
                        </div>

                        <div className="flex items-center ml-2">
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                            <span>{product.views}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                            {product.category}
                        </Badge>

                        <span className="text-xs text-gray-500">
                            {formatDate(product.createdAt)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
