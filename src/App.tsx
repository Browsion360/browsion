import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { queryClient } from "@/lib/queryClient";
import Landing from "./pages/Landing";
import { AdPopunder } from "./components/ads/AdPopunder";
import { AdInterstitial } from "./components/ads/AdInterstitial";
import { useGAPageviews } from "./lib/analytics";
import GADebug from "./components/debug/GADebug";
import ScrollToTop from "./components/ScrollToTop";

const RouteAnalytics = () => {
  useGAPageviews();
  return null;
};

const Auth = lazy(() => import("./pages/Auth"));
const Discover = lazy(() => import("./pages/Discover"));
const Explore = lazy(() => import("./pages/Explore"));
const ProfileDetail = lazy(() => import("./pages/ProfileDetail"));
const Saved = lazy(() => import("./pages/Saved"));
const Notifications = lazy(() => import("./pages/Notifications"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const Preferences = lazy(() => import("./pages/Preferences"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProfileForm = lazy(() => import("./pages/admin/ProfileForm"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));
const Broadcast = lazy(() => import("./pages/admin/Broadcast"));
const BulkImport = lazy(() => import("./pages/admin/BulkImport"));
const AdminCtaLinks = lazy(() => import("./pages/admin/CtaLinks"));
const AdminAds = lazy(() => import("./pages/admin/Ads"));

const RouteFallback = () => (
  <div className="min-h-[60vh] animate-fade-in p-6">
    <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        >
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

// Idle-time prefetch of likely-next routes so navigation feels instant
if (typeof window !== "undefined") {
  const idle = (cb: () => void) =>
    (window as any).requestIdleCallback ? (window as any).requestIdleCallback(cb) : setTimeout(cb, 1200);
  idle(() => {
    import("./pages/Discover");
    import("./pages/Auth");
    import("./pages/ProfileDetail");
  });
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <RouteAnalytics />
          <GADebug />
          <AdPopunder />
          <AdInterstitial />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing region="bd" />} />
              <Route path="/bd" element={<Landing region="bd" />} />
              <Route path="/ar" element={<Landing region="ar" />} />
              <Route path="/es" element={<Landing region="es" />} />
              <Route path="/global" element={<Landing region="global" />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/explore/:id" element={<Explore />} />
              <Route path="/bd/explore" element={<Explore />} />
              <Route path="/bd/explore/:id" element={<Explore />} />
              <Route path="/ar/explore" element={<Explore />} />
              <Route path="/ar/explore/:id" element={<Explore />} />
              <Route path="/es/explore" element={<Explore />} />
              <Route path="/es/explore/:id" element={<Explore />} />
              <Route path="/global/explore" element={<Explore />} />
              <Route path="/global/explore/:id" element={<Explore />} />

              <Route path="/discover" element={<Discover />} />
              <Route path="/p/:slug" element={<ProfileDetail />} />
              <Route path="/profile/:id" element={<ProfileDetail />} />
              <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
              <Route path="/preferences" element={<ProtectedRoute><Preferences /></ProtectedRoute>} />

              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/create-profile" element={<ProtectedRoute adminOnly><ProfileForm /></ProtectedRoute>} />
              <Route path="/admin/edit-profile/:id" element={<ProtectedRoute adminOnly><ProfileForm /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/broadcast" element={<ProtectedRoute adminOnly><Broadcast /></ProtectedRoute>} />
              <Route path="/admin/bulk-import" element={<ProtectedRoute adminOnly><BulkImport /></ProtectedRoute>} />
              <Route path="/admin/cta-links" element={<ProtectedRoute adminOnly><AdminCtaLinks /></ProtectedRoute>} />
              <Route path="/admin/ads" element={<ProtectedRoute adminOnly><AdminAds /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
