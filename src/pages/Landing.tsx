import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const ctaTo = user ? "/app" : "/auth";
  const [wide, setWide] = useState(false);
  const [offset, setOffset] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setWide(window.scrollY > 80);
      setOffset(window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { n: "01", title: "Money picture", desc: "Income, expenses, savings rate, EMI burden — in one frame." },
    { n: "02", title: "AI advisor", desc: "Plain-English action steps based on your numbers." },
    { n: "03", title: "Chat coach", desc: "Ask anything. Answers grounded in your finances." },
    { n: "04", title: "Risk alerts", desc: "Warnings before high EMIs or missing insurance hurt you." },
    { n: "05", title: "SIP planning", desc: "Tailored emergency fund and SIP suggestions." },
    { n: "06", title: "Private", desc: "Encrypted, only visible to you. Never sold." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero — leave room for top corner frame (logo TL, menu TR) */}
      <section ref={heroRef} className="relative px-6 md:px-12 pt-28 md:pt-32 pb-24 md:pb-32 min-h-[92vh] flex flex-col justify-between">
        <div>
          <p className="mono-label text-muted-foreground mb-10">
            Index / 001 — Personal Finance, Indian Households
          </p>
          <h1
            className={`kinetic-display ${wide ? "is-wide" : ""}`}
            style={{ fontSize: "clamp(3rem, 13vw, 16rem)" }}
          >
            MONEY,<br />FRAMED.
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-20">
          <div className="col-span-12 md:col-span-5">
            <p className="text-base md:text-lg leading-snug max-w-md">
              Honest, plain-English money advice powered by AI. No jargon. No sales.
              Clear next steps for emergency funds, EMIs, insurance, SIPs.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 md:col-start-9 flex md:justify-end items-end">
            <Link to={ctaTo} className="mono-label inline-flex items-center gap-2 kinetic-link">
              {user ? "Open Dashboard →" : "Begin →"}
            </Link>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-t border-foreground/15 px-6 md:px-12 py-24 md:py-32">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-2">
            <p className="mono-label text-muted-foreground">§ 002 — Thesis</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <p className="kinetic-display" style={{ fontSize: "clamp(1.75rem, 5.5vw, 5.5rem)" }}>
              Built for real Indian life — whether you earn ₹25,000 or ₹2,00,000 a month.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-foreground/15 px-6 md:px-12 py-24">
        <div className="grid grid-cols-12 gap-4 mb-16">
          <p className="mono-label text-muted-foreground col-span-12 md:col-span-2">§ 003 — Index</p>
          <h2 className="col-span-12 md:col-span-10 kinetic-display" style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}>
            Six instruments.
          </h2>
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-0 border-t border-foreground/15">
          {features.map((f) => (
            <div
              key={f.n}
              className="col-span-12 md:col-span-6 lg:col-span-4 border-b border-foreground/15 pt-8 pb-12 md:px-2 group"
            >
              <div className="flex items-start justify-between mb-12">
                <span className="mono-label text-muted-foreground">{f.n}</span>
                <span className="mono-label opacity-0 group-hover:opacity-100 transition-smooth text-primary">→</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 group-hover:text-primary transition-smooth">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Action */}
      <section className="border-t border-foreground/15 px-6 md:px-12 py-32 md:py-40 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute right-[-10%] top-1/2 mono-label text-muted-foreground/30 whitespace-nowrap pointer-events-none"
          style={{
            transform: `translate3d(${-offset * 0.1}px, -50%, 0)`,
            fontSize: "clamp(4rem, 12vw, 14rem)",
            letterSpacing: "0.02em",
          }}
        >
          ◆ ◆ ◆ ◆ ◆ ◆ ◆
        </div>
        <div className="grid grid-cols-12 gap-4 relative">
          <div className="col-span-12 md:col-span-8">
            <p className="mono-label text-muted-foreground mb-6">§ 004 — Action</p>
            <h2 className="kinetic-display" style={{ fontSize: "clamp(2.5rem, 9vw, 10rem)" }}>
              TAKE<br />CHARGE.
            </h2>
            <div className="mt-12">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-smooth border-0"
              >
                <Link to={ctaTo} className="mono-label">
                  {user ? "Open dashboard" : "Start free"} <ArrowRight className="ml-3 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — leave room for bottom corner frame */}
      <footer className="border-t border-foreground/15 px-6 md:px-12 py-12 pb-20">
        <div className="grid grid-cols-12 gap-4">
          <p className="col-span-12 md:col-span-6 mono-label text-muted-foreground">
            ⚠ AI-generated guidance, not professional financial advice.
          </p>
          <p className="col-span-12 md:col-span-6 md:text-right mono-label text-muted-foreground">
            Smart Planner / Mumbai · Bengaluru · Delhi
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
