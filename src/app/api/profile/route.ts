import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const user = await User.findById(session.user.id).select("-password");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                phone: user.phone || "",
                location: user.location || "",
                bio: user.bio || "",
                website: user.website || "",
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, email, phone, location, bio, website, image } = body;

        await connectDB();

        const updateData: Record<string, string | number | boolean> = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (location !== undefined) updateData.location = location;
        if (bio !== undefined) updateData.bio = bio;
        if (website !== undefined) updateData.website = website;
        if (image) updateData.image = image;

        const user = await User.findByIdAndUpdate(session.user.id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                phone: user.phone || "",
                location: user.location || "",
                bio: user.bio || "",
                website: user.website || "",
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Profile PUT error:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = await getServerSession(authOptions) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        // Delete user and all associated data
        await User.findByIdAndDelete(session.user.id);

        return NextResponse.json({
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error("Profile DELETE error:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
