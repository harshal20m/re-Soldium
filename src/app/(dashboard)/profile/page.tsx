"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Activity {
    type: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    timestamp: Date;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlocked: boolean;
    unlockedAt?: Date;
    progress?: number;
}
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Camera,
    Save,
    Package,
    Heart,
    Star,
    Settings,
    Bell,
    Shield,
    Lock,
    Trash2,
    Upload,
    Calendar,
    MessageSquare,
    TrendingUp,
    Award,
    Clock,
} from "lucide-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        location: "",
        bio: "",
        website: "",
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        messageNotifications: true,
    });
    const [privacy, setPrivacy] = useState({
        profileVisibility: "public",
        showEmail: false,
        showPhone: false,
        allowMessages: true,
    });
    const [stats, setStats] = useState({
        activeListings: 0,
        totalListings: 0,
        totalViews: 0,
        favoritesCount: 0,
        profileViews: 0,
        unreadMessages: 0,
        rating: 0,
        memberSince: new Date(),
    });
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);

    // Redirect if not logged in (only after auth is loaded)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [session, status, router]);

    // Update form data when session changes
    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || "",
                email: session.user.email || "",
                phone: "",
                location: "",
                bio: "",
                website: "",
            });
        }
    }, [session]);

    // Fetch profile data
    useEffect(() => {
        const fetchProfileData = async () => {
            if (
                status !== "authenticated" ||
                !session?.user ||
                !("id" in session.user)
            ) {
                return;
            }

            try {
                // Fetch profile info
                const profileResponse = await fetch("/api/profile");
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setFormData((prev) => ({
                        ...prev,
                        ...profileData.user,
                    }));
                }

                // Fetch notifications
                const notificationsResponse = await fetch(
                    "/api/profile/notifications"
                );
                if (notificationsResponse.ok) {
                    const notificationsData =
                        await notificationsResponse.json();
                    setNotifications(notificationsData.notifications);
                }

                // Fetch privacy settings
                const privacyResponse = await fetch("/api/profile/privacy");
                if (privacyResponse.ok) {
                    const privacyData = await privacyResponse.json();
                    setPrivacy(privacyData.privacy);
                }

                // Fetch stats
                const statsResponse = await fetch("/api/profile/stats");
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData.stats);
                    setRecentActivity(statsData.recentActivity);
                    setAchievements(statsData.achievements);
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchProfileData();
    }, [session, status]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/profile/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(passwordData),
            });

            if (response.ok) {
                toast.success("Password updated successfully!");
                setShowPasswordForm(false);
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to update password");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            toast.error("Failed to update password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsLoading(true);
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    toast.success("Profile picture updated!");
                    // Update profile with new image URL
                    await fetch("/api/profile", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ image: data.url }),
                    });
                } else {
                    toast.error("Failed to upload image");
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Failed to upload image");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteAccount = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/profile", {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Account deleted successfully");
                router.push("/");
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.error("Failed to delete account");
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Profile
                    </h1>
                    <p className="text-gray-600">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Personal Information</CardTitle>
                                    <Button
                                        variant={
                                            isEditing ? "outline" : "default"
                                        }
                                        size="sm"
                                        onClick={() => {
                                            if (isEditing) {
                                                setFormData({
                                                    name:
                                                        session?.user?.name ||
                                                        "",
                                                    email:
                                                        session?.user?.email ||
                                                        "",
                                                    phone: "",
                                                    location: "",
                                                    bio: "",
                                                    website: "",
                                                });
                                            }
                                            setIsEditing(!isEditing);
                                        }}
                                    >
                                        {isEditing ? "Cancel" : "Edit Profile"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Profile Picture */}
                                <div className="flex items-center space-x-6">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage
                                                src={session?.user?.image || ""}
                                                alt={session?.user?.name || ""}
                                            />
                                            <AvatarFallback className="text-2xl">
                                                {session?.user?.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </label>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {session?.user?.name}
                                        </h3>
                                        <p className="text-gray-600">
                                            {session?.user?.email}
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className="mt-2"
                                        >
                                            Verified Member
                                        </Badge>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Full Name
                                        </Label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Mail className="w-4 h-4 inline mr-2" />
                                            Email Address
                                        </Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            Location
                                        </Label>
                                        <Input
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your location"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Bio
                                        </Label>
                                        <Textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Upload className="w-4 h-4 inline mr-2" />
                                            Website
                                        </Label>
                                        <Input
                                            name="website"
                                            type="url"
                                            value={formData.website}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end space-x-3 pt-6 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notifications Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Bell className="w-5 h-5 inline mr-2" />
                                    Notification Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Email Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Receive notifications about your
                                            listings and messages
                                        </p>
                                    </div>
                                    <Switch
                                        checked={
                                            notifications.emailNotifications
                                        }
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                emailNotifications: checked,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Push Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Get instant notifications on your
                                            device
                                        </p>
                                    </div>
                                    <Switch
                                        checked={
                                            notifications.pushNotifications
                                        }
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                pushNotifications: checked,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Marketing Emails
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Receive promotional offers and
                                            updates
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.marketingEmails}
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                marketingEmails: checked,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Message Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Get notified when you receive new
                                            messages
                                        </p>
                                    </div>
                                    <Switch
                                        checked={
                                            notifications.messageNotifications
                                        }
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                messageNotifications: checked,
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Shield className="w-5 h-5 inline mr-2" />
                                    Privacy Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label className="text-sm font-medium text-gray-900">
                                        Profile Visibility
                                    </Label>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Control who can see your profile
                                        information
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="public"
                                                name="visibility"
                                                value="public"
                                                checked={
                                                    privacy.profileVisibility ===
                                                    "public"
                                                }
                                                onChange={(e) =>
                                                    setPrivacy((prev) => ({
                                                        ...prev,
                                                        profileVisibility:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="text-blue-600"
                                            />
                                            <Label htmlFor="public">
                                                Public - Anyone can see your
                                                profile
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="private"
                                                name="visibility"
                                                value="private"
                                                checked={
                                                    privacy.profileVisibility ===
                                                    "private"
                                                }
                                                onChange={(e) =>
                                                    setPrivacy((prev) => ({
                                                        ...prev,
                                                        profileVisibility:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="text-blue-600"
                                            />
                                            <Label htmlFor="private">
                                                Private - Only logged-in users
                                                can see your profile
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Show Email Address
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Display your email on your public
                                            profile
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacy.showEmail}
                                        onCheckedChange={(checked: boolean) =>
                                            setPrivacy((prev) => ({
                                                ...prev,
                                                showEmail: checked,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Show Phone Number
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Display your phone number on your
                                            public profile
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacy.showPhone}
                                        onCheckedChange={(checked: boolean) =>
                                            setPrivacy((prev) => ({
                                                ...prev,
                                                showPhone: checked,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Allow Messages
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Let other users send you messages
                                        </p>
                                    </div>
                                    <Switch
                                        checked={privacy.allowMessages}
                                        onCheckedChange={(checked: boolean) =>
                                            setPrivacy((prev) => ({
                                                ...prev,
                                                allowMessages: checked,
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Lock className="w-5 h-5 inline mr-2" />
                                    Security Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Change Password
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Update your password to keep your
                                            account secure
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowPasswordForm(
                                                !showPasswordForm
                                            )
                                        }
                                    >
                                        {showPasswordForm ? "Cancel" : "Update"}
                                    </Button>
                                </div>

                                {showPasswordForm && (
                                    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                        <div>
                                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </Label>
                                            <Input
                                                name="currentPassword"
                                                type="password"
                                                value={
                                                    passwordData.currentPassword
                                                }
                                                onChange={handlePasswordChange}
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </Label>
                                            <Input
                                                name="newPassword"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                name="confirmPassword"
                                                type="password"
                                                value={
                                                    passwordData.confirmPassword
                                                }
                                                onChange={handlePasswordChange}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowPasswordForm(false)
                                                }
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handlePasswordUpdate}
                                                disabled={isLoading}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isLoading
                                                    ? "Updating..."
                                                    : "Update Password"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            Two-Factor Authentication
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Add an extra layer of security to
                                            your account
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Enable
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                                    <div>
                                        <h4 className="font-medium text-red-900">
                                            Delete Account
                                        </h4>
                                        <p className="text-sm text-red-600">
                                            Permanently delete your account and
                                            all data
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                        onClick={() =>
                                            setShowDeleteConfirm(true)
                                        }
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Package className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Active Listings
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Items for sale
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stats.activeListings}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-100 p-2 rounded-lg">
                                            <Star className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Rating
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                From buyers
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stats.rating.toFixed(1)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-red-100 p-2 rounded-lg">
                                            <Heart className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Favorites
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Saved items
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stats.favoritesCount}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                            <MessageSquare className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Messages
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Unread messages
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stats.unreadMessages}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-orange-100 p-2 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                Views
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Profile views
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {stats.profileViews > 1000
                                            ? `${(
                                                  stats.profileViews / 1000
                                              ).toFixed(1)}k`
                                            : stats.profileViews}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map(
                                        (activity: Activity, index: number) => {
                                            const iconMap: {
                                                [
                                                    key: string
                                                ]: React.ComponentType<{
                                                    className?: string;
                                                }>;
                                            } = {
                                                Package,
                                                MessageSquare,
                                                Star,
                                                Heart,
                                            };
                                            const IconComponent =
                                                iconMap[activity.icon] ||
                                                Package;

                                            const colorClasses = {
                                                green: "bg-green-100 text-green-600",
                                                blue: "bg-blue-100 text-blue-600",
                                                yellow: "bg-yellow-100 text-yellow-600",
                                                red: "bg-red-100 text-red-600",
                                            };

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div
                                                        className={`p-2 rounded-full ${
                                                            colorClasses[
                                                                activity.color as keyof typeof colorClasses
                                                            ] ||
                                                            colorClasses.green
                                                        }`}
                                                    >
                                                        <IconComponent className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {
                                                                activity.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 text-sm">
                                            No recent activity
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <a href="/sell">
                                        <Package className="w-4 h-4 mr-2" />
                                        Create New Listing
                                    </a>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <a href="/my-ads">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Manage My Ads
                                    </a>
                                </Button>

                                <Button
                                    asChild
                                    className="w-full justify-start"
                                    variant="outline"
                                >
                                    <a href="/favorites">
                                        <Heart className="w-4 h-4 mr-2" />
                                        View Favorites
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Member Since */}
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="mb-4">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Calendar className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900">
                                        Member Since
                                    </h3>
                                    <p className="text-gray-600">
                                        {new Date(
                                            stats.memberSince
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    Trusted Seller
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Achievements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {achievements.length > 0 ? (
                                    achievements.map(
                                        (
                                            achievement: Achievement,
                                            index: number
                                        ) => {
                                            const iconMap: {
                                                [
                                                    key: string
                                                ]: React.ComponentType<{
                                                    className?: string;
                                                }>;
                                            } = {
                                                Award,
                                                Star,
                                                Clock,
                                                TrendingUp,
                                            };
                                            const IconComponent =
                                                iconMap[achievement.icon] ||
                                                Award;

                                            const colorClasses = {
                                                yellow: "bg-yellow-50 border-yellow-200",
                                                green: "bg-green-50 border-green-200",
                                                blue: "bg-blue-50 border-blue-200",
                                                purple: "bg-purple-50 border-purple-200",
                                            };

                                            const iconColorClasses = {
                                                yellow: "bg-yellow-100 text-yellow-600",
                                                green: "bg-green-100 text-green-600",
                                                blue: "bg-blue-100 text-blue-600",
                                                purple: "bg-purple-100 text-purple-600",
                                            };

                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                                        colorClasses[
                                                            achievement.color as keyof typeof colorClasses
                                                        ] || colorClasses.yellow
                                                    }`}
                                                >
                                                    <div
                                                        className={`p-2 rounded-full ${
                                                            iconColorClasses[
                                                                achievement.color as keyof typeof iconColorClasses
                                                            ] ||
                                                            iconColorClasses.yellow
                                                        }`}
                                                    >
                                                        <IconComponent className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {achievement.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {
                                                                achievement.description
                                                            }
                                                        </p>
                                                        {!achievement.unlocked &&
                                                            achievement.progress !==
                                                                undefined && (
                                                                <div className="mt-2">
                                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                        <span>
                                                                            Progress
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                achievement.progress
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                        <div
                                                                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                                            style={{
                                                                                width: `${achievement.progress}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                    {achievement.unlocked && (
                                                        <div className="text-green-600">
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 text-sm">
                                            No achievements yet
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Delete Account Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Delete Account
                                </h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete your account?
                                This action cannot be undone and will
                                permanently remove all your data, listings, and
                                messages.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Deleting..."
                                        : "Delete Account"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
