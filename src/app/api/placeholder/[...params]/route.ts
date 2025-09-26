import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ params: string[] }> }
) {
    try {
        // Extract dimensions from the path (e.g., /api/placeholder/400/300)
        const resolvedParams = await params;
        const [width = "400", height = "300"] = resolvedParams.params;
        const { searchParams } = new URL(request.url);
        const text = searchParams.get("text") || "Image";

        // Create a simple SVG placeholder
        const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text 
          x="50%" 
          y="50%" 
          text-anchor="middle" 
          dominant-baseline="middle" 
          font-family="Arial, sans-serif" 
          font-size="16" 
          fill="#6b7280"
        >
          ${text.slice(0, 20)}
        </text>
      </svg>
    `;

        return new NextResponse(svg, {
            headers: {
                "Content-Type": "image/svg+xml",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Placeholder API error:", error);
        return new NextResponse("Error generating placeholder", {
            status: 500,
        });
    }
}
