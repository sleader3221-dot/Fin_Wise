import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  Gauge,
  LineChart,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ensureUserProgress,
  getBudgetAnalytics,
  getGoalAnalytics,
  getPortfolioAnalytics,
  money,
  seedCoreData
} from "@/lib/finance";

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
const LEVEL_NAMES = ["Novice", "Saver", "Budgeter", "Planner", "Investor", "Strategist", "Expert", "Master", "Guru", "Legend"];

const BADGES = [
  { id: "first_lesson", label: "First Lesson", icon: BookOpen, desc: "Complete a lesson" },
  { id: "budget_master", label: "Budget Builder", icon: PiggyBank, desc: "Create a healthy budget habit" },
  { id: "saver", label: "Goal Setter", icon: Target, desc: "Create a savings goal" },
  { id: "investor", label: "Paper Investor", icon: LineChart, desc: "Make a simulated trade" },
  { id: "streak_7", label: "7-Day Streak", icon: Flame, desc: "Practice consistently" },
  { id: "health_80", label: "Health Hero", icon: ShieldCheck, desc: "Reach an 80+ health score" }
];

function getLevelInfo(xp) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  level = Math.min(level, 10);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1] * 2;
  const progress = nextThreshold > currentThreshold ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;
  return { level, levelName: LEVEL_NAMES[level - 1], progress: Math.min(progress, 100), xpToNext: Math.max(0, nextThreshold - xp) };
}

const buildMissions = ({ budget, goals, portfolio, completedLessons }) => [
  {
    title: "Complete one lesson",
    detail: `${completedLessons.length} lessons finished`,
    done: completedLessons.length > 0,
    path: "/learn"
  },
  {
    title: "Keep spending below income",
    detail: budget.hasData ? `Current balance ${money(budget.balance)}` : "Add real income and expenses",
    done: budget.balance >= 0 && budget.income > 0,
    path: "/budget"
  },
  {
    title: "Fund a goal",
    detail: goals.length ? `${Math.round(goals[0].pct)}% on ${goals[0].title}` : "No goal yet",
    done: goals.some((goal) => Number(goal.current_amount || 0) > 0),
    path: "/goals"
  },
  {
    title: "Diversify paper portfolio",
    detail: `Score ${portfolio.diversificationScore}/100`,
    done: portfolio.diversificationScore >= 70,
    path: "/invest"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({
    progress: null,
    lessons: [],
    challenges: [],
    entries: [],
    goals: [],
    portfolio: [],
    loading: true
  });

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const load = async () => {
      await seedCoreData(db);
      const [progress, lessons, challenges, entries, goals, portfolio] = await Promise.all([
        ensureUserProgress(db, user.id),
        db.entities.Lesson.list("order", 4),
        db.entities.DailyChallenge.list("-date", 3),
        db.entities.BudgetEntry.filter({ user_id: user.id }, "-date", 100),
        db.entities.SavingsGoal.filter({ user_id: user.id }, "-created_date", 20),
        db.entities.StockPortfolio.filter({ user_id: user.id })
      ]);
      if (!cancelled) {
        setState({ progress, lessons, challenges, entries, goals, portfolio, loading: false });
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

  const analytics = useMemo(() => {
    const budget = getBudgetAnalytics(state.entries);
    const goals = getGoalAnalytics(state.goals, Math.max(0, budget.balance));
    const portfolioRows = state.portfolio.map((holding) => ({
      ...holding,
      value: Number(holding.shares || 0) * Number(holding.current_price || holding.buy_price || 0)
    }));
    return {
      budget,
      goals,
      portfolio: getPortfolioAnalytics(portfolioRows)
    };
  }, [state.entries, state.goals, state.portfolio]);

  useEffect(() => {
    const progress = state.progress;
    if (!progress?.id) return;
    const badges = new Set(progress.badges || []);
    if (state.entries.length >= 3 && analytics.budget.score >= 65) badges.add("budget_master");
    if (state.goals.length > 0) badges.add("saver");
    if (state.portfolio.length > 0) badges.add("investor");
    if (analytics.budget.score >= 80) badges.add("health_80");
    const nextBadges = [...badges];
    const scoreChanged = progress.financial_health_score !== analytics.budget.score;
    const badgesChanged = nextBadges.length !== (progress.badges || []).length;
    if (scoreChanged || badgesChanged) {
      db.entities.UserProgress.update(progress.id, {
        financial_health_score: analytics.budget.score,
        badges: nextBadges,
        total_savings_simulated: state.goals.reduce((sum, goal) => sum + Number(goal.current_amount || 0), 0),
        total_invested_simulated: analytics.portfolio.totalValue
      });
    }
  }, [analytics, state.entries.length, state.goals, state.portfolio.length, state.progress]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const progress = state.progress || {};
  const completedLessons = progress.completed_lessons || [];
  const { level, levelName, progress: levelProgress, xpToNext } = getLevelInfo(progress.xp_points || 0);
  const missions = buildMissions({
    budget: analytics.budget,
    goals: analytics.goals,
    portfolio: analytics.portfolio,
    completedLessons
  });
  const actionInsight = analytics.budget.balance < 0
    ? "You are overspending. Cut the top category first."
    : !analytics.budget.hasData
      ? "Add your first real budget entry to unlock accurate coaching."
      : analytics.goals.length === 0
      ? "Create one savings goal to make progress visible."
      : analytics.portfolio.totalValue === 0
        ? "Try one paper trade to learn risk without real money."
        : "Your learning loop is active. Keep the streak going.";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            West Hacks ready prototype
          </Badge>
          <h1 className="text-2xl md:text-4xl font-display font-bold">
            FinWise Command Center
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Live financial literacy, budget coaching, savings planning, paper trading, and personalized mentor feedback for students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">{progress.streak_days || 0} day streak</span>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <Gauge className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">{analytics.budget.score}/100 health</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card className="border-primary/20">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Star className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Level {level}</p>
                  <p className="text-xl font-display font-bold">{levelName}</p>
                  <p className="text-sm text-muted-foreground">{xpToNext} XP to next level</p>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-3xl font-bold font-display text-primary">{progress.xp_points || 0}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
            <Progress value={levelProgress} className="h-3 mt-5" />
          </CardContent>
        </Card>

        <Card className="bg-foreground text-background border-0">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-background/70">AI next best action</p>
                <p className="font-semibold mt-1">{actionInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Cash Flow", value: money(analytics.budget.balance), icon: PiggyBank, tone: analytics.budget.balance >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50" },
          { label: "Savings Rate", value: `${analytics.budget.savingsRate.toFixed(1)}%`, icon: Target, tone: "text-blue-600 bg-blue-50" },
          { label: "Goal Pace", value: analytics.goals[0]?.statusLabel || "No goal", icon: Trophy, tone: "text-purple-600 bg-purple-50" },
          { label: "Risk Score", value: `${analytics.portfolio.diversificationScore}/100`, icon: ShieldCheck, tone: "text-cyan-600 bg-cyan-50" }
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", stat.tone)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold font-display leading-tight truncate">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Live Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3 pt-0">
            {[
              analytics.budget.hasData ? `Top spend: ${String(analytics.budget.highestCategory[0]).replace(/_/g, " ")} (${money(analytics.budget.highestCategory[1])})` : "Top spend: waiting for real entries",
              analytics.budget.hasData ? `Projected 4-week cash flow: ${money(analytics.budget.projectedMonthEnd)}` : "Projected cash flow: add income and expenses",
              analytics.budget.hasData ? `Emergency runway estimate: ${analytics.budget.runwayDays >= 999 ? "Stable" : `${analytics.budget.runwayDays} days`}` : "Emergency runway: waiting for spending history",
              `Subscriptions detected: ${analytics.budget.subscriptions.length}`,
              `Needs vs wants: ${money(analytics.budget.needs)} / ${money(analytics.budget.wants)}`,
              `Portfolio label: ${analytics.portfolio.riskLevel}`
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-border p-3 bg-secondary/30">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Today&apos;s Missions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {missions.map((mission) => (
              <Link key={mission.title} to={mission.path} className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", mission.done ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    {mission.done ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mission.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{mission.detail}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Continue Learning</CardTitle>
            <Link to="/learn" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {state.lessons.map((lesson) => {
              const done = completedLessons.includes(lesson.id);
              return (
                <Link key={lesson.id} to={`/learn/${lesson.id}`} className="block">
                  <div className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors", done ? "bg-green-50 border-green-200" : "hover:bg-secondary border-border")}>
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", done ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary")}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">{lesson.estimated_minutes || 5} min - +{lesson.xp_reward} XP</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Achievements</CardTitle>
            <Badge variant="outline">{(progress.badges || []).length}/{BADGES.length}</Badge>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-0">
            {BADGES.map((badge) => {
              const earned = (progress.badges || []).includes(badge.id);
              return (
                <div key={badge.id} className={cn("p-3 rounded-lg border", earned ? "bg-yellow-50 border-yellow-200" : "border-border opacity-60")}>
                  <badge.icon className={cn("w-5 h-5 mb-2", earned ? "text-yellow-600" : "text-muted-foreground")} />
                  <p className="text-xs font-semibold">{badge.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Track Budget", path: "/budget", icon: PiggyBank },
          { label: "Set a Goal", path: "/goals", icon: Target },
          { label: "Paper Trade", path: "/invest", icon: LineChart },
          { label: "Ask Mentor", path: "/mentor", icon: Brain }
        ].map((action) => (
          <Link key={action.path} to={action.path}>
            <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all">
              <action.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-semibold">{action.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
