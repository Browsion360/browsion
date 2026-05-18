import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Crown, Copy, ShieldCheck, Infinity as InfinityIcon, MessageCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { USDT_ADDRESS, USDT_NETWORK, USDT_PRICES } from "@/lib/plan";
import { toast } from "sonner";

type Tier = "monthly" | "lifetime";

const TIERS: { id: Tier; name: string; price: number; per: string; tag?: string; highlight?: boolean }[] = [
  { id: "monthly", name: "মান্থলি প্রিমিয়াম", price: USDT_PRICES.monthly, per: "/ মাস" },
  { id: "lifetime", name: "লাইফটাইম প্রিমিয়াম", price: USDT_PRICES.lifetime, per: "একবারেই", tag: "Best value · ৯৫% সাশ্রয়", highlight: true },
];

const BENEFITS = [
  { icon: ShieldCheck, label: "আজীবন বিজ্ঞাপন-মুক্ত (Ad-Free) ব্রাউজিং" },
  { icon: MessageCircle, label: "পাত্রীদের সাথে সরাসরি যোগাযোগ — WhatsApp / কল / মেসেজ সব সময়" },
  { icon: InfinityIcon, label: "সব প্রোফাইলে আনলিমিটেড অ্যাক্সেস ও ফেভারিট" },
  { icon: Crown, label: "প্রায়োরিটি সাপোর্ট" },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Tier>("lifetime");
  const [email, setEmail] = useState(user?.email ?? "");
  const [txn, setTxn] = useState("");
  const [busy, setBusy] = useState(false);
  const payRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to payment box when arriving with #pay
  useEffect(() => {
    if (window.location.hash === "#pay") {
      setTimeout(() => payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(USDT_ADDRESS);
      toast.success("USDT অ্যাড্রেস কপি হয়েছে ✅");
    } catch {
      toast.error("কপি করা যায়নি — অনুগ্রহ করে ম্যানুয়ালি কপি করুন");
    }
  };

  const submit = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!txn.trim()) { toast.error("আপনার TXN hash দিন"); return; }
    if (!email.trim()) { toast.error("আপনার ইমেইল দিন"); return; }
    setBusy(true);
    const { error } = await supabase.from("payment_requests").insert({
      user_id: user.id,
      plan: "explorer",
      amount: USDT_PRICES[selected],
      sender_number: email.trim(),
      txn_id: txn.trim(),
      note: `USDT-BSC | ${selected} | ${USDT_PRICES[selected]} USDT | ${txn.trim()}`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("পেমেন্ট জমা হয়েছে। অ্যাডমিন ভেরিফাই করে কয়েক ঘণ্টায় অ্যাক্টিভ করবে।");
    setTxn("");
  };

  const scrollToPay = () => payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary font-bn">
            <Crown className="h-3.5 w-3.5" /> সীমিত লঞ্চ অফার
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl font-bn">প্রিমিয়াম আজীবন — মাত্র ২ মাসের দামে</h1>
          <p className="mt-3 text-muted-foreground font-bn">এখন সব ফিচার ফ্রি। দাম বাড়ার আগে আজীবন প্রিমিয়াম লক করে নিন।</p>
        </div>

        {/* Tier cards */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TIERS.map(t => {
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setSelected(t.id); scrollToPay(); }}
                className={`text-left rounded-3xl border p-6 transition bg-card ${active ? "border-primary shadow-soft ring-2 ring-primary/30" : "border-border"}`}
              >
                {t.tag && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary font-bn">
                    <Crown className="h-3 w-3" /> {t.tag}
                  </div>
                )}
                <div className="font-display text-xl font-semibold font-bn">{t.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{t.price}</span>
                  <span className="font-semibold text-primary">USDT</span>
                  <span className="text-muted-foreground font-bn">{t.per}</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {BENEFITS.map(b => (
                    <li key={b.label} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span className="font-bn">{b.label}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-5 rounded-xl border px-3 py-2 text-xs font-medium font-bn ${active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
                  {active ? "✓ নির্বাচিত" : "এই প্ল্যান নির্বাচন করুন"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Payment box */}
        <div ref={payRef} id="pay" className="mt-8 scroll-mt-24 rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-soft glow-rose">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold font-bn">USDT দিয়ে পেমেন্ট করুন</h2>
              <p className="mt-1 text-sm text-muted-foreground font-bn">
                ঠিক <span className="font-bold text-foreground">{USDT_PRICES[selected]} USDT</span> পাঠান <span className="font-bold text-foreground">{USDT_NETWORK}</span> নেটওয়ার্কে।
              </p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{USDT_NETWORK}</span>
          </div>

          {/* USDT address — main visual focus */}
          <div className="mt-5 rounded-2xl border-2 border-dashed border-primary bg-primary/5 p-4">
            <Label className="text-xs uppercase tracking-wider text-primary font-bn">📋 আমাদের USDT অ্যাড্রেস (এখানে পাঠাবেন)</Label>
            <div className="mt-2 flex items-stretch gap-2">
              <code className="flex-1 break-all rounded-xl bg-background px-3 py-3 font-mono text-xs sm:text-sm">{USDT_ADDRESS}</code>
              <Button onClick={copyAddress} className="shrink-0 gradient-rose text-primary-foreground font-bn">
                <Copy className="mr-1 h-4 w-4" /> কপি
              </Button>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-bn">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>সাবধান:</strong> শুধুমাত্র <strong>USDT (BEP-20)</strong> টোকেন <strong>BSC (Binance Smart Chain)</strong> নেটওয়ার্কে পাঠাবেন। ভুল নেটওয়ার্কে পাঠালে টাকা হারাবেন — ফেরত দেওয়া সম্ভব না।</span>
            </div>
          </div>

          {/* Step-by-step Bengali instructions */}
          <div className="mt-6">
            <h3 className="mb-3 font-display text-base font-semibold font-bn">কিভাবে পেমেন্ট করবেন — ধাপে ধাপে</h3>
            <ol className="space-y-3">
              {[
                { n: "১", t: "ওয়ালেট খুলুন", d: `Binance / Trust Wallet / MetaMask — যেখানে আপনার USDT আছে সেটা খুলুন। নিশ্চিত করুন নেটওয়ার্ক "BSC" বা "BNB Smart Chain" সিলেক্ট করা আছে।` },
                { n: "২", t: "অ্যাড্রেস কপি করুন", d: `উপরের "কপি" বাটনে চাপ দিয়ে আমাদের USDT অ্যাড্রেস কপি করুন এবং ওয়ালেটের "Send / পাঠান" অপশনে পেস্ট করুন।` },
                { n: "৩", t: "এক্স্যাক্ট অ্যামাউন্ট পাঠান", d: `ঠিক ${USDT_PRICES[selected]} USDT লিখুন (কম বা বেশি না)। কনফার্ম করে পাঠিয়ে দিন।` },
                { n: "৪", t: "TXN Hash কপি করুন", d: `পাঠানো হলে ওয়ালেট একটা "Transaction Hash" বা "TXID" দিবে — এটা 0x দিয়ে শুরু হওয়া লম্বা একটা কোড। সেটা কপি করুন।` },
                { n: "৫", t: "নিচের ফর্ম পূরণ করুন", d: `আপনার ইমেইল ও TXN Hash নিচের ফর্মে দিয়ে "Submit" করুন। আমরা ২-৩ ঘণ্টার মধ্যে ভেরিফাই করে আপনার অ্যাকাউন্ট প্রিমিয়াম করে দিব।` },
              ].map((s) => (
                <li key={s.n} className="flex gap-3 rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{s.n}</div>
                  <div>
                    <div className="font-semibold font-bn">{s.t}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground font-bn">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Submit form */}
          <div className="mt-6 rounded-2xl border border-border bg-background p-4">
            <h3 className="mb-3 font-display text-base font-semibold font-bn">পেমেন্ট কনফার্ম করুন</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="font-bn">আপনার ইমেইল</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label className="font-bn">TXN Hash (লেনদেনের কোড)</Label>
                <Input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="0x…" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground font-bn">আমরা অন-চেইন ভেরিফাই করি · কয়েক ঘণ্টায় অ্যাক্টিভ</p>
              <Button disabled={busy} onClick={submit} size="lg" className="gradient-rose text-primary-foreground font-bn">
                {busy ? "জমা হচ্ছে…" : `সাবমিট · ${USDT_PRICES[selected]} USDT`}
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground font-bn">
          বর্তমানে সব ফিচার সবার জন্য ফ্রি। প্রিমিয়াম খুব শীঘ্রই চালু হবে — আজীবন অ্যাক্সেস আজই লক করুন।
        </p>
      </div>
    </AppShell>
  );
};

export default Pricing;
