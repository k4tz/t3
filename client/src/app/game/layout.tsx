"use client";

import Themes from "@/components/themes";
import RouteGuard from "@/components/RouteGuard";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard accessLevel="auth">
            <div className="text-white relative">
                <Themes />
                {children}
            </div>
        </RouteGuard>
        );
}