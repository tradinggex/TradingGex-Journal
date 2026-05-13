import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { EMOTIONS } from "@/lib/constants";
import { DeleteJournalButton } from "@/components/journal/DeleteJournalButton";
import { ScreenshotGallery } from "@/components/trades/ScreenshotGallery";
import { BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JournalEntryPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const dict = await getDictionary();
  const d = dict.journal.detail;

  const { data: entry } = await supabase
    .from("JournalEntry")
    .select("*, screenshots:Screenshot(*)")
    .eq("id", id)
    .eq("userId", user.userId)
    .order("createdAt", { referencedTable: "screenshots", ascending: true })
    .maybeSingle();
  if (!entry) notFound();

  const emotion = EMOTIONS.find((e) => e.value === entry.emotionalState);
  const section = "card p-5";

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1">
            <Link href="/journal" className="text-xs text-fg-subtle hover:text-fg-muted font-mono transition-colors">
              {d.back}
            </Link>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {formatDate(entry.date)}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {emotion && (
              <span className="text-sm text-fg-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: emotion.color }} />
                {emotion.label}
              </span>
            )}
            {entry.followedRules !== null && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                  entry.followedRules
                    ? "bg-green-400/10 text-green-400 border-green-400/20"
                    : "bg-red-400/10 text-red-400 border-red-400/20"
                }`}
              >
                {entry.followedRules ? d.followedRules : d.brokeRules}
              </span>
            )}
            {entry.disciplineScore !== null && (
              <span className="text-xs text-fg-subtle font-mono">
                {d.discipline}: {d.score.replace("{score}", String(entry.disciplineScore))}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/journal/${id}/edit`}
            className="border border-[var(--border)] text-fg-muted hover:text-foreground text-xs px-3 py-2 rounded-lg transition-colors font-mono"
          >
            {dict.common.edit}
          </Link>
          <DeleteJournalButton entryId={id} />
        </div>
      </div>

      {entry.marketCondition && (
        <div className={section}>
          <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.marketCondition}</div>
          <p className="text-sm text-slate-300 flex items-center gap-1.5">
            <BarChart3 size={13} strokeWidth={1.75} className="shrink-0 text-fg-subtle" />
            {entry.marketCondition}
          </p>
        </div>
      )}

      {entry.sessionSummary && (
        <div className={section}>
          <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.sessionSummary}</div>
          <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{entry.sessionSummary}</p>
        </div>
      )}

      {(entry.lessonsLearned || entry.improvements) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entry.lessonsLearned && (
            <div className="bg-surface rounded-xl p-5 border border-purple-500/20">
              <div className="text-xs text-purple-500/70 uppercase tracking-wider font-mono mb-2">{d.lessons}</div>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{entry.lessonsLearned}</p>
            </div>
          )}
          {entry.improvements && (
            <div className="bg-surface rounded-xl p-5 border border-yellow-400/20">
              <div className="text-xs text-yellow-400/70 uppercase tracking-wider font-mono mb-2">{d.improvements}</div>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{entry.improvements}</p>
            </div>
          )}
        </div>
      )}

      {entry.gratitude && (
        <div className="bg-surface rounded-xl p-5 border border-purple-400/20">
          <div className="text-xs text-purple-400/70 uppercase tracking-wider font-mono mb-2">{d.gratitude}</div>
          <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{entry.gratitude}</p>
        </div>
      )}

      {/* Screenshots */}
      <ScreenshotGallery journalEntryId={id} screenshots={entry.screenshots} />

      {entry.disciplineScore !== null && (
        <div className={section}>
          <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono mb-3">{d.discipline}</div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-surface3 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${entry.disciplineScore * 10}%`,
                  backgroundColor:
                    entry.disciplineScore >= 7 ? "#00e676" :
                    entry.disciplineScore >= 4 ? "#ffea00" : "#ff1744",
                }}
              />
            </div>
            <span
              className="text-xl font-black font-mono"
              style={{
                color:
                  entry.disciplineScore >= 7 ? "#00e676" :
                  entry.disciplineScore >= 4 ? "#ffea00" : "#ff1744",
              }}
            >
              {d.score.replace("{score}", String(entry.disciplineScore))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
