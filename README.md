# re-Soldium 🛒

A modern OLX clone built with Next.js, TypeScript, and Tailwind CSS. Buy and sell everything from electronics to vehicles with confidence.

## ✨ Features

-   🔐 **Authentication**: Google OAuth + JWT-based auth system
-   📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
-   🎨 **Modern UI**: Clean interface using shadcn/ui components
-   🔍 **Search & Filter**: Find products by category, price, condition
-   📸 **Image Upload**: Support for multiple product images
-   💾 **State Management**: Zustand for efficient state handling
-   🗄️ **Database**: MongoDB for data persistence
-   ☁️ **File Storage**: Cloudinary integration for images

## 🚀 Tech Stack

-   **Framework**: Next.js 15 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4
-   **UI Components**: shadcn/ui
-   **State Management**: Zustand
-   **Database**: MongoDB with Mongoose
-   **Authentication**: JWT + Google OAuth
-   **File Upload**: Cloudinary
-   **Icons**: Lucide React

## 🛠️ Setup Instructions

1. **Clone the repository**

    ```bash
    git clone <your-repo-url>
    cd re-soldium
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

    ```env
    # MongoDB Database
    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/re-soldium?retryWrites=true&w=majority

    # JWT Authentication
    JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

    # NextAuth Configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-nextauth-secret-key-here

    # Google OAuth (Required for Google login functionality)
    GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

    # Cloudinary (for image uploads)
    CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
    CLOUDINARY_API_KEY=your-cloudinary-api-key
    CLOUDINARY_API_SECRET=your-cloudinary-api-secret

    # Development/Production Environment
    NODE_ENV=development
    ```

4. **Run the development server**

    ```bash
    npm run dev
    ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── sell/              # Sell page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Main navigation
│   ├── CategorySidebar.tsx
│   └── ProductCard.tsx
├── store/                 # Zustand stores
├── models/               # MongoDB models
├── utils/                # Utility functions
└── types/                # TypeScript definitions
```

## 🔧 Key Features Implementation

### Authentication

-   JWT-based authentication with secure password hashing
-   Google OAuth integration ready
-   Protected routes and middleware

### Product Management

-   Create, read, update, delete products
-   Image upload with Cloudinary
-   Category-based organization
-   Price and condition filtering

### Search & Filtering

-   Real-time search functionality
-   Filter by category, price range, condition
-   Location-based filtering

### State Management

-   Zustand stores for auth and product state
-   Persistent user sessions
-   Optimistic UI updates

## 🎯 Current Status

✅ **Completed:**

-   Project setup and dependencies
-   Basic UI components and layout
-   Authentication system (register/login)
-   Product listing and creation
-   State management with Zustand
-   Responsive design

🚧 **Ready for Production:**

-   Database models and API routes created
-   Image upload system ready for Cloudinary integration
-   Search and filtering fully implemented
-   Complete user dashboard with profile, ads, and favorites

📋 **Next Steps:**

-   Add your environment variables to `.env.local`
-   Connect to MongoDB database
-   Set up Google OAuth credentials (see setup guide below)
-   Set up Cloudinary for image uploads
-   Deploy to Vercel or your preferred platform

## 🔐 **Google OAuth Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google` (for development)
    - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy Client ID and Client Secret to your `.env.local`

## 🚀 Deployment

1. **Build the application**

    ```bash
    npm run build
    ```

2. **Deploy to Vercel** (recommended)
    ```bash
    vercel --prod
    ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   [Next.js](https://nextjs.org/) for the amazing React framework
-   [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
-   [shadcn/ui](https://ui.shadcn.com/) for beautiful components
-   [Zustand](https://github.com/pmndrs/zustand) for state management
