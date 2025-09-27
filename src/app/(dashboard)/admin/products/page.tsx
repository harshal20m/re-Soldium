"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";
import {
    Package,
    Search,
    Eye,
    Trash2,
    User,
    Calendar,
    MapPin,
} from "lucide-react";

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    location: string;
    status?: string;
    isActive?: boolean;
    views: number;
    images: string[];
    createdAt: string;
    seller: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function AdminProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/products");
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
            } else {
                toast.error("Failed to fetch products");
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAdminAccess = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/check-access");
            if (!response.ok) {
                if (response.status === 403) {
                    toast.error("Access denied. Admin privileges required.");
                    router.push("/");
                } else {
                    toast.error("Failed to verify admin access");
                }
                return;
            }
            fetchProducts();
        } catch (error) {
            console.error("Error checking admin access:", error);
            toast.error("Failed to verify admin access");
        }
    }, [router, fetchProducts]);

    // Check admin access and fetch products
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            checkAdminAccess();
        }
    }, [status, session, checkAdminAccess]);

    const updateProductStatus = async (
        productId: string,
        newStatus: string
    ) => {
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast.success("Product status updated successfully");
                fetchProducts(); // Refresh the list
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to update product status");
            }
        } catch (error) {
            console.error("Error updating product status:", error);
            toast.error("Failed to update product status");
        }
    };

    const deleteProduct = async (productId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this product? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Product deleted successfully");
                fetchProducts(); // Refresh the list
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "sold":
                return "bg-blue-100 text-blue-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getConditionBadgeColor = (condition: string) => {
        switch (condition) {
            case "new":
                return "bg-green-100 text-green-800";
            case "like_new":
                return "bg-blue-100 text-blue-800";
            case "good":
                return "bg-yellow-100 text-yellow-800";
            case "fair":
                return "bg-orange-100 text-orange-800";
            case "poor":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Helper function to get effective status
    const getEffectiveStatus = (product: Product) => {
        if (product.status) {
            return product.status;
        }
        // Fallback to isActive for backward compatibility
        return product.isActive ? "active" : "sold";
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            product.seller.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
        const effectiveStatus = getEffectiveStatus(product);
        const matchesStatus =
            selectedStatus === "all" || effectiveStatus === selectedStatus;
        const matchesCategory =
            selectedCategory === "all" || product.category === selectedCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: "Admin", href: "/admin" },
                        { label: "Products" },
                    ]}
                />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Product Management
                    </h1>
                    <p className="text-gray-600">
                        Manage all products, approve listings, and monitor
                        activity
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search products by title, description, or seller..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="sold">Sold</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="electronics">
                                        Electronics
                                    </option>
                                    <option value="vehicles">Vehicles</option>
                                    <option value="furniture">Furniture</option>
                                    <option value="clothing">Clothing</option>
                                    <option value="books">Books</option>
                                    <option value="sports">Sports</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Products ({filteredProducts.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product._id}
                                    className="border rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                                                {product.images.length > 0 ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 mb-1">
                                                    {product.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                    {product.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        ₹
                                                        {product.price.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {product.seller.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {product.location}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            product.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {product.views} views
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="flex gap-2">
                                                <Badge
                                                    className={getStatusBadgeColor(
                                                        getEffectiveStatus(
                                                            product
                                                        )
                                                    )}
                                                >
                                                    {getEffectiveStatus(
                                                        product
                                                    )}
                                                </Badge>
                                                <Badge
                                                    className={getConditionBadgeColor(
                                                        product.condition
                                                    )}
                                                >
                                                    {product.condition.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={getEffectiveStatus(
                                                        product
                                                    )}
                                                    onChange={(e) =>
                                                        updateProductStatus(
                                                            product._id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                >
                                                    <option value="pending">
                                                        Pending
                                                    </option>
                                                    <option value="active">
                                                        Active
                                                    </option>
                                                    <option value="sold">
                                                        Sold
                                                    </option>
                                                    <option value="rejected">
                                                        Rejected
                                                    </option>
                                                </select>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/product/${product._id}`
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        deleteProduct(
                                                            product._id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">
                                    No products found
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
