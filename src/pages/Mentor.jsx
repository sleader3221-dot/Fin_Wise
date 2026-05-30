import { useEffect, useMemo, useRef, useState } from "react";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import { Bot, Brain, Loader2, Plus, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { ensureUserProgress, getBudgetAnalytics, getGoalAnalytics, getPortfolioAnalytics, mentorReply, money } from "@/lib/finance";

const SUGGESTIONS = [
  "What should I fix first?",
  "How do I improve my budget?",
  "Which savings goal is most urgent?",
  "How risky is my portfolio?",
  "Explain compound interest with my numbers"
];

export default function Mentor() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const load = async () => {
      await ensureUserProgress(db, user.id);
      const [convs, budgetRows, goalRows, holdingRows] = await Promise.all([
        db.agents.listConversations({ agent_name: `financial_mentor_${user.id}` }),
        db.entities.BudgetEntry.filter({ user_id: user.id }, "-date", 200),
        db.entities.SavingsGoal.filter({ user_id: user.id }, "-created_date"),
        db.entities.StockPortfolio.filter({ user_id: user.id })
      ]);

      let conv = convs[0];
      if (!conv) {
        conv = await db.agents.createConversation({
          agent_name: `financial_mentor_${user.id}`,
          metadata: { name: "FinWise Mentor" },
          messages: [
            {
              role: "assistant",
              content: "I am your local FinWise mentor. I use your budget, goals, and paper portfolio from this browser to give educational coaching. I do not provide financial advice, but I can help you learn and plan."
            }
          ]
        });
      }

      if (!cancelled) {
        setConversation(conv);
        setMessages(conv.messages || []);
        setEntries(budgetRows);
        setGoals(goalRows);
        setPortfolio(holdingRows);
        setLoading(false);
      }
    };

    load();
    const reload = () => load();
    window.addEventListener("finwise:data", reload);
    window.addEventListener("storage", reload);
    return () => {
      cancelled = true;
      window.removeEventListener("finwise:data", reload);
      window.removeEventListener("storage", reload);
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const analytics = useMemo(() => {
    const budget = getBudgetAnalytics(entries);
    const goalRows = getGoalAnalytics(goals, Math.max(0, budget.balance));
    const holdingRows = portfolio.map((holding) => ({
      ...holding,
      value: Number(holding.shares || 0) * Number(holding.current_price || holding.buy_price || 0)
    }));
    return {
      budget,
      goals: goalRows,
      portfolio: getPortfolioAnalytics(holdingRows)
    };
  }, [entries, goals, portfolio]);

  const startNewConversation = async () => {
    const conv = await db.agents.createConversation({
      agent_name: `financial_mentor_${user.id}`,
      metadata: { name: "FinWise Mentor" },
      messages: []
    });
    setConversation(conv);
    setMessages([]);
  };

  const appendMessage = async (message) => {
    setMessages((prev) => [...prev, message]);
    await db.agents.addMessage(conversation, message);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation) return;
    setInput("");
    setSending(true);

    await appendMessage({ role: "user", content: msg });
    const reply = mentorReply({ question: msg, analytics });
    window.setTimeout(async () => {
      await appendMessage({ role: "assistant", content: reply });
      setSending(false);
    }, 350);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold">FinWise Mentor</h1>
            <p className="text-xs text-muted-foreground">Local AI-style coach powered by your live app data</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={startNewConversation} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Chat
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 md:px-8 py-3 border-b bg-background">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Health</p>
          <p className="font-bold">{analytics.budget.score}/100</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Cash Flow</p>
          <p className="font-bold">{money(analytics.budget.balance)}</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Risk</p>
          <p className="font-bold truncate">{analytics.portfolio.riskLevel}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold mb-2">Ask the mentor</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                It can explain finance concepts and connect them to your live budget, goals, and paper trading data.
              </p>
            </div>
          </div>
        )}

        {messages.filter((message) => message.role !== "system").map((msg, index) => (
          <div key={`${msg.role}-${index}`} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border rounded-bl-sm")}>
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 px-4 md:px-8 py-4 border-t border-border bg-card">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} onClick={() => sendMessage(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors">
              {suggestion}
            </button>
          ))}
          <Badge variant="outline" className="gap-1 whitespace-nowrap">
            <Sparkles className="w-3 h-3" /> live context
          </Badge>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about budgeting, saving, credit, investing, or your next move..."
            className="flex-1 h-11"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !input.trim()} size="icon" className="w-11 h-11 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
