export interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: "new" | "used" | "refurbished";
    images: string[];
    location: string;
    seller: User;
    isActive: boolean;
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    image?: string;
}

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    location?: string;
    search?: string;
}

export const CATEGORIES = [
    "Electronics",
    "Vehicles",
    "Property",
    "Home & Garden",
    "Fashion",
    "Sports",
    "Books",
    "Pets",
    "Jobs",
    "Services",
] as const;

export type Category = (typeof CATEGORIES)[number];
