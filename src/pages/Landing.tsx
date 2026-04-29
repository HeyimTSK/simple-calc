import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckCircle2, PieChart, Sparkles, MessageCircle,
  AlertTriangle, TrendingUp, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const ctaTo = user ? "/app" : "/auth";

  const features = [
    { icon: PieChart, title: "Clear money picture", desc: "See income vs expenses, savings rate, and EMI burden in beautiful, simple charts." },
    { icon: Sparkles, title: "AI advisor", desc: "Personalized, prioritized action steps — based on your actual numbers, not generic templates." },
    { icon: MessageCircle, title: "24/7 chat coach", desc: "Ask anything: 'Can I afford this loan?', 'Should I start SIP?'. Get answers grounded in your finances." },
    { icon: AlertTriangle, title: "Risk alerts", desc: "Get warned about high EMIs, missing insurance, or no emergency fund — before they hurt." },
    { icon: TrendingUp, title: "Smart recommendations", desc: "Emergency fund plan, insurance guidance, SIP suggestions — tailored, never pushy." },
    { icon: ShieldCheck, title: "Private by default", desc: "Your financial data is encrypted and only visible to you. We never sell or share." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="font-semibold tracking-tight text-primary">Smart Planner</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
            <Link to={ctaTo}>{user ? "Open app" : "Sign in"}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-20 md:pb-28">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built for Indian households · ₹20K to ₹10L+ income
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-primary">
            Your personal financial coach,<br />in your pocket.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Honest, plain-English money advice powered by AI. No jargon, no sales — just clear next steps for emergency funds, EMIs, insurance, and SIPs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild size="lg"
              className="h-12 px-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base"
            >
              <Link to={ctaTo}>
                Get started — it's free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Free to use</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Private & secure</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> No ads</span>
          </div>
        </div>

        {/* Stat preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-4">
          <div className="border border-border rounded-2xl p-6 bg-card">
            <p className="text-xs text-muted-foreground font-medium mb-2">Health score</p>
            <p className="text-4xl font-bold tracking-tight text-primary">82</p>
            <p className="text-xs text-primary mt-2">Excellent · ↑ 6 from last month</p>
          </div>
          <div className="border border-border rounded-2xl p-6 bg-card">
            <p className="text-xs text-muted-foreground font-medium mb-2">Savings rate</p>
            <p className="text-4xl font-bold tracking-tight text-primary">28%</p>
            <p className="text-xs text-muted-foreground mt-2">Goal: 30% · Almost there</p>
          </div>
          <div className="border border-border rounded-2xl p-6 bg-card">
            <p className="text-xs text-muted-foreground font-medium mb-2">Emergency fund</p>
            <p className="text-4xl font-bold tracking-tight text-primary">5.2 mo</p>
            <p className="text-xs text-primary mt-2">Fully covered ✓</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-primary">
              Built for real Indian life
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you earn ₹25,000 or ₹2 lakh a month — get advice that actually fits your situation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-border rounded-2xl p-6 bg-card hover:border-primary/40 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5 text-primary">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="border border-border rounded-3xl p-10 md:p-16 text-center bg-card">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-primary">
              Take charge of your money today
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              5-minute setup. No credit card. Get your personalized financial plan instantly.
            </p>
            <Button
              asChild size="lg"
              className="h-12 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base"
            >
              <Link to={ctaTo}>
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <p className="text-center text-xs text-muted-foreground">
            ⚠️ Smart Planner provides AI-generated guidance, not professional financial advice. For major decisions, consult a SEBI-registered advisor.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
