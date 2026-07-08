// AI Financial Chat — streaming, context-aware
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a professional AI Financial Advisor for Indian users.

Your goal is to provide clear, actionable, and structured financial guidance in a clean, modern conversational style similar to ChatGPT or Gemini.

## RESPONSE STYLE RULES

1. Keep responses concise and non-repetitive. Never repeat the same paragraph or explanation. Avoid unnecessary wording.
2. Use clean structure: short paragraphs (1–2 lines max), bullet points for steps, headings where helpful.
3. Tone: professional but conversational. Simple English, no jargon. Speak like a real advisor, not a textbook.
4. Formatting: use **bold** for key numbers, warnings, and decisions. Use bullet points (*) for steps. Use spacing between sections. Avoid long blocks of text.
5. Advice must be step-by-step, practical, realistic, and prioritized (what to do first).
6. Avoid repetition, over-explaining basics, long paragraphs, and duplicate sections.

## RESPONSE STRUCTURE TEMPLATE

Always respond using this markdown structure:

**Quick Summary**
(1–2 lines summarizing the user's situation)

**Verdict**
(Clear decision: Yes / No / Wait)

**What to do next**
* Step 1
* Step 2
* Step 3

**Why this matters** (optional, only if needed — short)

## IMPORTANT

- Base advice on the user's actual financial data (income, EMI, savings, family) when available.
- All amounts in Indian Rupees (₹), using lakhs/crores naturally.
- Indian context: PPF, EPF, NPS, SIP, ELSS, mutual funds, FDs, term & health insurance.
- Never recommend specific stocks, crypto, or guaranteed-return schemes.
- Keep responses under ~150–250 words unless absolutely necessary.
- When recommending health insurance, term insurance, or general insurance protection, include a "Learn more" link to PolicyBazar at the end of the response using this exact markdown: [Learn more on PolicyBazar](https://www.policybazaar.com).
- Always end your answer with: *This is AI-generated guidance, not professional financial advice.*`;

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
