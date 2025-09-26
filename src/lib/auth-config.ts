import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import { verifyPassword } from "@/utils/auth";
import connectDB from "@/utils/db";

export const authOptions = {
    providers: [
        // Only include Google provider if credentials are available
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                  GoogleProvider({
                      clientId: process.env.GOOGLE_CLIENT_ID,
                      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  }),
              ]
            : []),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await connectDB();
                    const user = await User.findOne({
                        email: credentials.email.toLowerCase(),
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordValid = await verifyPassword(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
            }

            // Handle Google sign-in (only if MongoDB is configured)
            if (
                account?.provider === "google" &&
                user &&
                process.env.MONGODB_URI
            ) {
                try {
                    await connectDB();

                    // Check if user exists in our database
                    let dbUser = await User.findOne({ email: user.email });

                    if (!dbUser) {
                        // Create new user from Google data
                        dbUser = await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            googleId: account.providerAccountId,
                        });
                    } else if (!dbUser.googleId) {
                        // Link existing account with Google
                        dbUser.googleId = account.providerAccountId;
                        dbUser.image = user.image || dbUser.image;
                        await dbUser.save();
                    }

                    token.id = dbUser._id.toString();
                } catch (error) {
                    console.error("Google auth error:", error);
                    // Fallback to using the Google user ID if database fails
                    token.id = user.id;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url;
            // Default redirect to home page
            return baseUrl;
        },
    },
    pages: {
        signIn: "/login",
        signUp: "/register",
    },
};
