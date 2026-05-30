export const todayKey = () => new Date().toISOString().slice(0, 10);

export const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

export const percent = (value, digits = 0) => `${Number(value || 0).toFixed(digits)}%`;

export const LESSON_LIBRARY = [
  {
    id: "budget-zero-based",
    title: "Build a zero-based teen budget",
    description: "Give every dollar a job before it disappears.",
    category: "budgeting",
    difficulty: "beginner",
    xp_reward: 60,
    order: 1,
    estimated_minutes: 5,
    content: "## The rule\nA zero-based budget means income minus planned spending minus planned saving equals zero.\n\n### Why it works\nIt turns vague intentions into choices. For a teen, that might mean allowance, part-time pay, gifts, and side hustle money all get assigned before spending starts.\n\n### Try it\n1. List expected income.\n2. Split spending into needs, wants, saving, and giving.\n3. Move money until every dollar has a job.\n4. Review weekly and adjust without shame."
  },
  {
    id: "needs-wants-values",
    title: "Needs, wants, and values",
    description: "Spend less by knowing what actually matters to you.",
    category: "budgeting",
    difficulty: "beginner",
    xp_reward: 50,
    order: 2,
    estimated_minutes: 4,
    content: "## The three buckets\nNeeds keep you safe and functional. Wants make life fun. Values are the reasons behind both.\n\nA strong budget does not ban wants. It makes sure your biggest spending matches what you actually care about."
  },
  {
    id: "emergency-fund",
    title: "Emergency funds for students",
    description: "Create a safety buffer before life gets expensive.",
    category: "saving",
    difficulty: "beginner",
    xp_reward: 55,
    order: 3,
    estimated_minutes: 5,
    content: "## Start small\nA starter emergency fund of $100 to $500 can protect you from surprise costs like a broken phone screen or a missed shift.\n\n### Formula\nMonthly expenses x months of protection = emergency fund target."
  },
  {
    id: "compound-interest",
    title: "Compound interest superpower",
    description: "Understand why time matters more than perfection.",
    category: "saving",
    difficulty: "intermediate",
    xp_reward: 70,
    order: 4,
    estimated_minutes: 6,
    content: "## Compound interest\nCompound interest means your earnings can start earning more earnings.\n\nThe formula is: future value = principal x (1 + rate) ^ years.\n\nThe earlier you start, the less money you need to reach the same goal."
  },
  {
    id: "credit-score",
    title: "Credit scores without confusion",
    description: "Learn what credit scores measure and how to protect one.",
    category: "credit",
    difficulty: "intermediate",
    xp_reward: 70,
    order: 5,
    estimated_minutes: 7,
    content: "## Credit score basics\nCredit scores estimate whether someone is likely to repay borrowed money.\n\nImportant factors include payment history, credit utilization, account age, mix of credit, and new credit checks.\n\nFor beginners, the safest habit is paying on time and keeping balances low."
  },
  {
    id: "investing-index-funds",
    title: "Why diversification matters",
    description: "Reduce risk by not betting everything on one company.",
    category: "investing",
    difficulty: "intermediate",
    xp_reward: 80,
    order: 6,
    estimated_minutes: 7,
    content: "## Diversification\nDiversification means spreading money across many assets so one mistake does not wreck the whole plan.\n\nIndex funds are popular because they can hold hundreds of companies at once. This app uses paper trading only, but the lesson is real: concentration creates risk."
  },
  {
    id: "taxes-first-job",
    title: "Your first paycheck and taxes",
    description: "Know why take-home pay is lower than hourly pay.",
    category: "taxes",
    difficulty: "beginner",
    xp_reward: 60,
    order: 7,
    estimated_minutes: 5,
    content: "## Gross vs net pay\nGross pay is what you earn before deductions. Net pay is what lands in your account.\n\nPayroll taxes, income tax withholding, and benefits can reduce take-home pay. Budget from net pay, not wishful gross pay."
  },
  {
    id: "banking-fees",
    title: "Banking fees and safe accounts",
    description: "Avoid avoidable fees and choose student-friendly accounts.",
    category: "banking",
    difficulty: "beginner",
    xp_reward: 55,
    order: 8,
    estimated_minutes: 5,
    content: "## Watch the fees\nCommon fees include maintenance fees, overdraft fees, ATM fees, and transfer fees.\n\nA good student account should be low-fee, easy to monitor, and protected by strong passwords and two-factor authentication."
  },
  {
    id: "insurance-risk",
    title: "Insurance as risk transfer",
    description: "Understand why insurance exists before you need it.",
    category: "insurance",
    difficulty: "advanced",
    xp_reward: 90,
    order: 9,
    estimated_minutes: 8,
    content: "## Risk transfer\nInsurance lets many people pool risk so one person's emergency is less financially destructive.\n\nDeductibles, premiums, coverage limits, and exclusions decide how useful a policy is."
  },
  {
    id: "retirement-roth",
    title: "Retirement sounds far away. Start anyway.",
    description: "Learn why small early contributions can become powerful.",
    category: "retirement",
    difficulty: "advanced",
    xp_reward: 95,
    order: 10,
    estimated_minutes: 8,
    content: "## Time is the advantage\nRetirement accounts are long-term tools. Teens with earned income may be eligible for options such as a Roth IRA in some countries or regions.\n\nThe main lesson is universal: early compounding is difficult to replace later."
  }
];

export const QUIZ_LIBRARY = LESSON_LIBRARY.map((lesson) => ({
  id: `quiz-${lesson.id}`,
  lesson_id: lesson.id,
  title: `${lesson.title} quiz`,
  xp_reward: Math.round((lesson.xp_reward || 50) * 0.8),
  passing_score: 70,
  questions: [
    {
      question: "What is the main skill this lesson is building?",
      options: ["Intentional financial decision-making", "Guessing market prices", "Ignoring small expenses", "Spending before planning"],
      correct_index: 0,
      explanation: "The lesson is designed to make financial choices more intentional and measurable."
    },
    {
      question: "Which habit makes the lesson work in real life?",
      options: ["Reviewing the numbers regularly", "Waiting until everything is perfect", "Tracking only big purchases", "Avoiding goals"],
      correct_index: 0,
      explanation: "Small reviews create feedback loops, which are more reliable than one-time motivation."
    }
  ]
}));

export const DAILY_CHALLENGES = [
  {
    id: "challenge-budget-review",
    title: "Audit one spending category",
    description: "Find your highest category and write one way to improve it.",
    type: "budgeting",
    xp_reward: 25,
    date: todayKey()
  },
  {
    id: "challenge-goal-boost",
    title: "Add to a savings goal",
    description: "Move any amount toward a goal and check your target date.",
    type: "savings",
    xp_reward: 25,
    date: todayKey()
  },
  {
    id: "challenge-risk-check",
    title: "Check portfolio concentration",
    description: "Make sure no one paper holding dominates your practice portfolio.",
    type: "simulation",
    xp_reward: 30,
    date: todayKey()
  }
];

export const seedCoreData = async (db) => {
  const [lessons, quizzes, challenges] = await Promise.all([
    db.entities.Lesson.list(),
    db.entities.Quiz.list(),
    db.entities.DailyChallenge.list()
  ]);

  if (lessons.length < LESSON_LIBRARY.length) {
    const existingIds = new Set(lessons.map((item) => item.id));
    await Promise.all(LESSON_LIBRARY.filter((item) => !existingIds.has(item.id)).map((item) => db.entities.Lesson.create(item)));
  }

  if (quizzes.length < QUIZ_LIBRARY.length) {
    const existingIds = new Set(quizzes.map((item) => item.id));
    await Promise.all(QUIZ_LIBRARY.filter((item) => !existingIds.has(item.id)).map((item) => db.entities.Quiz.create(item)));
  }

  if (challenges.length < DAILY_CHALLENGES.length) {
    const existingIds = new Set(challenges.map((item) => item.id));
    await Promise.all(DAILY_CHALLENGES.filter((item) => !existingIds.has(item.id)).map((item) => db.entities.DailyChallenge.create(item)));
  }
};

export const ensureUserProgress = async (db, userId) => {
  const rows = await db.entities.UserProgress.filter({ user_id: userId });
  if (rows[0]) return rows[0];
  return db.entities.UserProgress.create({
    user_id: userId,
    xp_points: 0,
    level: 1,
    streak_days: 0,
    last_activity_date: null,
    completed_lessons: [],
    completed_quizzes: [],
    badges: [],
    financial_health_score: 0,
    total_savings_simulated: 0,
    total_invested_simulated: 0
  });
};

export const removeLegacyDemoData = async (db, user) => {
  if (!user?.id) return;
  const [entries, goals, holdings, progressRows, users, allProgress] = await Promise.all([
    db.entities.BudgetEntry.filter({ user_id: user.id }),
    db.entities.SavingsGoal.filter({ user_id: user.id }),
    db.entities.StockPortfolio.filter({ user_id: user.id }),
    db.entities.UserProgress.filter({ user_id: user.id }),
    db.entities.User.list(),
    db.entities.UserProgress.list()
  ]);

  const seededDescriptions = new Set([
    "Weekend tutoring",
    "Weekly allowance",
    "Lunch with friends",
    "Music subscription",
    "Transit card",
    "Study app",
    "Automatic goal transfer"
  ]);
  const seededEntries = entries.filter((entry) => seededDescriptions.has(entry.description));
  await Promise.all(seededEntries.map((entry) => db.entities.BudgetEntry.delete(entry.id)));

  const seededGoalTitles = new Set(["Emergency buffer", "College supplies"]);
  const seededGoals = goals.filter((goal) => seededGoalTitles.has(goal.title));
  await Promise.all(seededGoals.map((goal) => db.entities.SavingsGoal.delete(goal.id)));

  const seededSymbols = new Set(["VTI", "AAPL", "BND"]);
  const seededHoldings = holdings.filter((holding) => seededSymbols.has(holding.symbol));
  await Promise.all(seededHoldings.map((holding) => db.entities.StockPortfolio.delete(holding.id)));

  const demoUserIds = new Set(["demo-peer-maya", "demo-peer-jordan", "demo-peer-sam"]);
  const demoUsers = users.filter((item) => demoUserIds.has(item.id));
  const demoProgress = allProgress.filter((item) => demoUserIds.has(item.user_id));
  await Promise.all(demoUsers.map((item) => db.entities.User.delete(item.id)));
  await Promise.all(demoProgress.map((item) => db.entities.UserProgress.delete(item.id)));

  const progress = progressRows[0];
  const hadLegacyData = seededEntries.length > 0 || seededGoals.length > 0 || seededHoldings.length > 0 || demoUsers.length > 0 || demoProgress.length > 0;
  if (progress && hadLegacyData) {
    const realCompletedLessons = (progress.completed_lessons || []).filter((id) => !id.startsWith("demo-"));
    const realCompletedQuizzes = (progress.completed_quizzes || []).filter((id) => !id.startsWith("demo-"));
    const realBadges = realCompletedLessons.length > 0 ? ["first_lesson"] : [];
    await db.entities.UserProgress.update(progress.id, {
      completed_lessons: realCompletedLessons,
      completed_quizzes: realCompletedQuizzes,
      badges: realBadges,
      financial_health_score: 0,
      total_savings_simulated: 0,
      total_invested_simulated: 0,
      streak_days: realCompletedLessons.length || realCompletedQuizzes.length ? progress.streak_days || 1 : 0,
      last_activity_date: realCompletedLessons.length || realCompletedQuizzes.length ? progress.last_activity_date || todayKey() : null
    });
  }
};

export const getBudgetAnalytics = (entries = []) => {
  const hasData = entries.length > 0;
  const income = entries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenses = entries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const balance = income - expenses;
  const savingsEntries = entries.filter((entry) => entry.category === "savings").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const savingsRate = income > 0 ? ((balance + savingsEntries) / income) * 100 : 0;
  const burnRate = expenses / Math.max(1, new Set(entries.map((entry) => entry.date)).size || 1);
  const runwayDays = burnRate > 0 ? Math.floor(Math.max(balance, 0) / burnRate) : 999;
  const subscriptions = entries.filter((entry) => entry.type === "expense" && /subscription|netflix|spotify|prime|monthly|app|membership/i.test(`${entry.description || ""} ${entry.category || ""}`));
  const categoryTotals = entries.reduce((acc, entry) => {
    if (entry.type !== "expense") return acc;
    acc[entry.category] = (acc[entry.category] || 0) + Number(entry.amount || 0);
    return acc;
  }, {});
  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["none", 0];
  const needs = ["transportation", "education", "food"].reduce((sum, key) => sum + (categoryTotals[key] || 0), 0);
  const wants = ["entertainment", "clothing", "subscriptions", "other"].reduce((sum, key) => sum + (categoryTotals[key] || 0), 0);
  const score = hasData ? Math.max(0, Math.min(100,
    50 +
    Math.min(20, savingsRate) -
    (balance < 0 ? 20 : 0) -
    (income > 0 && expenses / income > 0.8 ? 12 : 0) -
    (subscriptions.length > 2 ? 6 : 0) +
    (runwayDays >= 14 ? 8 : 0)
  )) : 0;

  return {
    hasData,
    income,
    expenses,
    balance,
    savingsRate,
    burnRate,
    runwayDays,
    subscriptions,
    categoryTotals,
    highestCategory,
    needs,
    wants,
    score: Math.round(score),
    projectedMonthEnd: balance * 4
  };
};

export const getGoalAnalytics = (goals = [], monthlyFreeCash = 0) => goals.map((goal) => {
  const target = Number(goal.target_amount || 0);
  const current = Number(goal.current_amount || 0);
  const remaining = Math.max(target - current, 0);
  const deadline = goal.deadline ? new Date(goal.deadline) : null;
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - new Date()) / 86400000)) : null;
  const monthlyRequired = daysLeft && daysLeft > 0 ? remaining / Math.max(daysLeft / 30, 1) : remaining;
  const pace = monthlyFreeCash > 0 && monthlyRequired > 0 ? (monthlyFreeCash / monthlyRequired) * 100 : 0;
  return {
    ...goal,
    pct: target > 0 ? Math.min((current / target) * 100, 100) : 0,
    remaining,
    daysLeft,
    monthlyRequired,
    pace,
    statusLabel: remaining <= 0 ? "Complete" : pace >= 100 ? "On track" : pace >= 50 ? "Close" : "Needs a plan"
  };
});

export const getPortfolioAnalytics = (holdings = []) => {
  const totalValue = holdings.reduce((sum, holding) => sum + Number(holding.value || 0), 0);
  if (holdings.length === 0 || totalValue <= 0) {
    return { totalValue: 0, sectorTotals: {}, largestHolding: null, concentration: 0, diversificationScore: 0, riskLevel: "Not started" };
  }
  const sectorTotals = holdings.reduce((acc, holding) => {
    acc[holding.sector || "Other"] = (acc[holding.sector || "Other"] || 0) + Number(holding.value || 0);
    return acc;
  }, {});
  const largestHolding = holdings.slice().sort((a, b) => Number(b.value || 0) - Number(a.value || 0))[0];
  const concentration = totalValue > 0 && largestHolding ? (largestHolding.value / totalValue) * 100 : 0;
  const diversificationScore = Math.round(Math.max(0, Math.min(100, 100 - concentration + Math.min(25, Object.keys(sectorTotals).length * 6))));
  const riskLevel = concentration > 55 ? "High concentration" : diversificationScore > 75 ? "Balanced practice" : "Moderate risk";
  return { totalValue, sectorTotals, largestHolding, concentration, diversificationScore, riskLevel };
};

export const mentorReply = ({ question, analytics }) => {
  const q = question.toLowerCase();
  const budget = analytics?.budget;
  const goals = analytics?.goals || [];
  const portfolio = analytics?.portfolio;

  if (q.includes("budget") || q.includes("spend")) {
    if (!budget?.hasData) return "Your budget coach is waiting for real data. Add at least one income entry and one expense entry, then I can calculate cash flow, savings rate, top spending category, and runway accurately.";
    return `Here is your live budget read: income ${money(budget?.income)}, expenses ${money(budget?.expenses)}, balance ${money(budget?.balance)}. Your strongest next move is to reduce ${String(budget?.highestCategory?.[0] || "your top category").replace(/_/g, " ")} by 10% and move the difference to a goal. Your current savings rate is ${percent(budget?.savingsRate, 1)}.`;
  }
  if (q.includes("save") || q.includes("goal")) {
    const goal = goals.sort((a, b) => b.remaining - a.remaining)[0];
    if (!goal) return "Create one clear savings goal first. A strong goal has a target amount, a deadline, and a weekly contribution you can actually repeat.";
    return `Your priority goal should be "${goal.title}". It has ${money(goal.remaining)} remaining. To stay on pace, aim for about ${money(goal.monthlyRequired)} per month. Small automatic transfers beat occasional big promises.`;
  }
  if (q.includes("invest") || q.includes("stock") || q.includes("portfolio")) {
    if (!portfolio?.totalValue) return "Your paper portfolio has not started yet. Add one simulated broad ETF or stock first, then I can calculate diversification, sector exposure, concentration risk, and learning-focused rebalancing tips.";
    return `Paper trading check: your diversification score is ${portfolio?.diversificationScore || 0}/100 and your risk label is "${portfolio?.riskLevel || "Not started"}". For learning, try holding at least 4 sectors and keeping the largest position under 35% of the portfolio.`;
  }
  if (q.includes("credit")) {
    return "Credit score basics: pay on time, keep utilization low, avoid unnecessary applications, and monitor statements. For teens, the win is learning the system before using debt heavily.";
  }
  if (q.includes("compound")) {
    return "Compound interest is growth on growth. The practical lesson: starting earlier can matter more than starting perfectly. Use the invest page to compare a small monthly habit against waiting.";
  }
  if (!budget?.hasData) return "Start with one real action: add your first income and expense in Budget. The dashboard, health score, mentor, goals, and leaderboard will update from that live data instead of demo progress.";
  return `I would focus on one measurable move today: improve your financial health score from ${budget?.score || 0}/100 by either adding income, lowering your biggest category, or funding a goal. Your app data updates live, so the dashboard will reflect the change after you make it.`;
};
