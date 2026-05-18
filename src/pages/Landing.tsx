import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, Sparkles, Star, Check, ArrowRight, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ProfileCard } from "@/components/feed/ProfileCard";
import { ProfileRail } from "@/components/feed/ProfileRail";
import { CompactFilterBar } from "@/components/feed/CompactFilterBar";
import { InFeedAd } from "@/components/ads/InFeedAd";
import { TopBanner } from "@/components/ads/TopBanner";
import { AdBanner } from "@/components/ads/AdBanner";
import { AdNative } from "@/components/ads/AdNative";
import { StickyBottomBar } from "@/components/ads/StickyBottomBar";
import { AdSocialBar } from "@/components/ads/AdSocialBar";
import { usePublishedProfiles } from "@/hooks/usePublishedProfiles";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { REGIONS, REGION_LIST, getRegion, type Region } from "@/lib/regions";

const Landing = ({ region: regionSlug = "bd" }: { region?: Region }) => {
  const region = getRegion(regionSlug);
  const isBD = region.slug === "bd";
  const [filters, setFilters] = useState({ ageMin: 18, ageMax: 45, district: "any", religion: "any" });
  const [applied, setApplied] = useState(filters);

  // Reset filters when region changes
  useEffect(() => {
    const reset = { ageMin: 18, ageMax: 45, district: "any", religion: "any" };
    setFilters(reset);
    setApplied(reset);
  }, [region.slug]);

  // Map "district" filter → district (BD) or country (others)
  const locationFilter = applied.district !== "any"
    ? (isBD ? { district: applied.district } : { country: applied.district })
    : {};

  const { data: profiles, loading, hasMore, loadMore } = usePublishedProfiles({
    ageMin: applied.ageMin,
    ageMax: applied.ageMax,
    religion: applied.religion,
    region: region.slug,
    ...locationFilter,
  });

  // Apply RTL + SEO meta per region
  useEffect(() => {
    const html = document.documentElement;
    const prevDir = html.getAttribute("dir") || "ltr";
    const prevLang = html.getAttribute("lang") || "en";
    html.setAttribute("dir", region.dir);
    html.setAttribute("lang", region.locale);
    document.title = region.copy.seoTitle;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    const prevDesc = meta.getAttribute("content") || "";
    meta.setAttribute("content", region.copy.seoDescription);

    const ensureMeta = (name: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      return el;
    };
    const ogImageEl = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
    const twImageEl = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
    const prevOgImg = ogImageEl?.getAttribute("content") || "";
    const prevTwImg = twImageEl?.getAttribute("content") || "";
    if (region.copy.ogImage) {
      const imgUrl = `${window.location.origin}${region.copy.ogImage}`;
      ensureMeta("og:image", "property").content = imgUrl;
      ensureMeta("twitter:image").content = imgUrl;
    }

    return () => {
      html.setAttribute("dir", prevDir);
      html.setAttribute("lang", prevLang);
      meta?.setAttribute("content", prevDesc);
      if (prevOgImg && ogImageEl) ogImageEl.setAttribute("content", prevOgImg);
      if (prevTwImg && twImageEl) twImageEl.setAttribute("content", prevTwImg);
    };
  }, [region]);

  const newToday = profiles.filter(p => Date.now() - new Date(p.created_at).getTime() < 86400000).slice(0, 8);
  const newTodayIds = new Set(newToday.map(p => p.id));
  const restProfiles = profiles.filter(p => !newTodayIds.has(p.id));

  const bnClass = isBD ? "font-bn" : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <span aria-hidden>{region.flag}</span>
                  <span className="hidden sm:inline">{region.label}</span>
                  <Globe className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {REGION_LIST.map((r) => (
                  <DropdownMenuItem key={r} asChild>
                    <Link to={r === "bd" ? "/" : `/${r}`} className="flex items-center gap-2">
                      <span>{REGIONS[r].flag}</span>
                      <span>{REGIONS[r].label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/pricing" className="hidden rounded-full px-4 py-2 text-sm font-medium hover:bg-secondary sm:block">{region.cta.pricing}</Link>
            <Link to="/auth"><Button variant="ghost" size="sm">{region.cta.signIn}</Button></Link>
            <Link to="/discover"><Button size="sm" className="gradient-rose text-primary-foreground">{region.cta.browseFree}</Button></Link>
          </div>
        </div>
      </header>

      <div className="container pt-3"><TopBanner /></div>

      {/* HERO with live profile preview */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-cream" />
        <div className="pointer-events-none absolute -left-10 -top-10 -z-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl md:-left-20 md:h-72 md:w-72 md:top-20" />
        <div className="pointer-events-none absolute -right-10 top-10 -z-10 h-48 w-48 rounded-full bg-accent/25 blur-3xl md:-right-20 md:h-72 md:w-72 md:top-40" />

        <div className="container py-4 md:py-12">
          <div className="mx-auto max-w-3xl animate-fade-up text-center md:text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground md:text-xs">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className={bnClass}>{region.copy.eyebrow}</span>
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] tracking-tight md:mt-4 md:text-6xl">
              {region.copy.titlePrefix} <span className={`text-gradient ${bnClass}`}>{region.copy.titleHighlight}</span> biodata
            </h1>
          </div>

          <div className="mx-auto mt-4 max-w-4xl animate-fade-up md:mt-6">
            <CompactFilterBar
              filters={filters}
              applied={applied}
              liveCount={profiles.length}
              onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
              onSearch={() => setApplied(filters)}
              countries={region.countries}
              locationLabel={region.locationLabel}
            />
          </div>
        </div>

        {/* NEW TODAY RAIL — kept inside hero so visible above the fold */}
        {newToday.length > 0 && (
          <div className="container pb-6 md:pb-10">
            <ProfileRail profiles={newToday} title={region.copy.newTodayHeading} subtitle={region.copy.newTodaySubtitle} titleClassName={bnClass} />
          </div>
        )}
      </section>

      {/* Native ad between rail and grid */}
      <div className="container py-2"><AdNative /></div>

      {/* MORE PROFILES — continues from rail, no duplicates */}
      <section className="container py-6">
        <div className="mb-4 flex items-end justify-between">
          <h2 className={`font-display text-xl font-semibold text-foreground/90 md:text-2xl ${bnClass}`}>
            {newToday.length > 0 ? region.copy.moreHeading : region.copy.titleHighlight}
          </h2>
          <Link to={regionSlug === "bd" ? "/explore" : `/${regionSlug}/explore`} className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              {region.cta.exploreMode} <ArrowRight className="ml-1 h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>

        {profiles.length === 0 && loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border/50 bg-card animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-[3/4] w-full bg-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className={`rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground ${bnClass}`}>
            {region.cta.noMatches}
          </div>
        ) : restProfiles.length === 0 && newToday.length > 0 ? (
          <div className={`rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground ${bnClass}`}>
            {region.copy.endOfList}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restProfiles.map((p, i) => (
              <div key={p.id} className="contents">
                <ProfileCard profile={p as any} priority={i < 4} />
                {((i + 1) % 6 === 0 || (i + 1) % 10 === 0 || (i + 1) % 15 === 0) && (
                  <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                    <InFeedAd index={i} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <InfiniteSentinel onHit={loadMore} enabled={hasMore && !loading} />
        <div className="mt-8 flex justify-center" aria-live="polite">
          {loading && profiles.length > 0 ? (
            <span className={`text-sm text-muted-foreground ${bnClass}`}>{region.copy.loadingMore}</span>
          ) : !hasMore && profiles.length > 0 ? (
            <span className={`text-sm text-muted-foreground ${bnClass}`}>{region.copy.endOfList}</span>
          ) : null}
        </div>
      </section>

      {/* SIGNUP CTA BAND */}
      <section className="container py-16">
        <div className="rounded-3xl gradient-hero p-10 text-center text-primary-foreground shadow-soft md:p-14">
          <h2 className={`font-display text-3xl font-bold md:text-4xl ${bnClass}`}>{region.cta.signupBandTitle}</h2>
          <p className={`mx-auto mt-3 max-w-xl text-primary-foreground/90 ${bnClass}`}>{region.cta.signupBandSubtitle}</p>
          <Link to="/auth" className="mt-6 inline-block">
            <Button size="lg" variant="secondary" className={`bg-background text-foreground hover:bg-background/90 ${bnClass}`}>
              {region.cta.createFreeAccount} <ArrowRight className="ml-1 h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={`font-display text-4xl font-bold md:text-5xl ${bnClass}`}>{region.cta.howTitle}</h2>
          <p className={`mt-4 text-muted-foreground ${bnClass}`}>{region.cta.howSubtitle}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: region.cta.step1Title, d: region.cta.step1Desc },
            { n: "02", t: region.cta.step2Title, d: region.cta.step2Desc },
            { n: "03", t: region.cta.step3Title, d: region.cta.step3Desc },
          ].map((s) => (
            <div key={s.n} className="glossy-card p-6">
              <div className="font-display text-3xl text-primary">{s.n}</div>
              <h3 className={`mt-2 font-display text-xl font-semibold ${bnClass}`}>{s.t}</h3>
              <p className={`mt-2 text-sm text-muted-foreground ${bnClass}`}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREMIUM OFFER (Bengali, USDT) — BD only */}
      {isBD && (
      <section className="bg-secondary/40 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary font-bn">
              🎉 সীমিত লঞ্চ অফার
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl font-bn">প্রিমিয়াম — আজীবন সুবিধা, একবারেই</h2>
            <p className="mt-4 text-muted-foreground font-bn">এখন সব ফিচার ফ্রি — কিন্তু লঞ্চ অফার শেষ হওয়ার আগে লাইফটাইম প্রিমিয়াম লক করে নিন।</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
            {[
              {
                name: "মান্থলি প্রিমিয়াম",
                price: "৫",
                per: "/ মাস",
                tag: null as string | null,
                highlight: false,
              },
              {
                name: "লাইফটাইম প্রিমিয়াম",
                price: "৯",
                per: "একবারেই",
                tag: "Best value · ৯৫% সাশ্রয়",
                highlight: true,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl border p-6 transition ${
                  p.highlight
                    ? "border-primary bg-card shadow-soft glow-rose md:scale-[1.02]"
                    : "border-border bg-card"
                }`}
              >
                {p.tag && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> {p.tag}
                  </div>
                )}
                <div className="font-display text-xl font-semibold font-bn">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{p.price}</span>
                  <span className="font-semibold text-primary">USDT</span>
                  <span className="text-muted-foreground font-bn">{p.per}</span>
                </div>
                <ul className="mt-5 space-y-2.5 text-sm">
                  <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="font-bn">আজীবন বিজ্ঞাপন-মুক্ত (Ad-Free) ব্রাউজিং</span></li>
                  <li className="flex items-start gap-2"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="font-bn">পাত্রীদের সাথে সরাসরি যোগাযোগ — WhatsApp / কল / মেসেজ CTA সব সময় কাজ করবে</span></li>
                  <li className="flex items-start gap-2"><Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="font-bn">সব প্রোফাইলে আনলিমিটেড অ্যাক্সেস — কোনো লক নেই</span></li>
                  <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="font-bn">আনলিমিটেড ফেভারিট সংরক্ষণ</span></li>
                  <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="font-bn">প্রায়োরিটি সাপোর্ট</span></li>
                </ul>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground font-bn">
            BSC (BEP-20) নেটওয়ার্কে USDT পেমেন্ট · অ্যাডমিন ম্যানুয়ালি ভেরিফাই করবে · কয়েক ঘণ্টায় অ্যাক্টিভ
          </p>

          <div className="mt-8 text-center">
            <Link to="/pricing#pay">
              <Button size="lg" className="gradient-rose text-primary-foreground font-bn">
                প্রিমিয়াম পান — মাত্র ৯ USDT <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* TESTIMONIAL */}
      <section className="container py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-card p-10 shadow-soft">
          <div className="flex gap-1 text-accent">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
          </div>
          <blockquote className={`mt-6 font-display text-2xl font-medium leading-snug md:text-3xl ${bnClass}`}>
            "{region.cta.testimonialQuote}"
          </blockquote>
          <div className={`mt-6 text-sm text-muted-foreground ${bnClass}`}>{region.cta.testimonialAuthor}</div>
        </div>
      </section>

      <div className="container flex justify-center py-6 md:hidden"><AdBanner size="300x250" /></div>
      <div className="container hidden py-6 md:block"><AdBanner size="468x60" /></div>

      <footer className={`border-t border-border/60 py-8 text-center text-sm text-muted-foreground ${bnClass}`}>
        © {new Date().getFullYear()} ProthomAlap · {region.cta.footerNote}
      </footer>

      <AdSocialBar />
      <StickyBottomBar />
    </div>
  );
};

function InfiniteSentinel({ onHit, enabled }: { onHit: () => void; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onHit();
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, onHit]);
  return <div ref={ref} aria-hidden className="h-1 w-full" />;
}

export default Landing;
