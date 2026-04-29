import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Loader2, User as UserIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Msg = { id?: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Should I start a SIP?",
  "Can I afford a ₹5 lakh loan?",
  "How do I reduce my expenses?",
  "Best way to build emergency fund?",
  "Do I need term insurance?",
];

const Chat = () => {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    if (!user) return;
    supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at").then(({ data }) => {
      if (data) setMessages(data.map(d => ({ id: d.id, role: d.role as "user" | "assistant", content: d.content })));
      setLoaded(true);
    });
  }, [user]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = async (text: string) => {
    if (!text.trim() || streaming || !user || !session) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    // Persist user message
    supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: userMsg.content });

    let assistant = "";
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/financial-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (resp.status === 429) { toast.error("Slow down — too many requests. Wait a moment."); throw new Error("rate"); }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add credits in Lovable workspace."); throw new Error("credits"); }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistant } : m));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Persist assistant message
      if (assistant) {
        supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: assistant });
      }
    } catch (e: any) {
      setMessages(prev => prev.slice(0, -1));
      if (!["rate", "credits"].includes(e.message)) toast.error("Couldn't reach AI. Try again.");
    } finally {
      setStreaming(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([]);
    toast.success("Chat cleared");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">AI Coach</h1>
          <p className="text-muted-foreground text-sm mt-1">Ask anything about your money</p>
        </div>
        {messages.length > 0 && (
          <Button onClick={clearChat} variant="ghost" size="sm" className="text-muted-foreground">
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-border/60">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {loaded && messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft mb-4">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="font-display font-bold text-xl mb-1">Hi! I know your numbers.</h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                I'll give you straight answers about loans, savings, and investments — based on your actual financial situation.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-sm px-3 py-2 rounded-full border border-border bg-background hover:bg-primary-soft hover:border-primary/30 transition-smooth"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3 animate-fade-in", m.role === "user" ? "flex-row-reverse" : "")}>
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                m.role === "user" ? "bg-muted" : "bg-gradient-primary"
              )}>
                {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%] text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              )}>
                {m.content || (streaming && i === messages.length - 1 ? <span className="inline-flex gap-1"><span className="h-2 w-2 rounded-full bg-current animate-pulse" /><span className="h-2 w-2 rounded-full bg-current animate-pulse" style={{animationDelay: "150ms"}} /><span className="h-2 w-2 rounded-full bg-current animate-pulse" style={{animationDelay: "300ms"}} /></span> : "")}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 md:p-4 bg-card">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about loans, SIPs, expenses..."
              rows={1}
              className="resize-none min-h-11 max-h-32 rounded-xl"
              disabled={streaming}
            />
            <Button type="submit" disabled={!input.trim() || streaming} size="icon" className="h-11 w-11 rounded-xl bg-gradient-primary hover:opacity-90 flex-shrink-0">
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            AI guidance, not professional advice. Verify important decisions with a SEBI-registered advisor.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
