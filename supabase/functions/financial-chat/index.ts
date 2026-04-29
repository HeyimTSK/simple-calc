// AI Financial Chat — streaming, context-aware
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Smart Financial Planner AI", a friendly personal finance coach for Indian users across all income levels (₹20,000 to ₹10,00,000+ per month).

RULES:
- Use simple, beginner-friendly Indian English. Avoid jargon. If you must use a term (SIP, ELSS, EMI), explain it in 5 words.
- All amounts in Indian Rupees (₹) using lakhs/crores when natural.
- Be practical and actionable. Give step-by-step plans, not vague advice.
- Reference the user's actual numbers (income, EMI, savings) when given.
- Indian context: PPF, EPF, NPS, SIP, ELSS, mutual funds, FDs, term insurance, health insurance.
- Never recommend specific stocks, crypto coins, or guaranteed-return schemes.
- Always end risky-topic answers with: "This is AI guidance, not professional financial advice."
- Keep responses concise — 3-6 short paragraphs or bullet lists. Use markdown.

PRIORITY OF ADVICE (in order):
1. Cover basic expenses & avoid debt traps
2. Build emergency fund (3-6 months of expenses)
3. Get health insurance (and term insurance if dependents)
4. Pay off high-interest loans (credit card, personal loans)
5. Start investing — SIPs in index/diversified mutual funds
6. Tax-saving via ELSS / PPF / NPS once stable`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch full household context
    const [{ data: fp }, { data: family }, { data: assets }, { data: liab }, { data: goals }] = await Promise.all([
      supabase.from("financial_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("family_members").select("*").eq("user_id", user.id),
      supabase.from("assets").select("*").eq("user_id", user.id),
      supabase.from("liabilities").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
    ]);

    let contextBlock = "The user has not yet completed onboarding — ask gentle questions to understand their situation.";
    if (fp && fp.onboarding_completed) {
      const n = (x: any) => Number(x) || 0;
      const totalExp = n(fp.rent) + n(fp.food) + n(fp.utilities) + n(fp.family_support) + n(fp.emi_amount);
      const surplus = n(fp.monthly_salary) - totalExp;
      const totalAssets = (assets || []).reduce((s: number, a: any) => s + n(a.current_value), 0);
      const totalLiab = (liab || []).reduce((s: number, l: any) => s + n(l.outstanding), 0);
      const fmt = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;

      const familyLines = (family || []).map((m: any) => {
        if (m.relation === "spouse") return `  - Spouse ${m.name} (age ${m.age}): income ${fmt(n(m.monthly_income))}/mo, expenses ${fmt(n(m.monthly_expenses))}/mo, investments ${fmt(n(m.investments))}, insurance ${m.insurance_type}`;
        if (m.relation === "child") return `  - Child ${m.name} (age ${m.age}): ${m.education_goal} target ${m.education_target_year}`;
        return `  - Parent ${m.name} (age ${m.age}): medical ${fmt(n(m.monthly_medical_expense))}/mo, health insured: ${m.has_health_insurance}, dependency: ${m.dependency_level}`;
      }).join("\n") || "  (none added)";

      const goalLines = (goals || []).map((g: any) => `  - ${g.name} (${g.type}) by ${g.target_year}: cost today ${fmt(n(g.current_cost))}, current SIP ${fmt(n(g.monthly_contribution))}/mo`).join("\n") || "  (none set)";

      contextBlock = `USER'S COMPLETE HOUSEHOLD FINANCIAL SNAPSHOT (use these exact numbers):

PRIMARY USER (age ${fp.current_age || 30}, retire at ${fp.retirement_age || 60}):
- Monthly income: ${fmt(n(fp.monthly_salary))}
- Expenses: rent ${fmt(n(fp.rent))}, food ${fmt(n(fp.food))}, utilities ${fmt(n(fp.utilities))}, family support ${fmt(n(fp.family_support))}, EMI ${fmt(n(fp.emi_amount))} (loans outstanding ${fmt(n(fp.existing_loans))})
- Total monthly expenses: ${fmt(totalExp)} | Monthly surplus: ${fmt(surplus)}
- Savings ${fmt(n(fp.savings))} | Investments ${fmt(n(fp.investments))} (${(fp.investment_types || []).join(", ") || "none"})
- Insurance: ${fp.insurance_type} | Dependents: ${fp.dependents}
- Emergency fund: ${fp.has_emergency_fund ? fmt(n(fp.emergency_fund_amount)) : "none"}

FAMILY MEMBERS:
${familyLines}

NET WORTH:
- Total assets: ${fmt(totalAssets)} (${(assets || []).length} items)
- Total liabilities: ${fmt(totalLiab)} (${(liab || []).length} items)
- Net worth: ${fmt(totalAssets - totalLiab)}

LIFE GOALS:
${goalLines}

When giving advice, reference the household — not just the primary user. Consider dependents, parents' medical needs, and children's education timelines.`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextBlock },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in your Lovable workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
