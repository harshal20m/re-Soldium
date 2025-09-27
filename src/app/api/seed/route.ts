import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { hashPassword } from "@/utils/auth";

export async function POST() {
    try {
        await connectDB();

        // Clear existing data (optional - remove if you want to keep existing data)
        await User.deleteMany({});
        await Product.deleteMany({});

        // Create seed users
        const hashedPassword = await hashPassword("password123");

        const users = await User.create([
            {
                name: "Rajesh Kumar",
                email: "rajesh@example.com",
                password: hashedPassword,
                phone: "+919876543210",
                location: "Mumbai, Maharashtra",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            },
            {
                name: "Priya Sharma",
                email: "priya@example.com",
                password: hashedPassword,
                phone: "+919876543211",
                location: "Delhi, NCR",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            },
            {
                name: "Amit Patel",
                email: "amit@example.com",
                password: hashedPassword,
                phone: "+919876543212",
                location: "Bangalore, Karnataka",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            },
            {
                name: "Sneha Reddy",
                email: "sneha@example.com",
                password: hashedPassword,
                phone: "+919876543213",
                location: "Hyderabad, Telangana",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            },
            {
                name: "Vikram Singh",
                email: "vikram@example.com",
                password: hashedPassword,
                phone: "+919876543214",
                location: "Pune, Maharashtra",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            },
        ]);

        console.log("Created users:", users.length);

        // Create seed products
        const products = await Product.create([
            {
                title: "Samsung Galaxy S23 Ultra - 256GB",
                description:
                    "Excellent condition Samsung Galaxy S23 Ultra in Phantom Black. Includes original box, charger, and screen protector. No scratches or dents. Battery health at 95%.",
                price: 75000,
                category: "Electronics",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop",
                ],
                location: "Mumbai, Maharashtra",
                seller: users[0]._id,
                isActive: true,
                views: 45,
            },
            {
                title: "Dell Inspiron 15 3000 Laptop",
                description:
                    "Brand new Dell Inspiron 15 3000 with Intel i5, 8GB RAM, 512GB SSD. Still in original packaging with warranty. Perfect for students and professionals.",
                price: 45000,
                category: "Electronics",
                condition: "new",
                images: [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop",
                ],
                location: "Delhi, NCR",
                seller: users[1]._id,
                isActive: true,
                views: 78,
            },
            {
                title: "Maruti Swift VDI - 2019 Model",
                description:
                    "Well-maintained Maruti Swift VDI with 45k km. Regular service, new tyres, and recent inspection. Great fuel economy and reliable transportation.",
                price: 650000,
                category: "Vehicles",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop",
                ],
                location: "Bangalore, Karnataka",
                seller: users[2]._id,
                isActive: true,
                views: 156,
            },
            {
                title: "2-BHK Apartment in HITEC City",
                description:
                    "Modern 2-BHK apartment in HITEC City area. Recently renovated with new appliances, marble floors, and city views. Gated community with security.",
                price: 8500000,
                category: "Property",
                condition: "new",
                images: [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                ],
                location: "Hyderabad, Telangana",
                seller: users[3]._id,
                isActive: true,
                views: 234,
            },
            {
                title: "Nike Air Max 270 - Size 9",
                description:
                    "Authentic Nike Air Max 270 in white colorway. Size 9, worn only a few times. Includes original box and tags.",
                price: 12000,
                category: "Fashion",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=600&fit=crop",
                ],
                location: "Pune, Maharashtra",
                seller: users[4]._id,
                isActive: true,
                views: 67,
            },
            {
                title: "OnePlus 11 5G - 128GB",
                description:
                    "OnePlus 11 5G smartphone in Titan Black. Excellent condition with fast charging, great camera quality. Includes original box and charger.",
                price: 45000,
                category: "Electronics",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&h=600&fit=crop",
                ],
                location: "Mumbai, Maharashtra",
                seller: users[0]._id,
                isActive: true,
                views: 89,
            },
            {
                title: "Yamaha F310 Acoustic Guitar",
                description:
                    "Beautiful Yamaha F310 acoustic guitar. Excellent condition with original case. Perfect for beginners and intermediate players.",
                price: 8500,
                category: "Electronics",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
                ],
                location: "Delhi, NCR",
                seller: users[1]._id,
                isActive: true,
                views: 123,
            },
            {
                title: "Outdoor Patio Furniture Set",
                description:
                    "Complete outdoor patio furniture set including table, 4 chairs, and umbrella. Weather-resistant materials, perfect for summer entertaining.",
                price: 38000,
                category: "Home & Garden",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
                ],
                location: "Bangalore, Karnataka",
                seller: users[2]._id,
                isActive: true,
                views: 45,
            },
            {
                title: "Canon EOS 200D DSLR Camera",
                description:
                    "Canon EOS 200D DSLR camera with 18-55mm kit lens. Perfect for beginners and photography enthusiasts. Excellent condition with original box.",
                price: 35000,
                category: "Electronics",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop",
                ],
                location: "Hyderabad, Telangana",
                seller: users[3]._id,
                isActive: true,
                views: 78,
            },
            {
                title: "Designer Handbag - Louis Vuitton",
                description:
                    "Authentic Louis Vuitton Neverfull MM handbag in monogram canvas. Includes dust bag and authenticity card. Excellent condition.",
                price: 100000,
                category: "Fashion",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=600&fit=crop",
                ],
                location: "Pune, Maharashtra",
                seller: users[4]._id,
                isActive: true,
                views: 156,
            },
            {
                title: "Mountain Bike - Trek 29er",
                description:
                    "Trek mountain bike with 29-inch wheels. Great for trails and commuting. Recently serviced, new brake pads and chain.",
                price: 65000,
                category: "Sports",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1544191696-15f2c5d4f1b9?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1544191696-15f2c5d4f1b9?w=800&h=600&fit=crop",
                ],
                location: "Mumbai, Maharashtra",
                seller: users[0]._id,
                isActive: true,
                views: 92,
            },
            {
                title: "Kitchen Appliances Bundle",
                description:
                    "Complete kitchen appliance set including blender, toaster, coffee maker, and food processor. All in excellent working condition.",
                price: 27000,
                category: "Home & Garden",
                condition: "used",
                images: [
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
                ],
                location: "Delhi, NCR",
                seller: users[1]._id,
                isActive: true,
                views: 34,
            },
        ]);

        console.log("Created products:", products.length);

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully!",
            data: {
                users: users.length,
                products: products.length,
            },
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Failed to seed database" },
            { status: 500 }
        );
    }
}
