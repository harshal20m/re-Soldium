"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import ChatModal from "@/components/ChatModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Search } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/utils/auth";
import Link from "next/link";

interface Conversation {
    _id: string;
    participants: Array<{
        _id: string;
        name: string;
        email: string;
        image?: string;
    }>;
    product: {
        _id: string;
        title: string;
        price: number;
        images: string[];
        location: string;
        views: number;
        createdAt: string;
        seller: {
            _id: string;
            name: string;
            email: string;
            image?: string;
            phone?: string;
            createdAt: string;
        };
    };
    lastMessage?: {
        _id: string;
        content: string;
        sender: {
            _id: string;
            name: string;
        };
        createdAt: string;
    };
    lastMessageAt: string;
    unreadCount: number;
}

function MessagesContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated") {
            fetchConversations();
        }
    }, [status]);

    // Handle conversation ID from URL parameters
    useEffect(() => {
        const conversationId = searchParams.get("conversationId");
        if (conversationId && conversations.length > 0) {
            const conversation = conversations.find(
                (conv) => conv._id === conversationId
            );
            if (conversation) {
                openChat(conversation);
            }
        }
    }, [searchParams, conversations]);

    const fetchConversations = async () => {
        try {
            const response = await fetch("/api/conversations");
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations || []);
            } else {
                toast.error("Failed to load conversations");
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
            toast.error("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    };

    const openChat = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setIsChatOpen(true);
    };

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(
            (participant) =>
                session?.user &&
                "id" in session.user &&
                participant._id !== session.user.id
        );
    };

    const filteredConversations = conversations.filter((conversation) => {
        const otherParticipant = getOtherParticipant(conversation);
        const searchLower = searchTerm.toLowerCase();

        return (
            otherParticipant?.name.toLowerCase().includes(searchLower) ||
            conversation.product.title.toLowerCase().includes(searchLower) ||
            conversation.lastMessage?.content
                .toLowerCase()
                .includes(searchLower)
        );
    });

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Messages
                    </h1>
                    <p className="text-gray-600">
                        Chat with buyers and sellers about your listings
                    </p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                            Loading conversations...
                        </span>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm
                                    ? "No conversations found"
                                    : "No messages yet"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm
                                    ? "Try adjusting your search terms"
                                    : "Start a conversation by messaging a seller about their listing"}
                            </p>
                            {!searchTerm && (
                                <Button asChild>
                                    <Link href="/">Browse Listings</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredConversations.map((conversation) => {
                            const otherParticipant =
                                getOtherParticipant(conversation);
                            const isLastMessageFromOther =
                                conversation.lastMessage?.sender._id !==
                                (session?.user && "id" in session.user
                                    ? session.user.id
                                    : null);

                            return (
                                <Card
                                    key={conversation._id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => openChat(conversation)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start space-x-3">
                                            {/* Product Image */}
                                            <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={
                                                        conversation.product
                                                            .images[0]
                                                    }
                                                    alt={
                                                        conversation.product
                                                            .title
                                                    }
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {/* Product Title */}
                                                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                                                    {conversation.product.title}
                                                </h3>

                                                {/* Price */}
                                                <p className="text-sm font-medium text-green-600 mb-2">
                                                    {formatPrice(
                                                        conversation.product
                                                            .price
                                                    )}
                                                </p>

                                                {/* Last Message */}
                                                {conversation.lastMessage ? (
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <p className="text-sm text-gray-600 line-clamp-1 flex-1">
                                                            <span className="font-medium">
                                                                {isLastMessageFromOther
                                                                    ? otherParticipant?.name
                                                                    : "You"}
                                                                :
                                                            </span>{" "}
                                                            {
                                                                conversation
                                                                    .lastMessage
                                                                    .content
                                                            }
                                                        </p>
                                                        {conversation.unreadCount >
                                                            0 &&
                                                            isLastMessageFromOther && (
                                                                <Badge className="bg-blue-600 text-white text-xs">
                                                                    {
                                                                        conversation.unreadCount
                                                                    }
                                                                </Badge>
                                                            )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 mb-2">
                                                        No messages yet
                                                    </p>
                                                )}

                                                {/* Participant Info */}
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarImage
                                                            src={
                                                                otherParticipant?.image
                                                            }
                                                            alt={
                                                                otherParticipant?.name
                                                            }
                                                        />
                                                        <AvatarFallback className="text-xs">
                                                            {otherParticipant?.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-gray-500">
                                                        {otherParticipant?.name}
                                                    </span>
                                                </div>

                                                {/* Last Message Time */}
                                                {conversation.lastMessage && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(
                                                            conversation.lastMessageAt
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Chat Modal */}
            {selectedConversation && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => {
                        setIsChatOpen(false);
                        setSelectedConversation(null);
                        // Clean up URL by removing conversationId parameter
                        const url = new URL(window.location.href);
                        url.searchParams.delete("conversationId");
                        window.history.replaceState({}, "", url.toString());
                        // Refresh conversations to update unread counts
                        fetchConversations();
                    }}
                    product={{
                        _id: selectedConversation.product._id,
                        title: selectedConversation.product.title,
                        price: selectedConversation.product.price,
                        images: selectedConversation.product.images,
                        location: selectedConversation.product.location,
                        views: selectedConversation.product.views,
                        createdAt: selectedConversation.product.createdAt,
                    }}
                    seller={{
                        _id: selectedConversation.product.seller._id,
                        name: selectedConversation.product.seller.name,
                        email: selectedConversation.product.seller.email,
                        image: selectedConversation.product.seller.image,
                        phone: selectedConversation.product.seller.phone,
                        createdAt:
                            selectedConversation.product.seller.createdAt,
                    }}
                    conversationId={selectedConversation._id}
                />
            )}
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
