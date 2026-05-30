import { useEffect, useMemo, useState } from "react";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  DollarSign,
  Gauge,
  Lightbulb,
  PieChart,
  Plus,
  Radar,
  ShieldCheck,
  SlidersHorizontal,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, Cell, Pie, PieChart as RechartsPie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { ensureUserProgress, getBudgetAnalytics, money } from "@/lib/finance";

const INCOME_CATEGORIES = ["allowance", "part_time_job", "gifts", "other"];
const EXPENSE_CATEGORIES = ["food", "entertainment", "clothing", "transportation", "education", "savings", "subscriptions", "other"];

const CATEGORY_LIMITS = {
  food: 120,
  entertainment: 80,
  clothing: 75,
  transportation: 60,
  education: 100,
  savings: 9999,
  subscriptions: 35,
  other: 60
};

const CAT_COLORS = {
  allowance: "#22c55e",
  part_time_job: "#3b82f6",
  gifts: "#f59e0b",
  food: "#ef4444",
  entertainment: "#8b5cf6",
  clothing: "#ec4899",
  transportation: "#06b6d4",
  education: "#6366f1",
  savings: "#10b981",
  subscriptions: "#f97316",
  other: "#6b7280"
};

const cleanLabel = (value) => value.replace(/_/g, " ");

export default function Budget() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: "expense", category: "food", amount: "", description: "", date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const [whatIfCut, setWhatIfCut] = useState(10);
  const [extraIncome, setExtraIncome] = useState(25);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const load = async () => {
      await ensureUserProgress(db, user.id);
      const rows = await db.entities.BudgetEntry.filter({ user_id: user.id }, "-date", 200);
      if (!cancelled) {
        setEntries(rows);
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

  const analytics = useMemo(() => getBudgetAnalytics(entries), [entries]);
  const expenseByCategory = useMemo(() => EXPENSE_CATEGORIES.map((cat) => ({
    name: cleanLabel(cat),
    raw: cat,
    value: analytics.categoryTotals[cat] || 0,
    color: CAT_COLORS[cat],
    limit: CATEGORY_LIMITS[cat],
    pct: CATEGORY_LIMITS[cat] ? Math.min(((analytics.categoryTotals[cat] || 0) / CATEGORY_LIMITS[cat]) * 100, 140) : 0
  })).filter((item) => item.value > 0), [analytics.categoryTotals]);

  const timeline = useMemo(() => {
    const byDate = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) acc[entry.date] = { date: entry.date, income: 0, expense: 0 };
      acc[entry.date][entry.type === "income" ? "income" : "expense"] += Number(entry.amount || 0);
      return acc;
    }, {});
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [entries]);

  const insights = [
    !analytics.hasData ? "Add real income and expenses to unlock accurate live coaching." : analytics.balance < 0 ? "Spending is above income. Fix this before adding investing risk." : "Cash flow is positive. Put a planned slice toward goals.",
    analytics.highestCategory[1] > 0 ? `${cleanLabel(analytics.highestCategory[0])} is your largest expense at ${money(analytics.highestCategory[1])}.` : "No top category yet because there are no expenses.",
    analytics.subscriptions.length ? `${analytics.subscriptions.length} recurring-looking cost detected. Cancel anything you would not buy again today.` : "No subscription pattern detected yet.",
    !analytics.hasData ? "Emergency runway needs real spending history." : analytics.runwayDays >= 999 ? "Runway is stable because daily burn is low." : `Emergency runway is about ${analytics.runwayDays} days based on recent burn.`
  ];

  const handleAdd = async () => {
    const amount = Number(form.amount);
    if (!amount || Number.isNaN(amount) || amount <= 0) return;
    setSaving(true);
    const entry = await db.entities.BudgetEntry.create({
      ...form,
      amount,
      user_id: user.id
    });
    setEntries((prev) => [entry, ...prev]);
    setForm({ type: "expense", category: "food", amount: "", description: "", date: new Date().toISOString().slice(0, 10) });
    setShowAdd(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await db.entities.BudgetEntry.delete(id);
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const whatIfSavings = (analytics.highestCategory[1] * whatIfCut) / 100;
  const whatIfMonthly = analytics.balance + whatIfSavings + Number(extraIncome || 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Budget Intelligence Lab</h1>
          <p className="text-muted-foreground mt-1">Track money, detect risk, forecast cash flow, and learn better decisions in real time.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Income", value: money(analytics.income), icon: ArrowUpRight, tone: "text-green-600 bg-green-50" },
          { label: "Expenses", value: money(analytics.expenses), icon: ArrowDownRight, tone: "text-red-600 bg-red-50" },
          { label: "Balance", value: money(analytics.balance), icon: DollarSign, tone: analytics.balance >= 0 ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50" },
          { label: "Savings Rate", value: `${analytics.savingsRate.toFixed(1)}%`, icon: ShieldCheck, tone: "text-purple-600 bg-purple-50" },
          { label: "Health", value: `${analytics.score}/100`, icon: Gauge, tone: analytics.score >= 70 ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50" }
        ].map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", item.tone)}>
                <item.icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-bold font-display leading-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Spending Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPie>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                    {expenseByCategory.map((entry) => <Cell key={entry.raw} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [money(value), "Spent"]} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-muted-foreground">Add expenses to generate the chart.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Radar className="w-4 h-4" /> Category Guardrails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenseByCategory.length ? expenseByCategory.map((item) => (
              <div key={item.raw}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{item.name}</span>
                  <span className={cn(item.value > item.limit && "text-red-600 font-medium")}>{money(item.value)} / {money(item.limit)}</span>
                </div>
                <Progress value={Math.min(item.pct, 100)} className={cn("h-2", item.value > item.limit && "[&>div]:bg-red-500")} />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No category spending yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> Coach Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((insight) => (
              <div key={insight} className="flex gap-2 rounded-lg border p-3 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <CalendarClock className="w-4 h-4" /> 7-Day Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={timeline}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => money(value)} />
                  <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">Timeline appears after entries are added.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> What-If Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cut top category by {whatIfCut}%</Label>
              <Input type="range" min="0" max="50" value={whatIfCut} onChange={(event) => setWhatIfCut(Number(event.target.value))} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Potential savings: {money(whatIfSavings)}</p>
            </div>
            <div>
              <Label>Extra weekly income</Label>
              <Input type="number" min="0" value={extraIncome} onChange={(event) => setExtraIncome(event.target.value)} className="mt-1" />
            </div>
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
              <p className="text-xs text-muted-foreground">Projected next period balance</p>
              <p className="text-2xl font-bold text-primary">{money(whatIfMonthly)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display">Recent Entries</CardTitle>
          {analytics.subscriptions.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
              {analytics.subscriptions.length} subscription signal
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No entries yet. Add your first one.</p>
          ) : entries.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
              <div className="w-2 h-10 rounded-full shrink-0" style={{ background: CAT_COLORS[entry.category] || "#6b7280" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.description || cleanLabel(entry.category)}</p>
                <p className="text-xs text-muted-foreground capitalize">{cleanLabel(entry.category)} - {entry.date}</p>
              </div>
              {/subscription|netflix|spotify|prime|monthly|app|membership/i.test(`${entry.description || ""} ${entry.category || ""}`) && (
                <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-orange-700 border-orange-200">
                  <AlertTriangle className="w-3 h-3" /> recurring
                </Badge>
              )}
              <p className={cn("text-sm font-bold", entry.type === "income" ? "text-green-600" : "text-red-500")}>
                {entry.type === "income" ? "+" : "-"}{money(entry.amount)}
              </p>
              <button onClick={() => handleDelete(entry.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Budget Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-1">
                {["income", "expense"].map((type) => (
                  <button key={type} onClick={() => setForm((prev) => ({ ...prev, type, category: type === "income" ? "allowance" : "food" }))}
                    className={cn("flex-1 py-2 rounded-lg text-sm font-medium border capitalize", form.type === type ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary")}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">{cleanLabel(category)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Example: lunch, Spotify subscription, paycheck" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} className="mt-1" />
            </div>
            <Button onClick={handleAdd} disabled={saving} className="w-full">
              {saving ? "Adding..." : "Add Entry"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
