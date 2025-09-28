"use client";

import { useState } from "react";
import { CATEGORIES } from "@/types";
import { useProductStore } from "@/store/productStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Smartphone,
    Car,
    Home,
    Trees,
    Shirt,
    Trophy,
    BookOpen,
    Heart,
    Briefcase,
    Wrench,
    Grid3X3,
    Filter,
    X,
} from "lucide-react";

const categoryIcons = {
    Electronics: Smartphone,
    Vehicles: Car,
    Property: Home,
    "Home & Garden": Trees,
    Fashion: Shirt,
    Sports: Trophy,
    Books: BookOpen,
    Pets: Heart,
    Jobs: Briefcase,
    Services: Wrench,
};

export default function CategorySidebar() {
    const { filters, setFilters } = useProductStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleCategorySelect = (category: string) => {
        const currentCategories = Array.isArray(filters.category)
            ? filters.category
            : filters.category
            ? [filters.category]
            : [];

        let newCategories: string[];
        if (currentCategories.includes(category)) {
            // Remove category if already selected
            newCategories = currentCategories.filter((c) => c !== category);
        } else {
            // Add category if not selected
            newCategories = [...currentCategories, category];
        }

        const newFilters = { ...filters };
        if (newCategories.length === 0) {
            delete newFilters.category;
        } else {
            newFilters.category =
                newCategories.length === 1 ? newCategories[0] : newCategories;
        }
        setFilters(newFilters);
        // Close mobile sidebar after selection
        setIsMobileOpen(false);
    };

    const clearFilters = () => {
        setFilters({});
    };

    // Helper function to count active filters
    const getActiveFilterCount = () => {
        let count = 0;

        // Count categories (handle both string and array)
        if (filters.category) {
            if (Array.isArray(filters.category)) {
                count += filters.category.length;
            } else {
                count += 1;
            }
        }

        // Count conditions (handle both string and array)
        if (filters.condition) {
            if (Array.isArray(filters.condition)) {
                count += filters.condition.length;
            } else {
                count += 1;
            }
        }

        // Count price filters
        if (filters.minPrice !== undefined) count += 1;
        if (filters.maxPrice !== undefined) count += 1;

        // Count other filters
        if (filters.location) count += 1;
        if (filters.search) count += 1;

        return count;
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed top-24 left-4 z-50 animate-fade-in-left">
                <Button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="bg-white border-2 border-blue-400 text-black hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 relative overflow-hidden neon-glow hover-scale"
                    style={{
                        boxShadow:
                            "0 0 20px #3b82f6, 0 0 40px #3b82f6, 0 0 60px #3b82f6, 0 0 80px #3b82f6",
                        animation:
                            "neonPulse 2s ease-in-out infinite alternate",
                    }}
                    size="sm"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {getActiveFilterCount() > 0 && (
                        <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-blue-100 text-blue-800"
                        >
                            {getActiveFilterCount()}
                        </Badge>
                    )}
                </Button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`w-full lg:w-64 bg-white border-r border-gray-200 h-full ${
                    isMobileOpen
                        ? "fixed top-0 left-0 z-50 h-screen overflow-y-auto shadow-2xl"
                        : "hidden lg:block"
                }`}
            >
                <div className="p-3 lg:p-4">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                            Categories
                        </h3>
                        <div className="flex items-center gap-2">
                            {getActiveFilterCount() > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-700 text-xs lg:text-sm"
                                >
                                    Clear
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMobileOpen(false)}
                                className="lg:hidden"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Button
                            variant={!filters.category ? "secondary" : "ghost"}
                            className={`w-full justify-start text-sm lg:text-base border-2 transition-all duration-200 ${
                                !filters.category
                                    ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                            onClick={() => handleCategorySelect("")}
                        >
                            <Grid3X3 className="mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4" />
                            All Categories
                        </Button>

                        {/* Mobile: Grid layout for categories */}
                        <div className="lg:hidden grid grid-cols-2 gap-3 mt-4">
                            {CATEGORIES.map((category) => {
                                const Icon = categoryIcons[category];
                                const currentCategories = Array.isArray(
                                    filters.category
                                )
                                    ? filters.category
                                    : filters.category
                                    ? [filters.category]
                                    : [];
                                const isSelected =
                                    currentCategories.includes(category);

                                return (
                                    <Button
                                        key={category}
                                        variant={
                                            isSelected ? "secondary" : "ghost"
                                        }
                                        className={`w-full justify-start text-xs p-3 h-auto border-2 transition-all duration-200 ${
                                            isSelected
                                                ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                        onClick={() =>
                                            handleCategorySelect(category)
                                        }
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <Icon className="h-5 w-5" />
                                            <span className="truncate text-center leading-tight font-medium">
                                                {category}
                                            </span>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Desktop: Vertical list layout */}
                        <div className="hidden lg:block space-y-1">
                            {CATEGORIES.map((category) => {
                                const Icon = categoryIcons[category];
                                const currentCategories = Array.isArray(
                                    filters.category
                                )
                                    ? filters.category
                                    : filters.category
                                    ? [filters.category]
                                    : [];
                                const isSelected =
                                    currentCategories.includes(category);

                                return (
                                    <Button
                                        key={category}
                                        variant={
                                            isSelected ? "secondary" : "ghost"
                                        }
                                        className={`w-full justify-start border-2 transition-all duration-200 ${
                                            isSelected
                                                ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                        onClick={() =>
                                            handleCategorySelect(category)
                                        }
                                    >
                                        <Icon className="mr-3 h-4 w-4" />
                                        {category}
                                        {isSelected && (
                                            <Badge
                                                variant="secondary"
                                                className="ml-auto"
                                            >
                                                Selected
                                            </Badge>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Price Range
                        </h4>
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-sm border-2 transition-all duration-200 ${
                                    filters.minPrice === 0 &&
                                    filters.maxPrice === 5000
                                        ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                                onClick={() => {
                                    const newFilters = { ...filters };
                                    if (
                                        filters.minPrice === 0 &&
                                        filters.maxPrice === 5000
                                    ) {
                                        // Toggle off - remove price filters
                                        delete newFilters.minPrice;
                                        delete newFilters.maxPrice;
                                    } else {
                                        // Set this price range
                                        newFilters.minPrice = 0;
                                        newFilters.maxPrice = 5000;
                                    }
                                    setFilters(newFilters);
                                    setIsMobileOpen(false);
                                }}
                            >
                                Under ₹5,000
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-sm border-2 transition-all duration-200 ${
                                    filters.minPrice === 5000 &&
                                    filters.maxPrice === 25000
                                        ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                                onClick={() => {
                                    const newFilters = { ...filters };
                                    if (
                                        filters.minPrice === 5000 &&
                                        filters.maxPrice === 25000
                                    ) {
                                        // Toggle off - remove price filters
                                        delete newFilters.minPrice;
                                        delete newFilters.maxPrice;
                                    } else {
                                        // Set this price range
                                        newFilters.minPrice = 5000;
                                        newFilters.maxPrice = 25000;
                                    }
                                    setFilters(newFilters);
                                    setIsMobileOpen(false);
                                }}
                            >
                                ₹5,000 - ₹25,000
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-sm border-2 transition-all duration-200 ${
                                    filters.minPrice === 25000 &&
                                    filters.maxPrice === 100000
                                        ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                                onClick={() => {
                                    const newFilters = { ...filters };
                                    if (
                                        filters.minPrice === 25000 &&
                                        filters.maxPrice === 100000
                                    ) {
                                        // Toggle off - remove price filters
                                        delete newFilters.minPrice;
                                        delete newFilters.maxPrice;
                                    } else {
                                        // Set this price range
                                        newFilters.minPrice = 25000;
                                        newFilters.maxPrice = 100000;
                                    }
                                    setFilters(newFilters);
                                    setIsMobileOpen(false);
                                }}
                            >
                                ₹25,000 - ₹1,00,000
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start text-sm border-2 transition-all duration-200 ${
                                    filters.minPrice === 100000 &&
                                    !filters.maxPrice
                                        ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                                onClick={() => {
                                    const newFilters = { ...filters };
                                    if (
                                        filters.minPrice === 100000 &&
                                        !filters.maxPrice
                                    ) {
                                        // Toggle off - remove price filters
                                        delete newFilters.minPrice;
                                        delete newFilters.maxPrice;
                                    } else {
                                        // Set this price range
                                        newFilters.minPrice = 100000;
                                        delete newFilters.maxPrice;
                                    }
                                    setFilters(newFilters);
                                    setIsMobileOpen(false);
                                }}
                            >
                                Over ₹1,00,000
                            </Button>
                        </div>
                    </div>

                    {/* Condition Filter */}
                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Condition
                        </h4>
                        <div className="space-y-1">
                            {["new", "used", "refurbished"].map((condition) => (
                                <Button
                                    key={condition}
                                    variant={
                                        (
                                            Array.isArray(filters.condition)
                                                ? filters.condition.includes(
                                                      condition
                                                  )
                                                : filters.condition ===
                                                  condition
                                        )
                                            ? "secondary"
                                            : "ghost"
                                    }
                                    size="sm"
                                    className={`w-full justify-start text-sm capitalize border-2 transition-all duration-200 ${
                                        (
                                            Array.isArray(filters.condition)
                                                ? filters.condition.includes(
                                                      condition
                                                  )
                                                : filters.condition ===
                                                  condition
                                        )
                                            ? "bg-blue-100 border-blue-500 text-blue-800 shadow-lg ring-2 ring-blue-200"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                    }`}
                                    onClick={() => {
                                        const currentConditions = Array.isArray(
                                            filters.condition
                                        )
                                            ? filters.condition
                                            : filters.condition
                                            ? [filters.condition]
                                            : [];

                                        let newConditions: string[];
                                        if (
                                            currentConditions.includes(
                                                condition
                                            )
                                        ) {
                                            // Remove condition if already selected
                                            newConditions =
                                                currentConditions.filter(
                                                    (c) => c !== condition
                                                );
                                        } else {
                                            // Add condition if not selected
                                            newConditions = [
                                                ...currentConditions,
                                                condition,
                                            ];
                                        }

                                        const newFilters = { ...filters };
                                        if (newConditions.length === 0) {
                                            delete newFilters.condition;
                                        } else {
                                            newFilters.condition =
                                                newConditions.length === 1
                                                    ? newConditions[0]
                                                    : newConditions;
                                        }
                                        setFilters(newFilters);
                                        setIsMobileOpen(false);
                                    }}
                                >
                                    {condition}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
