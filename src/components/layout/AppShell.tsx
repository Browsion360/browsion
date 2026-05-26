import { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Heart, Home, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdSocialBar } from "@/components/ads/AdSocialBar";
import { TopBanner } from "@/components/ads/TopBanner";
import { StickyBottomBar } from "@/components/ads/StickyBottomBar";

const items = [
  { to: "/discover", label: "Discover", icon: Home },
  { to: "/saved", label: "Saved", icon: Heart },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/my-account", label: "Account", icon: UserIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase
        .from("notifications").select("*", { count: "exact", head: true })
        .eq("user_id", user.id).eq("read", false);
      setUnread(count ?? 0);
    };
    load();
    const ch = supabase.channel("notif-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin/dashboard" className="hidden rounded-full bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/30 sm:inline-block">
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/notifications" aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
                <Link to="/my-account" className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-semibold">
                  {(user?.email?.[0] ?? "?").toUpperCase()}
                </Link>
              </>
            ) : (
              <Link to="/auth" className="rounded-full gradient-rose px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container pt-3"><TopBanner /></div>
      <main className="container pb-28 pt-6 md:pb-12">{children}</main>
      <AdSocialBar />
      <StickyBottomBar />

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
        <div className="grid grid-cols-4">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${isActive ? "text-primary" : "text-muted-foreground"}`
            }>
              <it.icon className="h-5 w-5" />
              {it.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
