import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnModule } from "@/lib/learn-modules";
import { getModuleCompletion } from "@/lib/learn-queries";

export default async function LearnLessonPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { moduleId } = await params;
  const mod = getLearnModule(moduleId);
  if (!mod) notFound();

  const completion = await getModuleCompletion(userId, moduleId);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 24 }}>
      <Link href="/learn" style={{ fontSize: 13, color: "var(--text-secondary)", width: "fit-content" }}>
        ← Learn
      </Link>

      <div>
        <h1 className="font-display" style={{ fontSize: "var(--text-display-3)", margin: 0 }}>
          {mod.title}
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: 15 }}>{mod.summary}</p>
      </div>

      <article
        data-testid="learn-lesson"
        style={{
          display: "grid",
          gap: 14,
          background: "var(--surface-card)",
          border: "var(--border-width-thick) solid var(--border-default)",
          borderRadius: 24,
          padding: "24px 28px",
          boxShadow: "var(--shadow-flat-md)",
        }}
      >
        <h2 className="font-display" style={{ fontSize: "var(--text-display-4)", margin: 0 }}>
          {mod.lesson.heading}
        </h2>
        {mod.lesson.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
            {p}
          </p>
        ))}
      </article>

      {completion?.passed && (
        <p data-testid="learn-passed-banner" style={{ margin: 0, fontWeight: 700, color: "var(--violet-500)" }}>
          Quiz passed ({completion.score}/{completion.total})
          {completion.xpAwarded > 0 ? ` · +${completion.xpAwarded} XP earned` : ""}
        </p>
      )}

      <Link
        href={`/learn/${moduleId}/quiz`}
        data-testid="learn-take-quiz"
        style={{
          justifySelf: "start",
          background: "var(--violet-500)",
          color: "white",
          borderRadius: "var(--radius-pill)",
          padding: "12px 22px",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {completion?.passed ? "Retake quiz →" : "Take quiz →"}
      </Link>
    </div>
  );
}
