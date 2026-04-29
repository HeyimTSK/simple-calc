// AI Financial Recommendations — returns structured JSON action plan
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: fp } = await supabase
      .from("financial_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!fp || !fp.onboarding_completed) {
      return new Response(JSON.stringify({ error: "Complete onboarding first" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalExp = Number(fp.rent) + Number(fp.food) + Number(fp.utilities) + Number(fp.family_support) + Number(fp.emi_amount);
    const surplus = Number(fp.monthly_salary) - totalExp;

    const userContext = `User's monthly income: ₹${Number(fp.monthly_salary).toLocaleString("en-IN")}
Total monthly expenses: ₹${totalExp.toLocaleString("en-IN")} (rent ₹${fp.rent}, food ₹${fp.food}, utilities ₹${fp.utilities}, family ₹${fp.family_support}, EMI ₹${fp.emi_amount})
Surplus: ₹${surplus.toLocaleString("en-IN")}
Savings: ₹${Number(fp.savings).toLocaleString("en-IN")}
Investments: ₹${Number(fp.investments).toLocaleString("en-IN")} in ${(fp.investment_types || []).join(", ") || "none"}
Insurance: ${fp.insurance_type}
Dependents: ${fp.dependents}
Emergency fund: ${fp.has_emergency_fund ? `₹${Number(fp.emergency_fund_amount).toLocaleString("en-IN")}` : "none"}
Existing loans: ₹${Number(fp.existing_loans).toLocaleString("en-IN")}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an Indian personal finance coach. Generate 4-6 personalized, prioritized recommendations for the user. Use simple language. Each recommendation must have a clear action and reason. Reference their actual numbers in rupees. Do not recommend specific stocks or crypto. Categories: emergency, insurance, debt, savings, investing, expenses.`,
          },
          { role: "user", content: userContext },
        ],
        tools: [{
          type: "function",
          function: {
            name: "give_recommendations",
            description: "Return prioritized financial recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short action title, max 8 words" },
                      category: { type: "string", enum: ["emergency", "insurance", "debt", "savings", "investing", "expenses"] },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      why: { type: "string", description: "1-2 sentence reason in simple language" },
                      steps: { type: "array", items: { type: "string" }, description: "2-4 concrete next steps" },
                      monthly_target: { type: "string", description: "Optional ₹ amount per month, or empty" },
                    },
                    required: ["title", "category", "priority", "why", "steps"],
                  },
                },
              },
              required: ["recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "give_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("Gateway:", t);
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { recommendations: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
