import { useState, useEffect } from "react";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import { Trophy, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LEVEL_NAMES = ["Novice", "Saver", "Budgeter", "Planner", "Investor", "Strategist", "Expert", "Master", "Guru", "Legend"];
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];

function getLevel(xp) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
  }
  return Math.min(level, 10);
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [allProgress, setAllProgress] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.entities.UserProgress.list("-xp_points", 20),
      db.entities.User.list(),
    ]).then(([progs, userList]) => {
      setAllProgress(progs);
      setUsers(userList);
    }).finally(() => setLoading(false));
  }, []);

  const leaderboard = allProgress.map(prog => {
    const u = users.find(u => u.id === prog.user_id);
    return {
      ...prog,
      name: u?.full_name || "Anonymous",
      level: getLevel(prog.xp_points || 0),
      levelName: LEVEL_NAMES[getLevel(prog.xp_points || 0) - 1],
    };
  }).sort((a, b) => (b.xp_points || 0) - (a.xp_points || 0));

  const myRank = leaderboard.findIndex(p => p.user_id === user?.id) + 1;
  const myProgress = leaderboard.find(p => p.user_id === user?.id);

  const RANK_COLORS = {
    1: "bg-yellow-100 border-yellow-300 text-yellow-700",
    2: "bg-gray-100 border-gray-300 text-gray-600",
    3: "bg-orange-100 border-orange-300 text-orange-700",
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Top financial learners</p>
      </div>

      {/* My Rank */}
      {myProgress && (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-lg">
              #{myRank || "?"}
            </div>
            <div className="flex-1">
              <p className="font-semibold">Your Rank</p>
              <p className="text-sm text-muted-foreground">{myProgress.levelName} • {myProgress.xp_points || 0} XP</p>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{myProgress.streak_days || 0}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((p, i) => {
            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
            const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
            const crowns = { 1: "🥇", 2: "🥈", 3: "🥉" };
            return p ? (
              <div key={rank} className={cn("flex flex-col items-center gap-2", rank === 1 && "-mt-4")}>
                <span className="text-2xl">{crowns[rank]}</span>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {p.name?.[0]?.toUpperCase() || "?"}
                </div>
                <p className="text-xs font-medium text-center max-w-16 truncate">{p.name}</p>
                <div className={cn("w-20 rounded-t-lg flex items-center justify-center pt-2 text-xs font-bold", heights[rank],
                  rank === 1 ? "bg-yellow-200 text-yellow-700" : rank === 2 ? "bg-gray-200 text-gray-600" : "bg-orange-200 text-orange-700"
                )}>
                  {p.xp_points || 0} XP
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Full List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">All Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {leaderboard.map((p, i) => {
            const rank = i + 1;
            const isMe = p.user_id === user?.id;
            return (
              <div key={p.id} className={cn("flex items-center gap-4 px-5 py-3 transition-colors",
                isMe ? "bg-primary/5" : "hover:bg-secondary/50")}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  RANK_COLORS[rank] || "bg-secondary text-muted-foreground border border-border"
                )}>
                  {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                  {p.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name} {isMe && <span className="text-primary text-xs">(You)</span>}</p>
                  <p className="text-xs text-muted-foreground">{p.levelName} • Level {p.level}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-primary">{p.xp_points || 0} XP</p>
                  <div className="flex items-center gap-1 text-orange-500 justify-end">
                    <Flame className="w-3 h-3" />
                    <span className="text-xs">{p.streak_days || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No rankings yet. Be the first!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
