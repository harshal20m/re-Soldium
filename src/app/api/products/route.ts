import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Product from "@/models/Product";
import Report from "@/models/Report";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

interface ProductQuery {
    isActive: boolean;
    category?: string;
    condition?: string;
    price?: {
        $gte?: number;
        $lte?: number;
    };
    $text?: {
        $search: string;
    };
    _id?: {
        $nin: string[];
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const condition = searchParams.get("condition");
        const search = searchParams.get("search");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");

        await connectDB();

        // Build query
        const query: ProductQuery = { isActive: true };

        // Handle category filter
        if (category) {
            query.category = category;
        }

        if (condition) {
            query.condition = condition;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            // Enhanced search with category mapping
            const searchTerms = search.toLowerCase().trim();

            // Map common search terms to categories
            const categoryMappings: { [key: string]: string } = {
                car: "Vehicles",
                cars: "Vehicles",
                vehicle: "Vehicles",
                vehicles: "Vehicles",
                bike: "Vehicles",
                bikes: "Vehicles",
                motorcycle: "Vehicles",
                scooter: "Vehicles",
                bicycle: "Vehicles",
                auto: "Vehicles",
                mobile: "Electronics",
                "mobile phone": "Electronics",
                "mobile phones": "Electronics",
                phone: "Electronics",
                phones: "Electronics",
                smartphone: "Electronics",
                laptop: "Electronics",
                computer: "Electronics",
                tablet: "Electronics",
                headphones: "Electronics",
                camera: "Electronics",
                watch: "Electronics",
                smartwatch: "Electronics",
                furniture: "Home & Garden",
                sofa: "Home & Garden",
                bed: "Home & Garden",
                table: "Home & Garden",
                chair: "Home & Garden",
                wardrobe: "Home & Garden",
                home: "Home & Garden",
                garden: "Home & Garden",
                clothes: "Fashion",
                clothing: "Fashion",
                shoes: "Fashion",
                bag: "Fashion",
                jewelry: "Fashion",
                sunglasses: "Fashion",
                perfume: "Fashion",
                books: "Books",
                book: "Books",
                textbook: "Books",
                novel: "Books",
                study: "Books",
                sports: "Sports",
                gym: "Sports",
                cricket: "Sports",
                football: "Sports",
                badminton: "Sports",
                pet: "Pets",
                pets: "Pets",
                dog: "Pets",
                cat: "Pets",
                aquarium: "Pets",
                job: "Jobs",
                jobs: "Jobs",
                freelance: "Jobs",
                tutoring: "Jobs",
                service: "Services",
                services: "Services",
                repair: "Services",
                cleaning: "Services",
            };

            // Check if search term maps to a category
            const mappedCategory = categoryMappings[searchTerms];

            if (mappedCategory && !category) {
                // If search term maps to a category and no category filter is set, use the mapped category
                query.category = mappedCategory;
            } else {
                // Otherwise, use text search (works with or without category filter)
                query.$text = { $search: search };
            }
        }

        // Get session to check for reported products
        const session = await getServerSession(authOptions);

        // If user is logged in, exclude products they have reported
        if (session?.user?.id) {
            const reportedProductIds = await Report.find({
                reporter: session.user.id,
            }).distinct("reportedProduct");

            if (reportedProductIds.length > 0) {
                query._id = { $nin: reportedProductIds };
            }
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const products = await Product.find(query)
            .populate("seller", "name email image")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore: page < totalPages,
            },
        });
    } catch (error) {
        console.error("Products API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication using NextAuth
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (await getServerSession(authOptions)) as any;

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in to create products" },
                { status: 401 }
            );
        }

        const requestData = await request.json();

        const {
            title,
            description,
            price,
            category,
            condition,
            images,
            location,
        } = requestData;

        // Validation
        if (
            !title ||
            !description ||
            !price ||
            !category ||
            !condition ||
            !images ||
            !location
        ) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        if (images.length === 0) {
            return NextResponse.json(
                { error: "At least one image is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await Product.create({
            title,
            description,
            price: parseFloat(price),
            category,
            condition,
            images,
            location,
            seller: session.user.id,
        });

        const populatedProduct = await Product.findById(product._id).populate(
            "seller",
            "name email image"
        );

        return NextResponse.json({
            message: "Product created successfully",
            product: populatedProduct,
        });
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}
