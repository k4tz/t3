
import RouteGuard from "@/components/RouteGuard";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard accessLevel="guest">{children}</RouteGuard>
    );
}