"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { X, Send, MessageCircle, Phone, MapPin, Eye } from "lucide-react";
import Image from "next/image";
import { formatPrice, formatDate } from "@/utils/auth";
import Link from "next/link";

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        name: string;
        email: string;
        image?: string;
    };
    receiver: {
        _id: string;
        name: string;
        email: string;
        image?: string;
    };
    createdAt: string;
    isRead: boolean;
}

interface Product {
    _id: string;
    title: string;
    price: number;
    images: string[];
    location: string;
    views: number;
    createdAt: string;
}

interface Seller {
    _id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    createdAt: string;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    seller: Seller;
    conversationId?: string;
}

export default function ChatModal({
    isOpen,
    onClose,
    product,
    seller,
    conversationId,
}: ChatModalProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentConversationId, setCurrentConversationId] =
        useState(conversationId);
    const [showPhoneNumber, setShowPhoneNumber] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = useCallback(async () => {
        if (!currentConversationId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/messages?conversationId=${currentConversationId}`
            );
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            } else {
                toast.error("Failed to load messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    }, [currentConversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && currentConversationId) {
            fetchMessages();
        }
    }, [isOpen, currentConversationId, fetchMessages]);

    const createConversation = async () => {
        // Prevent users from messaging themselves
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (seller._id === (session?.user as any)?.id) {
            toast.error("You cannot message yourself");
            return null;
        }

        try {
            const response = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: product._id,
                    receiverId: seller._id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentConversationId(data.conversation._id);

                // Show success message only for new conversations
                if (data.message === "Conversation created successfully") {
                    toast.success("Conversation started!");
                }

                return data.conversation._id;
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to start conversation");
                return null;
            }
        } catch (error) {
            console.error("Error creating conversation:", error);
            toast.error("Failed to start conversation");
            return null;
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        // Check if user is logged in
        if (!session?.user || !("id" in session.user)) {
            toast.error("Please log in to send messages");
            return;
        }

        // Prevent users from messaging themselves
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (seller._id === (session.user as any).id) {
            toast.error("You cannot message yourself");
            return;
        }

        let convId = currentConversationId;
        if (!convId) {
            convId = await createConversation();
            if (!convId) return;
        }

        setSending(true);
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId: convId,
                    content: newMessage,
                    receiverId: seller._id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, data.message]);
                setNewMessage("");
                toast.success("Message sent!");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">
                                {product.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {formatPrice(product.price)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="flex-shrink-0"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Chat Messages */}
                    <div className="flex-1 flex flex-col">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                        <p className="text-gray-600 text-sm sm:text-base">
                                            Start a conversation about this item
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message._id}
                                        className={`flex ${
                                            message.sender._id ===
                                            (session?.user &&
                                            "id" in session.user
                                                ? session.user.id
                                                : null)
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                                                message.sender._id ===
                                                (session?.user &&
                                                "id" in session.user
                                                    ? session.user.id
                                                    : null)
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-900"
                                            }`}
                                        >
                                            <p className="text-xs sm:text-sm">
                                                {message.content}
                                            </p>
                                            <p
                                                className={`text-xs mt-1 ${
                                                    message.sender._id ===
                                                    (session?.user &&
                                                    "id" in session.user
                                                        ? session.user.id
                                                        : null)
                                                        ? "text-blue-100"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {new Date(
                                                    message.createdAt
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="border-t p-3 sm:p-4">
                            <div className="flex space-x-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={sending}
                                    className="flex-1 text-sm sm:text-base"
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4"
                                    size="sm"
                                >
                                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Product & Seller Info - Hidden on mobile, shown on larger screens */}
                    <div className="hidden lg:block w-80 border-l bg-gray-50 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {/* Product Details */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                        Product Details
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {product.location}
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Eye className="w-4 h-4 mr-2" />
                                            {product.views} views
                                        </div>
                                        <div className="text-gray-600">
                                            Listed{" "}
                                            {formatDate(product.createdAt)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seller Info */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                        Seller Information
                                    </h4>
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Link href={`/profile/${seller._id}`}>
                                            <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all duration-200">
                                                <AvatarImage
                                                    src={seller.image}
                                                    alt={seller.name}
                                                />
                                                <AvatarFallback>
                                                    {seller.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div>
                                            <Link
                                                href={`/profile/${seller._id}`}
                                                className="font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                                            >
                                                {seller.name}
                                            </Link>
                                            <p className="text-sm text-gray-600">
                                                Member since{" "}
                                                {formatDate(seller.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() =>
                                                setShowPhoneNumber(
                                                    !showPhoneNumber
                                                )
                                            }
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            {showPhoneNumber ? "Hide" : "Call"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            View Profile
                                        </Button>
                                    </div>

                                    {/* Phone Number Display */}
                                    {showPhoneNumber && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        Phone Number
                                                    </p>
                                                    <p className="text-sm font-mono text-blue-900">
                                                        {seller.phone ||
                                                            "+91 9876543210"}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const phoneNumber =
                                                            seller.phone ||
                                                            "+15551234567";
                                                        window.open(
                                                            `tel:${phoneNumber}`,
                                                            "_self"
                                                        );
                                                    }}
                                                    className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                                                >
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    Call
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Safety Tips */}
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">
                                        Safety Tips
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Meet in a public place</li>
                                        <li>• Check the item before paying</li>
                                        <li>• Don&apos;t pay in advance</li>
                                        <li>• Trust your instincts</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
