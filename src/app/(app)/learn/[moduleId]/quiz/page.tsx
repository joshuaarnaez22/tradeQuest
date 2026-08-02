import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnModule } from "@/lib/learn-modules";
import { QuizForm } from "@/components/learn/QuizForm";

export default async function LearnQuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { moduleId } = await params;
  const mod = getLearnModule(moduleId);
  if (!mod) notFound();

  // Never send correctIndex to the client — grading is server-side only.
  const clientModule = {
    id: mod.id,
    title: mod.title,
    summary: mod.summary,
    lesson: mod.lesson,
    questions: mod.questions.map(({ prompt, options }) => ({ prompt, options })),
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 24 }}>
      <Link href={`/learn/${moduleId}`} style={{ fontSize: 13, color: "var(--text-secondary)", width: "fit-content" }}>
        ← {mod.title}
      </Link>
      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          Quiz · {mod.title}
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: 14 }}>
          Pass with at least 3 of 4 correct. First pass awards +25 XP.
        </p>
      </div>
      <QuizForm module={clientModule} />
    </div>
  );
}
