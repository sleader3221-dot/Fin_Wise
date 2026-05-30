import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import { BookOpen, Clock, Zap, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ensureUserProgress, seedCoreData } from "@/lib/finance";

const CATEGORIES = ["all", "budgeting", "saving", "investing", "credit", "taxes", "banking", "insurance", "retirement"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const CATEGORY_COLORS = {
  budgeting: "bg-blue-100 text-blue-700",
  saving: "bg-green-100 text-green-700",
  investing: "bg-purple-100 text-purple-700",
  credit: "bg-orange-100 text-orange-700",
  taxes: "bg-red-100 text-red-700",
  banking: "bg-cyan-100 text-cyan-700",
  insurance: "bg-yellow-100 text-yellow-700",
  retirement: "bg-pink-100 text-pink-700",
};

export default function Learn() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    if (!user) return;
    seedCoreData(db).then(() => Promise.all([
      db.entities.Lesson.list("order"),
      ensureUserProgress(db, user.id),
    ])).then(([les, prog]) => {
      setLessons(les);
      setProgress(prog || { completed_lessons: [] });
    }).finally(() => setLoading(false));
  }, [user]);

  const filtered = lessons.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || l.category === category;
    const matchDiff = difficulty === "all" || l.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  const completedLessons = progress?.completed_lessons || [];
  const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Learn</h1>
        <p className="text-muted-foreground mt-1">{completedCount}/{lessons.length} lessons completed</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%` }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search lessons..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition-colors capitalize",
              category === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lesson) => {
          const done = completedLessons.includes(lesson.id);
          return (
            <Link key={lesson.id} to={`/learn/${lesson.id}`}>
              <Card className={cn("h-full hover:shadow-md transition-all cursor-pointer border", done && "border-green-200 bg-green-50/50")}>
                <CardContent className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-3xl">{done ? "✅" : "📖"}</div>
                    {done && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight mb-1">{lesson.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{lesson.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge className={cn("text-xs capitalize", CATEGORY_COLORS[lesson.category] || "bg-gray-100 text-gray-700")}>
                      {lesson.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.estimated_minutes || 5}m</span>
                      <span className="flex items-center gap-1 text-primary font-medium"><Zap className="w-3 h-3" />+{lesson.xp_reward}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No lessons found</p>
          </div>
        )}
      </div>
    </div>
  );
}
