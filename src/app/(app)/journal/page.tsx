import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import Link from "next/link";
import { EMOTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await requireUser();
  const dict = await getDictionary();
  const d = dict.journal;

  const { data: entries } = await supabase
    .from("JournalEntry")
    .select("*")
    .eq("userId", user.userId)
    .order("date", { ascending: false });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{d.title}</h1>
          <p className="text-sm text-fg-subtle mt-0.5">
            {d.subtitle.replace("{count}", String((entries ?? []).length))}
          </p>
        </div>
        <Link
          href="/journal/new"
          className="bg-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-purple-400 transition-colors"
        >
          {d.newEntry}
        </Link>
      </div>

      {(entries ?? []).length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <div className="text-4xl mb-3">📓</div>
          <div className="text-fg-muted font-semibold mb-1">{d.noEntries}</div>
          <div className="text-fg-subtle text-sm">{d.noEntriesHint}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {(entries ?? []).map((entry) => {
            const emotion = EMOTIONS.find((e) => e.value === entry.emotionalState);
            return (
              <Link
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="block card p-5 hover:bg-surface2 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        {formatDate(entry.date)}
                      </span>
                      {emotion && (
                        <span className="text-xs text-fg-muted flex items-center gap-1">
                          <span>{emotion.emoji}</span>
                          <span>{emotion.label}</span>
                        </span>
                      )}
                      {entry.followedRules !== null && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            entry.followedRules
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {entry.followedRules ? d.followedRules : d.brokeRules}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      {entry.marketCondition && (
                        <span className="text-xs text-fg-subtle">
                          📊 {entry.marketCondition}
                        </span>
                      )}
                      {entry.disciplineScore !== null && (
                        <span className="text-xs text-fg-subtle">
                          {d.discipline.replace("{score}", String(entry.disciplineScore))}
                        </span>
                      )}
                    </div>

                    {entry.sessionSummary && (
                      <p className="text-sm text-fg-muted leading-relaxed line-clamp-2">
                        {entry.sessionSummary}
                      </p>
                    )}
                  </div>

                  {entry.disciplineScore !== null && (
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm font-black font-mono"
                        style={{
                          borderColor: entry.disciplineScore >= 7 ? "#00e676" : entry.disciplineScore >= 4 ? "#ffea00" : "#ff1744",
                          color: entry.disciplineScore >= 7 ? "#00e676" : entry.disciplineScore >= 4 ? "#ffea00" : "#ff1744",
                        }}
                      >
                        {entry.disciplineScore}
                      </div>
                      <span className="text-[9px] text-fg-subtle">{d.disciplineScore}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
