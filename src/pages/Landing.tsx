import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles, ShieldCheck, MessageCircle, TrendingUp, PieChart,
  AlertTriangle, ArrowRight, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const ctaTo = user ? "/app" : "/auth";

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="container py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">Smart Planner</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to={ctaTo}>{user ? "Open app" : "Sign in"}</Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="container pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Built for Indian households · ₹20K to ₹10L+ income
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight mb-6 animate-slide-up">
            Your personal{" "}
            <span className="gradient-text">financial coach</span>,
            <br />in your pocket.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Honest, plain-English money advice powered by AI. No jargon, no sales — just clear next steps for emergency funds, EMIs, insurance, and SIPs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant text-base [&]:bg-gradient-primary"
            >
              <Link to={ctaTo}>
                {user ? "Open dashboard" : "Get started — it's free"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Free to use</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> Private & secure</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No ads</div>
          </div>
        </div>

        {/* Floating preview card */}
        <div className="mt-16 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <Card className="relative p-6 md:p-8 border-border/60 shadow-elegant bg-gradient-card">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Health score</p>
                  <p className="text-3xl font-display font-bold text-success">82</p>
                  <p className="text-xs text-success mt-1">Excellent · ↑ 6 from last month</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Savings rate</p>
                  <p className="text-3xl font-display font-bold">28%</p>
                  <p className="text-xs text-muted-foreground mt-1">Goal: 30% · Almost there</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Emergency fund</p>
                  <p className="text-3xl font-display font-bold">5.2 mo</p>
                  <p className="text-xs text-success mt-1">Fully covered ✓</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 border-t border-border">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Built for real Indian life</h2>
          <p className="text-muted-foreground text-lg">
            Whether you earn ₹25,000 or ₹2 lakh a month — get advice that actually fits your situation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: PieChart, title: "Clear money picture", desc: "See income vs expenses, savings rate, and EMI burden in beautiful, simple charts." },
            { icon: Sparkles, title: "AI advisor", desc: "Personalized, prioritized action steps — based on your actual numbers, not generic templates." },
            { icon: MessageCircle, title: "24/7 chat coach", desc: "Ask anything: 'Can I afford this loan?', 'Should I start SIP?'. Get answers grounded in your finances." },
            { icon: AlertTriangle, title: "Risk alerts", desc: "Get warned about high EMIs, missing insurance, or no emergency fund — before they hurt." },
            { icon: TrendingUp, title: "Smart recommendations", desc: "Emergency fund plan, insurance guidance, SIP suggestions — tailored, never pushy." },
            { icon: ShieldCheck, title: "Private by default", desc: "Your financial data is encrypted and only visible to you. We never sell or share." },
          ].map((f) => (
            <Card key={f.title} className="p-6 border-border/60 hover:shadow-soft transition-smooth group">
              <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="relative overflow-hidden p-10 md:p-16 text-center bg-gradient-hero border-0 shadow-elegant">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)] opacity-10" />
          <h2 className="relative text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Take charge of your money today
          </h2>
          <p className="relative text-primary-foreground/85 text-lg mb-8 max-w-xl mx-auto">
            5-minute setup. No credit card. Get your personalized financial plan instantly.
          </p>
          <Button asChild size="lg" variant="secondary" className="relative h-12 px-8 text-base shadow-soft">
            <Link to={ctaTo}>
              Start free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>

      <footer className="container py-10 border-t border-border">
        <p className="text-center text-xs text-muted-foreground">
          ⚠️ Smart Planner provides AI-generated guidance, not professional financial advice. For major decisions, consult a SEBI-registered advisor.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
