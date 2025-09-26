"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import CategorySidebar from "@/components/CategorySidebar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/store/productStore";
import { Product } from "@/types";
import { Loader2, Plus, Package } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
    const { products, setProducts, isLoading, setLoading, filters } =
        useProductStore();
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [favoriteProductIds, setFavoriteProductIds] = useState<Set<string>>(
        new Set()
    );
    const { data: session } = useSession();

    // Fetch user's favorites
    const fetchFavorites = async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch("/api/favorites");
            if (response.ok) {
                const data = await response.json();

                // The API returns { favorites: products[] } where products are Product objects directly
                const favoriteIds = new Set<string>(
                    data.favorites
                        .filter((product: any) => product && product._id) // Filter out invalid entries
                        .map((product: any) => product._id)
                );
                setFavoriteProductIds(favoriteIds);
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    // Handle favorite toggle
    const handleFavoriteToggle = (productId: string, isFavorited: boolean) => {
        setFavoriteProductIds((prev) => {
            const newSet = new Set(prev);
            if (isFavorited) {
                newSet.add(productId);
            } else {
                newSet.delete(productId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/products");
                const data = await response.json();

                if (response.ok) {
                    setProducts(data.products || []);
                } else {
                    console.error("Failed to fetch products:", data.error);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [setProducts, setLoading]);

    // Fetch favorites when session changes
    useEffect(() => {
        fetchFavorites();
    }, [session?.user?.id]);

    useEffect(() => {
        let filtered = products;

        if (filters.category) {
            filtered = filtered.filter((p) => p.category === filters.category);
        }

        if (filters.minPrice !== undefined) {
            filtered = filtered.filter((p) => p.price >= filters.minPrice!);
        }

        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
        }

        if (filters.condition) {
            filtered = filtered.filter(
                (p) => p.condition === filters.condition
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.title.toLowerCase().includes(searchTerm) ||
                    p.description.toLowerCase().includes(searchTerm) ||
                    p.category.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredProducts(filtered);
    }, [products, filters]);

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100">
            <Header />

            <div className="flex flex-col lg:flex-row">
                <CategorySidebar />

                <main className="flex-1 p-4 lg:p-6">
                    {/* Hero Section */}
                    <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 lg:p-12 mb-8 text-white overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

                        <div className="relative max-w-4xl">
                            <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                                Find Everything You Need on{" "}
                                <span className="text-yellow-300">
                                    re-Soldium
                                </span>
                            </h1>
                            <p className="text-lg lg:text-xl mb-6 lg:mb-8 opacity-90 max-w-2xl">
                                Buy and sell with confidence. From electronics
                                to vehicles, discover great deals in your area
                                with our secure marketplace.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    asChild
                                    size="lg"
                                    variant="secondary"
                                    className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                                >
                                    <Link href="/sell">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Start Selling
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="text-white border-white hover:bg-white hover:text-blue-600 shadow-lg"
                                >
                                    <Link href="/browse">
                                        Browse Categories
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                {filters.category
                                    ? `${filters.category} Products`
                                    : "Latest Products"}
                            </h2>
                            <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                {filteredProducts.length} products found
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                                <span className="text-gray-600">
                                    Loading products...
                                </span>
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                            <div className="text-gray-400 mb-4">
                                <Package className="h-16 w-16 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Try adjusting your filters or check back
                                    later for new listings.
                                </p>
                            </div>
                            <Button
                                asChild
                                className="mt-4 bg-blue-600 hover:bg-blue-700"
                            >
                                <Link href="/sell">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Post Your First Ad
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    isFavorited={favoriteProductIds.has(
                                        product._id
                                    )}
                                    onFavoriteToggle={handleFavoriteToggle}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
