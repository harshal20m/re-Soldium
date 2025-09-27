"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSession } from "next-auth/react";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { setUser } = useAuthStore();
    const { data: session, status } = useSession();

    // Handle NextAuth session changes
    useEffect(() => {
        if (status === "authenticated" && session?.user && "id" in session.user) {
            // Store user data from NextAuth session
            const userData = {
                id: session.user.id as string,
                name: session.user.name || "",
                email: session.user.email || "",
                image: session.user.image || "",
            };

            setUser(userData);
        } else if (status === "unauthenticated") {
            setUser(null);
        }
    }, [session, status, setUser]);

    return <>{children}</>;
}
