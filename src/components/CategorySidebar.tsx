"use client";

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

    const handleCategorySelect = (category: string) => {
        setFilters({
            ...filters,
            category: filters.category === category ? undefined : category,
        });
    };

    const clearFilters = () => {
        setFilters({});
    };

    return (
        <div className="w-full lg:w-64 bg-white border-r border-gray-200 h-full">
            <div className="p-3 lg:p-4">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                        Categories
                    </h3>
                    {Object.keys(filters).length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-blue-600 hover:text-blue-700 text-xs lg:text-sm"
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <div className="space-y-1">
                    <Button
                        variant={!filters.category ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm lg:text-base"
                        onClick={() => handleCategorySelect("")}
                    >
                        <Grid3X3 className="mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4" />
                        All Categories
                    </Button>

                    {/* Mobile: Grid layout for categories */}
                    <div className="lg:hidden grid grid-cols-2 gap-2 mt-3">
                        {CATEGORIES.map((category) => {
                            const Icon = categoryIcons[category];
                            const isSelected = filters.category === category;

                            return (
                                <Button
                                    key={category}
                                    variant={isSelected ? "secondary" : "ghost"}
                                    className="w-full justify-start text-xs p-2 h-auto"
                                    onClick={() =>
                                        handleCategorySelect(category)
                                    }
                                >
                                    <div className="flex flex-col items-center space-y-1">
                                        <Icon className="h-4 w-4" />
                                        <span className="truncate text-center leading-tight">
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
                            const isSelected = filters.category === category;

                            return (
                                <Button
                                    key={category}
                                    variant={isSelected ? "secondary" : "ghost"}
                                    className="w-full justify-start"
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
                            className="w-full justify-start text-sm"
                            onClick={() =>
                                setFilters({
                                    ...filters,
                                    minPrice: 0,
                                    maxPrice: 100,
                                })
                            }
                        >
                            Under $100
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() =>
                                setFilters({
                                    ...filters,
                                    minPrice: 100,
                                    maxPrice: 500,
                                })
                            }
                        >
                            $100 - $500
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() =>
                                setFilters({
                                    ...filters,
                                    minPrice: 500,
                                    maxPrice: 1000,
                                })
                            }
                        >
                            $500 - $1,000
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() =>
                                setFilters({ ...filters, minPrice: 1000 })
                            }
                        >
                            Over $1,000
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
                                    filters.condition === condition
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                className="w-full justify-start text-sm capitalize"
                                onClick={() =>
                                    setFilters({
                                        ...filters,
                                        condition:
                                            filters.condition === condition
                                                ? undefined
                                                : condition,
                                    })
                                }
                            >
                                {condition}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
