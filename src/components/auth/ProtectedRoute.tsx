import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-[60vh] animate-fade-in p-6">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="aspect-[3/4] w-full bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/discover" replace />;
  return <>{children}</>;
}
