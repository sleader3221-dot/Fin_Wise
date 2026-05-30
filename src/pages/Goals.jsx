import { useEffect, useMemo, useState } from "react";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import { CalendarDays, CheckCircle2, Edit2, PiggyBank, Plus, Sparkles, Target, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ensureUserProgress, getBudgetAnalytics, getGoalAnalytics, money } from "@/lib/finance";

const EMOJIS = ["target", "laptop", "car", "books", "travel", "shoes", "game", "music", "phone", "cash", "home", "college"];

const iconFor = (icon) => {
  const map = {
    target: Target,
    laptop: Sparkles,
    car: CalendarDays,
    books: PiggyBank,
    travel: TrendingUp,
    shoes: Sparkles,
    game: Target,
    music: Sparkles,
    phone: PiggyBank,
    cash: PiggyBank,
    home: Target,
    college: CalendarDays
  };
  return map[icon] || Target;
};

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ title: "", target_amount: "", current_amount: "0", deadline: "", icon: "target" });
  const [saving, setSaving] = useState(false);
  const [addAmount, setAddAmount] = useState({});

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const load = async () => {
      await ensureUserProgress(db, user.id);
      const [goalRows, budgetRows] = await Promise.all([
        db.entities.SavingsGoal.filter({ user_id: user.id }, "-created_date"),
        db.entities.BudgetEntry.filter({ user_id: user.id }, "-date", 200)
      ]);
      if (!cancelled) {
        setGoals(goalRows);
        setEntries(budgetRows);
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

  const budget = useMemo(() => getBudgetAnalytics(entries), [entries]);
  const smartGoals = useMemo(() => getGoalAnalytics(goals, Math.max(0, budget.balance)), [goals, budget.balance]);

  const handleSave = async () => {
    if (!form.title || !form.target_amount) return;
    setSaving(true);
    const data = {
      ...form,
      target_amount: Number(form.target_amount),
      current_amount: Number(form.current_amount || 0),
      user_id: user.id,
      status: Number(form.current_amount || 0) >= Number(form.target_amount) ? "completed" : "active"
    };
    if (editGoal) {
      const updated = await db.entities.SavingsGoal.update(editGoal.id, data);
      setGoals((prev) => prev.map((goal) => goal.id === editGoal.id ? updated : goal));
    } else {
      const created = await db.entities.SavingsGoal.create(data);
      setGoals((prev) => [created, ...prev]);
    }
    setForm({ title: "", target_amount: "", current_amount: "0", deadline: "", icon: "target" });
    setShowAdd(false);
    setEditGoal(null);
    setSaving(false);
  };

  const handleAddSavings = async (goal, amountOverride) => {
    const amount = Number(amountOverride || addAmount[goal.id] || 0);
    if (!amount || amount <= 0) return;
    const newAmount = Math.min(Number(goal.current_amount || 0) + amount, Number(goal.target_amount || 0));
    const status = newAmount >= Number(goal.target_amount || 0) ? "completed" : "active";
    const updated = await db.entities.SavingsGoal.update(goal.id, { current_amount: newAmount, status });
    setGoals((prev) => prev.map((item) => item.id === goal.id ? updated : item));
    setAddAmount((prev) => ({ ...prev, [goal.id]: "" }));
  };

  const handleDelete = async (id) => {
    await db.entities.SavingsGoal.delete(id);
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  const openEdit = (goal) => {
    setEditGoal(goal);
    setForm({
      title: goal.title,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount || 0),
      deadline: goal.deadline || "",
      icon: goal.icon || "target"
    });
    setShowAdd(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target_amount || 0), 0);
  const roundup = Math.max(1, Math.round((budget.expenses % 10 || 5) * 100) / 100);
  const activeGoals = smartGoals.filter((goal) => goal.remaining > 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Savings Goal Studio</h1>
          <p className="text-muted-foreground mt-1">{money(totalSaved)} saved of {money(totalTarget)} across {goals.length} goals.</p>
        </div>
        <Button onClick={() => { setEditGoal(null); setForm({ title: "", target_amount: "", current_amount: "0", deadline: "", icon: "target" }); setShowAdd(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {[
          { label: "Overall Progress", value: `${totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%`, icon: Target },
          { label: "Available Cash Flow", value: money(Math.max(0, budget.balance)), icon: PiggyBank },
          { label: "Active Goals", value: activeGoals.length, icon: CalendarDays },
          { label: "Round-Up Suggestion", value: money(roundup), icon: Sparkles }
        ].map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <item.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-xl font-bold font-display">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Savings Momentum</span>
              <span className="text-sm font-bold text-primary">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</span>
            </div>
            <Progress value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0} className="h-3" />
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {smartGoals.map((goal) => {
          const Icon = iconFor(goal.icon);
          return (
            <Card key={goal.id} className={cn("border", goal.status === "completed" ? "border-green-200 bg-green-50/50" : "border-border")}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{goal.title}</h3>
                      <p className="text-xs text-muted-foreground">{goal.deadline ? `By ${goal.deadline}` : "No deadline"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {goal.status === "completed" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Done</Badge>
                    ) : (
                      <>
                        <button onClick={() => openEdit(goal)} className="text-muted-foreground hover:text-foreground p-1">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(goal.id)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-primary">{money(goal.current_amount)}</span>
                    <span className="text-muted-foreground">{money(goal.target_amount)}</span>
                  </div>
                  <Progress value={goal.pct} className={cn("h-2.5", goal.status === "completed" && "[&>div]:bg-green-500")} />
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="rounded-lg bg-secondary/60 p-2">
                      <p className="text-muted-foreground">Left</p>
                      <p className="font-semibold">{money(goal.remaining)}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/60 p-2">
                      <p className="text-muted-foreground">Monthly</p>
                      <p className="font-semibold">{money(goal.monthlyRequired)}</p>
                    </div>
                    <div className="rounded-lg bg-secondary/60 p-2">
                      <p className="text-muted-foreground">Pace</p>
                      <p className="font-semibold">{goal.statusLabel}</p>
                    </div>
                  </div>
                </div>

                {goal.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Add $..."
                        value={addAmount[goal.id] || ""}
                        onChange={(event) => setAddAmount((prev) => ({ ...prev, [goal.id]: event.target.value }))}
                        className="h-9 text-sm"
                      />
                      <Button size="sm" onClick={() => handleAddSavings(goal)} disabled={!addAmount[goal.id]}>Add</Button>
                    </div>
                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleAddSavings(goal, roundup)}>
                      <Sparkles className="w-3.5 h-3.5" /> Add smart round-up {money(roundup)}
                    </Button>
                  </div>
                )}

                {goal.status === "completed" && (
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Goal completed. Great work.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <div className="lg:col-span-3 text-center py-16 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-2">No savings goals yet</p>
            <p className="text-sm mb-4">Set your first goal to start saving with purpose.</p>
            <Button onClick={() => setShowAdd(true)}>Create First Goal</Button>
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={(value) => { setShowAdd(value); if (!value) setEditGoal(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editGoal ? "Edit Goal" : "New Savings Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Icon Style</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {EMOJIS.map((item) => {
                  const Icon = iconFor(item);
                  return (
                    <button key={item} onClick={() => setForm((prev) => ({ ...prev, icon: item }))}
                      className={cn("p-2 rounded-lg border transition-colors", form.icon === item ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary")}>
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Goal Name</Label>
              <Input placeholder="Example: laptop, college fund, emergency buffer" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Target Amount ($)</Label>
              <Input type="number" min="0" step="0.01" placeholder="500.00" value={form.target_amount} onChange={(event) => setForm((prev) => ({ ...prev, target_amount: event.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Already Saved ($)</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.current_amount} onChange={(event) => setForm((prev) => ({ ...prev, current_amount: event.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Target Date</Label>
              <Input type="date" value={form.deadline} onChange={(event) => setForm((prev) => ({ ...prev, deadline: event.target.value }))} className="mt-1" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : editGoal ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
