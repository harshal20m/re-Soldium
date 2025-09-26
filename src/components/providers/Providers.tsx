"use client";

import { SessionProvider } from "next-auth/react";
import AuthProvider from "./AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthProvider>
                <NotificationProvider>{children}</NotificationProvider>
            </AuthProvider>
        </SessionProvider>
    );
}
