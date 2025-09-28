"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductStore } from "@/store/productStore";
import NotificationBell from "@/components/NotificationBell";
import {
    Search,
    Plus,
    User,
    LogOut,
    Heart,
    Package,
    MessageCircle,
    Bell,
    Shield,
    X,
} from "lucide-react";

export default function Header() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Popular search suggestions
    const popularSearches = [
        // Electronics & Tech
        "iPhone",
        "Samsung",
        "Laptop",
        "Mobile phones",
        "Tablet",
        "Headphones",
        "Camera",
        "Smartwatch",
        // Vehicles
        "Car",
        "Bike",
        "Motorcycle",
        "Scooter",
        "Bicycle",
        "Auto rickshaw",
        // Home & Furniture
        "Furniture",
        "Sofa",
        "Bed",
        "Table",
        "Chair",
        "Wardrobe",
        "Home decor",
        // Fashion & Accessories
        "Clothes",
        "Shoes",
        "Bag",
        "Watch",
        "Jewelry",
        "Sunglasses",
        "Perfume",
        // Books & Education
        "Books",
        "Textbooks",
        "Novels",
        "Study materials",
        "Stationery",
        // Sports & Fitness
        "Gym equipment",
        "Sports shoes",
        "Cricket bat",
        "Football",
        "Badminton racket",
        // Pets & Animals
        "Pet food",
        "Dog accessories",
        "Cat toys",
        "Aquarium",
        // Jobs & Services
        "Part time job",
        "Freelance",
        "Tutoring",
        "Cleaning service",
        "Repair service",
        // General Categories
        "Electronics",
        "Home",
        "Garden",
        "Kitchen appliances",
        "Tools",
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Update the product store with search term
            const { setFilters, filters } = useProductStore.getState();
            setFilters({ ...filters, search: searchTerm.trim() });

            // Add to recent searches
            addToRecentSearches(searchTerm.trim());

            // Close mobile search and suggestions
            setIsMobileSearchOpen(false);
            setShowSuggestions(false);
        }
    };

    const addToRecentSearches = (term: string) => {
        setRecentSearches((prev) => {
            const filtered = prev.filter((item) => item !== term);
            const updated = [term, ...filtered].slice(0, 5); // Keep only 5 recent searches
            localStorage.setItem("recentSearches", JSON.stringify(updated));
            return updated;
        });
    };

    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        const { setFilters, filters } = useProductStore.getState();
        setFilters({ ...filters, search: suggestion });
        addToRecentSearches(suggestion);
        setShowSuggestions(false);
        setIsMobileSearchOpen(false);
    };

    const clearSearch = () => {
        setSearchTerm("");
        const { setFilters, filters } = useProductStore.getState();
        const { search: _, ...otherFilters } = filters;
        setFilters(otherFilters);
    };

    // Check admin status
    useEffect(() => {
        if (session?.user) {
            checkAdminStatus();
        }
    }, [session]);

    // Sync search term with current filters
    useEffect(() => {
        const { filters } = useProductStore.getState();
        if (filters.search) {
            setSearchTerm(filters.search);
        }
    }, []);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error("Error loading recent searches:", error);
            }
        }
    }, []);

    const checkAdminStatus = async () => {
        try {
            const response = await fetch("/api/admin/check-access");
            if (response.ok) {
                setIsAdmin(true);
            }
        } catch {
            // User is not admin, which is fine
            setIsAdmin(false);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm animate-slide-in-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 flex-shrink-0 animate-fade-in-left hover-scale"
                    >
                        <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">
                            rS
                        </div>
                        <span className="text-lg lg:text-xl font-bold text-gray-900 hidden sm:block">
                            re-Soldium
                        </span>
                    </Link>

                    {/* Search Bar - Hidden on mobile, shown on tablet+ */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-lg mx-8 animate-fade-in animate-delay-200"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search for products..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(
                                        e.target.value.length > 0
                                    );
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() =>
                                    setTimeout(
                                        () => setShowSuggestions(false),
                                        200
                                    )
                                }
                                className="pl-10 pr-10 py-2 w-full"
                            />
                            {searchTerm && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                                    onClick={clearSearch}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}

                            {/* Search Suggestions Dropdown */}
                            {showSuggestions && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto animate-fade-in-up">
                                    {recentSearches.length > 0 && (
                                        <div className="p-2">
                                            <div className="text-xs font-medium text-gray-500 px-2 py-1">
                                                Recent Searches
                                            </div>
                                            {recentSearches.map(
                                                (search, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            handleSuggestionClick(
                                                                search
                                                            )
                                                        }
                                                        className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                                                    >
                                                        <Search className="w-4 h-4 text-gray-400" />
                                                        {search}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                    {recentSearches.length > 0 &&
                                        popularSearches.length > 0 && (
                                            <div className="border-t border-gray-100"></div>
                                        )}
                                    <div className="p-2">
                                        <div className="text-xs font-medium text-gray-500 px-2 py-1">
                                            Popular Searches
                                        </div>
                                        {popularSearches.map(
                                            (search, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            search
                                                        )
                                                    }
                                                    className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-sm flex items-center gap-2"
                                                >
                                                    <Search className="w-4 h-4 text-gray-400" />
                                                    {search}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        {/* Mobile Search Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 animate-fade-in-right hover-scale"
                            onClick={() =>
                                setIsMobileSearchOpen(!isMobileSearchOpen)
                            }
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {session?.user ? (
                            <>
                                <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 hidden sm:flex animate-fade-in-right animate-delay-300 hover-scale"
                                >
                                    <Link href="/sell">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Sell
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 sm:hidden p-2"
                                >
                                    <Link href="/sell">
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                </Button>

                                {/* Notification Bell */}
                                <NotificationBell />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-8 w-8 rounded-full"
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage
                                                    src={
                                                        session.user.image || ""
                                                    }
                                                    alt={
                                                        session.user.name || ""
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {session.user.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                        forceMount
                                    >
                                        <div className="flex items-center justify-start gap-2 p-2">
                                            <div className="flex flex-col space-y-1 leading-none">
                                                <p className="font-medium">
                                                    {session.user.name}
                                                </p>
                                                <p className="w-[200px] truncate text-sm text-muted-foreground">
                                                    {session.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/my-ads">
                                                <Package className="mr-2 h-4 w-4" />
                                                My Ads
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/favorites">
                                                <Heart className="mr-2 h-4 w-4" />
                                                Favorites
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/messages">
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                Messages
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/notifications">
                                                <Bell className="mr-2 h-4 w-4" />
                                                Notifications
                                            </Link>
                                        </DropdownMenuItem>
                                        {isAdmin && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/admin">
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Admin Panel
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => {
                                                signOut({ callbackUrl: "/" });
                                            }}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button asChild variant="outline">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="default"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Link href="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {isMobileSearchOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileSearchOpen(false)}
                />
            )}

            {/* Mobile Search Form */}
            {isMobileSearchOpen && (
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-xl">
                    <div className="px-4 py-3">
                        <form
                            onSubmit={handleSearch}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="Search for products..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowSuggestions(
                                            e.target.value.length > 0
                                        );
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    className="pl-12 pr-12 py-3 w-full text-base bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl transition-all duration-200"
                                    autoFocus
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />
                                {searchTerm && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200 rounded-full transition-colors"
                                        onClick={clearSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </form>

                        {/* Mobile Search Suggestions */}
                        {showSuggestions && (
                            <div className="mt-2 max-h-60 overflow-y-auto">
                                {recentSearches.length > 0 && (
                                    <div className="mb-2">
                                        <div className="text-xs font-medium text-gray-500 px-2 py-1">
                                            Recent Searches
                                        </div>
                                        {recentSearches.map((search, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    handleSuggestionClick(
                                                        search
                                                    )
                                                }
                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-3"
                                            >
                                                <Search className="w-4 h-4 text-gray-400" />
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {recentSearches.length > 0 &&
                                    popularSearches.length > 0 && (
                                        <div className="border-t border-gray-100 my-2"></div>
                                    )}
                                <div>
                                    <div className="text-xs font-medium text-gray-500 px-2 py-1">
                                        Popular Searches
                                    </div>
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {popularSearches.map(
                                            (search, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            search
                                                        )
                                                    }
                                                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                                                >
                                                    {search}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
