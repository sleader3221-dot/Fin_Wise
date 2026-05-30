import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import db from "@/lib/db";

import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ensureUserProgress, seedCoreData, todayKey } from "@/lib/finance";

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!user || !id) return;
    seedCoreData(db).then(() => Promise.all([
      db.entities.Lesson.filter({ id }),
      ensureUserProgress(db, user.id),
      db.entities.Quiz.filter({ lesson_id: id }),
    ])).then(([les, prog, quizzes]) => {
      const l = les[0];
      setLesson(l);
      const p = prog || { completed_lessons: [], completed_quizzes: [], xp_points: 0, badges: [] };
      setProgress(p);
      setCompleted((p.completed_lessons || []).includes(id));
      if (quizzes[0]) setQuiz(quizzes[0]);
    }).finally(() => setLoading(false));
  }, [id, user]);

  const handleComplete = async () => {
    if (!progress || !user || completed) return;
    setCompleting(true);
    const updatedLessons = [...(progress.completed_lessons || []), id];
    const newXP = (progress.xp_points || 0) + (lesson?.xp_reward || 50);
    const updateData = { completed_lessons: updatedLessons, xp_points: newXP, last_activity_date: todayKey(), streak_days: Math.max(1, progress.streak_days || 1) };

    // Award first lesson badge
    if (updatedLessons.length === 1) {
      updateData.badges = Array.from(new Set([...(progress.badges || []), "first_lesson"]));
    }

    const updated = await db.entities.UserProgress.update(progress.id, updateData);
    setProgress(updated);
    setCompleted(true);
    setCompleting(false);
    if (quiz) setShowQuiz(true);
  };

  const handleSubmitQuiz = async () => {
    const correct = quiz.questions.filter((q, i) => answers[i] === q.correct_index).length;
    const percentage = (correct / quiz.questions.length) * 100;
    setScore(percentage);
    setSubmitted(true);

    if (percentage >= (quiz.passing_score || 70)) {
      // Award quiz XP
      const currentProg = await db.entities.UserProgress.filter({ user_id: user.id });
      if (currentProg[0]) {
        const alreadyPassed = (currentProg[0].completed_quizzes || []).includes(quiz.id);
        const updatedQuizzes = Array.from(new Set([...(currentProg[0].completed_quizzes || []), quiz.id]));
        const newXP = (currentProg[0].xp_points || 0) + (alreadyPassed ? 0 : (quiz?.xp_reward || 100));
        const updated = await db.entities.UserProgress.update(currentProg[0].id, {
          completed_quizzes: updatedQuizzes,
          xp_points: newXP,
          last_activity_date: todayKey(),
        });
        setProgress(updated);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!lesson) return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">Lesson not found.</p>
      <Link to="/learn"><Button className="mt-4">Back to Lessons</Button></Link>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/learn" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to lessons
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="capitalize">{lesson.category}</Badge>
          <Badge variant="outline" className="capitalize">{lesson.difficulty}</Badge>
          {completed && <Badge className="bg-green-100 text-green-700 border-green-200">✅ Completed</Badge>}
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">{lesson.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{lesson.estimated_minutes || 5} min read</span>
          <span className="flex items-center gap-1.5 text-primary font-medium"><Zap className="w-4 h-4" />+{lesson.xp_reward} XP</span>
        </div>
      </div>

      {/* Content */}
      {!showQuiz ? (
        <>
          <Card>
            <CardContent className="p-6 prose prose-sm max-w-none">
              <ReactMarkdown>{lesson.content || "*No content available yet.*"}</ReactMarkdown>
            </CardContent>
          </Card>

          {!completed ? (
            <Button onClick={handleComplete} disabled={completing} className="w-full h-12 font-semibold">
              {completing ? "Marking complete..." : `Complete Lesson & Earn +${lesson.xp_reward} XP`}
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Lesson Completed!
              </div>
              {quiz && (
                <Button onClick={() => setShowQuiz(true)} variant="outline" className="flex-1">
                  Take Quiz →
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        /* Quiz */
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-display font-bold">{quiz.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">Test your knowledge • +{quiz.xp_reward} XP to pass</p>
            </div>

            {!submitted ? (
              <>
                {quiz.questions?.map((q, i) => (
                  <div key={i} className="space-y-3">
                    <p className="font-medium">{i + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options?.map((opt, j) => (
                        <button
                          key={j}
                          onClick={() => setAnswers(prev => ({ ...prev, [i]: j }))}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                            answers[i] === j ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length < (quiz.questions?.length || 0)}
                  className="w-full"
                >
                  Submit Quiz
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className={cn("text-6xl font-display font-bold", score >= (quiz.passing_score || 70) ? "text-green-500" : "text-red-500")}>
                  {Math.round(score)}%
                </div>
                <p className="font-medium">
                  {score >= (quiz.passing_score || 70) ? "🎉 You passed!" : "😅 Try again!"}
                </p>
                {quiz.questions?.map((q, i) => (
                  <div key={i} className={cn("text-left p-4 rounded-lg border", answers[i] === q.correct_index ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                    <p className="text-sm font-medium mb-1">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{q.explanation}</p>
                  </div>
                ))}
                <Button onClick={() => navigate("/learn")} className="w-full">Back to Lessons</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
