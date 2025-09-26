import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(request: NextRequest) {
    try {
        // Check authentication using NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in to upload images" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Check if Cloudinary is configured
        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            // Fallback to placeholder if Cloudinary not configured
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const dataUrl = `data:${file.type};base64,${base64}`;

            return NextResponse.json({
                success: true,
                url: dataUrl,
                message: "Cloudinary not configured, using base64 fallback",
            });
        }

        // Upload to Cloudinary using FormData
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append("file", file);
        cloudinaryFormData.append("upload_preset", "ml_default");
        cloudinaryFormData.append("folder", "re-soldium");

        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: cloudinaryFormData,
            }
        );

        if (!cloudinaryResponse.ok) {
            const errorData = await cloudinaryResponse.text();
            console.error("Cloudinary error:", errorData);
            throw new Error(
                `Failed to upload to Cloudinary: ${cloudinaryResponse.status}`
            );
        }

        const cloudinaryData = await cloudinaryResponse.json();

        return NextResponse.json({
            success: true,
            url: cloudinaryData.secure_url,
            public_id: cloudinaryData.public_id,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
