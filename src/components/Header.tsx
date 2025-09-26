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
import { useAuthStore } from "@/store/authStore";
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
} from "lucide-react";

export default function Header() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Update the product store with search term
            const { setFilters, filters } = useProductStore.getState();
            setFilters({ ...filters, search: searchTerm.trim() });
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center space-x-2 flex-shrink-0"
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
                        className="hidden md:flex flex-1 max-w-lg mx-8"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search for products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full"
                            />
                        </div>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        {/* Mobile Search Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2"
                            onClick={() => {
                                // TODO: Open mobile search modal
                                const searchInput = document.querySelector(
                                    'input[type="text"]'
                                ) as HTMLInputElement;
                                if (searchInput) {
                                    searchInput.focus();
                                }
                            }}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {session?.user ? (
                            <>
                                <Button
                                    asChild
                                    variant="default"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 hidden sm:flex"
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
        </header>
    );
}
