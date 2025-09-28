"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

function SellPageContent() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "used",
        location: "",
    });

    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Redirect if not logged in (only after auth is loaded)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch product data for editing
    useEffect(() => {
        const fetchProductForEdit = async () => {
            if (editId && status === "authenticated") {
                setIsEditMode(true);
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/products/${editId}`);
                    if (response.ok) {
                        const data = await response.json();
                        const product = data.product;

                        setFormData({
                            title: product.title || "",
                            description: product.description || "",
                            price: product.price?.toString() || "",
                            category: product.category || "",
                            condition: product.condition || "used",
                            location: product.location || "",
                        });

                        setImages(product.images || []);
                    } else {
                        toast.error("Failed to load product for editing");
                        router.push("/my-ads");
                    }
                } catch (error) {
                    console.error("Error fetching product:", error);
                    toast.error("Failed to load product for editing");
                    router.push("/my-ads");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchProductForEdit();
    }, [editId, status, router]);

    // Show loading while auth is being checked
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Show loading when fetching product for editing
    if (editId && isLoading && isEditMode) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Loading product for editing...
                    </p>
                </div>
            </div>
        );
    }

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (files) {
            setIsLoading(true);
            try {
                const uploadPromises = Array.from(files).map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || "Upload failed");
                    }

                    return data.url;
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5)); // Max 5 images
                toast.success(
                    `${uploadedUrls.length} image(s) uploaded successfully!`
                );
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload images. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (
            !formData.title ||
            !formData.description ||
            !formData.price ||
            !formData.category ||
            !formData.location
        ) {
            toast.error("Please fill in all required fields");
            setIsLoading(false);
            return;
        }

        if (images.length === 0) {
            toast.error("Please add at least one image");
            setIsLoading(false);
            return;
        }

        try {
            const productData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                condition: formData.condition,
                images: images,
                location: formData.location,
            };

            let response;
            if (isEditMode && editId) {
                // Update existing product
                response = await fetch(`/api/products/${editId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(productData),
                });
            } else {
                // Create new product
                response = await fetch("/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(productData),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        (isEditMode
                            ? "Failed to update product"
                            : "Failed to create product")
                );
            }

            toast.success(
                isEditMode
                    ? "Product updated successfully!"
                    : "Product listed successfully!"
            );
            router.push("/my-ads");
        } catch (error) {
            console.error("Error submitting product:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : isEditMode
                    ? "Failed to update product. Please try again."
                    : "Failed to create product. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditMode ? "Edit Your Listing" : "Sell Your Item"}
                    </h1>
                    <p className="text-gray-600">
                        {isEditMode
                            ? "Update your listing details on re-Soldium"
                            : "Create a listing to sell your item on re-Soldium"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title *
                                        </label>
                                        <Input
                                            name="title"
                                            placeholder="e.g., iPhone 13 Pro Max 256GB"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            maxLength={100}
                                            disabled={isLoading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.title.length}/100
                                            characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe your item in detail..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            maxLength={1000}
                                            disabled={isLoading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.description.length}/1000
                                            characters
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Price ($) *
                                            </label>
                                            <Input
                                                name="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location *
                                            </label>
                                            <Input
                                                name="location"
                                                placeholder="e.g., New York, NY"
                                                value={formData.location}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                            >
                                                <option value="">
                                                    Select a category
                                                </option>
                                                {CATEGORIES.map((category) => (
                                                    <option
                                                        key={category}
                                                        value={category}
                                                    >
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Condition *
                                            </label>
                                            <select
                                                name="condition"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                value={formData.condition}
                                                onChange={handleChange}
                                                required
                                                disabled={isLoading}
                                            >
                                                <option value="new">New</option>
                                                <option value="used">
                                                    Used
                                                </option>
                                                <option value="refurbished">
                                                    Refurbished
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Photos</CardTitle>
                                    <p className="text-sm text-gray-600">
                                        Add up to 5 photos of your item
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Image Upload */}
                                        {images.length < 5 && (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="image-upload"
                                                    disabled={isLoading}
                                                />
                                                <label
                                                    htmlFor="image-upload"
                                                    className="cursor-pointer flex flex-col items-center"
                                                >
                                                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-600">
                                                        Click to upload photos
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        PNG, JPG up to 10MB each
                                                    </span>
                                                </label>
                                            </div>
                                        )}

                                        {/* Image Preview */}
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {images.map((image, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <Image
                                                            src={image}
                                                            alt={`Product ${
                                                                index + 1
                                                            }`}
                                                            width={96}
                                                            height={96}
                                                            className="w-full h-24 object-cover rounded-lg border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeImage(
                                                                    index
                                                                )
                                                            }
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            disabled={isLoading}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                        {index === 0 && (
                                                            <Badge className="absolute bottom-1 left-1 text-xs">
                                                                Main
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Listing Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                        {images[0] ? (
                                            <Image
                                                src={images[0]}
                                                alt="Main product"
                                                width={400}
                                                height={400}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm">
                                                No image
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {formData.title || "Product Title"}
                                        </h3>
                                        <p className="text-2xl font-bold text-green-600 flex items-center">
                                            ₹{formData.price || "0.00"}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2 ">
                                            {formData.description ||
                                                "Product description..."}
                                        </p>
                                        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                            <span>
                                                {formData.location ||
                                                    "Location"}
                                            </span>
                                            <Badge variant="outline">
                                                {formData.condition ||
                                                    "condition"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {isEditMode
                                                    ? "Updating..."
                                                    : "Publishing..."}
                                            </>
                                        ) : isEditMode ? (
                                            "Update Listing"
                                        ) : (
                                            "Publish Listing"
                                        )}
                                    </Button>

                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        By publishing, you agree to our terms
                                        and conditions
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SellPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SellPageContent />
        </Suspense>
    );
}
