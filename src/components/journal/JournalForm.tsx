"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EMOTIONS } from "@/lib/constants";
import { createJournalEntry, updateJournalEntry } from "@/actions/journal.actions";
import { useTranslation } from "@/lib/i18n/context";
import { ScreenshotGallery } from "@/components/trades/ScreenshotGallery";
import { Camera, X as XIcon } from "lucide-react";

interface JournalFormProps {
  editEntry?: {
    id: string;
    date: string;
    sessionSummary: string | null;
    emotionalState: string | null;
    disciplineScore: number | null;
    followedRules: boolean | null;
    marketCondition: string | null;
    lessonsLearned: string | null;
    improvements: string | null;
    gratitude: string | null;
  };
  editScreenshots?: { id: string; url: string; label: string | null }[];
  defaultDate?: string;
  marketConditions: string[];
}

const inputCls =
  "bg-surface2 border border-[var(--border)] text-foreground rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none w-full placeholder:text-fg-subtle";
const labelCls = "text-xs text-fg-subtle mb-1 block";

export function JournalForm({ editEntry, editScreenshots, defaultDate, marketConditions }: JournalFormProps) {
  const t = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editEntry;

  const pendingPreviewsRef = useRef<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const ref = pendingPreviewsRef.current;
    return () => { ref.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  function addFiles(files: FileList | File[]) {
    const items = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => {
        const preview = URL.createObjectURL(f);
        pendingPreviewsRef.current.push(preview);
        return { file: f, preview };
      });
    if (items.length) setPendingFiles((prev) => [...prev, ...items]);
  }

  function addPendingFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function removePending(index: number) {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const today = defaultDate ?? new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: editEntry?.date ?? today,
    sessionSummary: editEntry?.sessionSummary ?? "",
    emotionalState: editEntry?.emotionalState ?? "",
    disciplineScore: editEntry?.disciplineScore != null ? String(editEntry.disciplineScore) : "",
    followedRules: editEntry?.followedRules ?? null as boolean | null,
    marketCondition: editEntry?.marketCondition ?? "",
    lessonsLearned: editEntry?.lessonsLearned ?? "",
    improvements: editEntry?.improvements ?? "",
    gratitude: editEntry?.gratitude ?? "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      date: form.date,
      sessionSummary: form.sessionSummary || null,
      emotionalState: form.emotionalState || null,
      disciplineScore: form.disciplineScore ? parseInt(form.disciplineScore) : null,
      followedRules: form.followedRules,
      marketCondition: form.marketCondition || null,
      lessonsLearned: form.lessonsLearned || null,
      improvements: form.improvements || null,
      gratitude: form.gratitude || null,
    };

    startTransition(async () => {
      try {
        const res = isEditing
          ? await updateJournalEntry(editEntry!.id, data)
          : await createJournalEntry(data);

        if (!res || "error" in res) {
          const msg = typeof res?.error === "string" ? res.error : t("journal.toasts.saveError");
          console.error("[JournalForm] save error:", res?.error);
          toast.error(msg);
        } else {
          if (!isEditing && pendingFiles.length > 0 && "id" in res) {
            const newId = (res as { id: string }).id;
            for (const { file } of pendingFiles) {
              const fd = new FormData();
              fd.append("file", file);
              fd.append("journalEntryId", newId);
              try { await fetch("/api/upload", { method: "POST", body: fd }); } catch {}
            }
          }
          toast.success(isEditing ? t("journal.toasts.updated") : t("journal.toasts.saved"));
          if (isEditing) {
            router.push(`/journal/${editEntry!.id}`);
          } else if ("id" in res) {
            router.push(`/journal/${(res as { id: string }).id}`);
          }
        }
      } catch (err) {
        console.error("[JournalForm] unexpected:", err);
        toast.error(t("journal.toasts.saveError"));
      }
    });
  }

  const sectionTitle =
    "text-xs text-fg-subtle uppercase tracking-wider font-mono mb-4 flex items-center gap-2 after:flex-1 after:h-px after:bg-surface3";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Date & Market */}
      <div className="card p-5 space-y-4">
        <div className={sectionTitle}>{t("journal.form.session")}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("journal.form.date")}</label>
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelCls}>{t("journal.form.marketCondition")}</label>
            <select
              className={inputCls}
              value={form.marketCondition}
              onChange={(e) => setForm((f) => ({ ...f, marketCondition: e.target.value }))}
            >
              <option value="">{t("journal.form.selectCondition")}</option>
              {marketConditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("journal.form.sessionSummary")}</label>
          <textarea
            className={`${inputCls} h-28 resize-none`}
            placeholder={t("journal.form.summaryPlaceholder")}
            value={form.sessionSummary}
            onChange={(e) => setForm((f) => ({ ...f, sessionSummary: e.target.value }))}
          />
        </div>
      </div>

      {/* Psychology */}
      <div className="card p-5 space-y-4">
        <div className={sectionTitle}>{t("journal.form.psychology")}</div>

        <div>
          <label className={labelCls}>{t("journal.form.emotion")}</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {EMOTIONS.map((em) => (
              <button
                key={em.value}
                type="button"
                onClick={() => setForm((f) => ({
                  ...f,
                  emotionalState: f.emotionalState === em.value ? "" : em.value,
                }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all"
                style={form.emotionalState === em.value
                  ? { backgroundColor: `${em.color}20`, color: em.color, borderColor: `${em.color}60` }
                  : { borderColor: "var(--border)", color: "var(--fg-subtle)" }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: em.color }} />
                <span>{em.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>
            {t("journal.form.disciplineLabel", { score: form.disciplineScore || "—" })}
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-fg-subtle font-mono w-4">{t("journal.form.low")}</span>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              className="flex-1 accent-purple-500"
              value={form.disciplineScore || "5"}
              onChange={(e) => setForm((f) => ({ ...f, disciplineScore: e.target.value }))}
            />
            <span className="text-xs text-fg-subtle font-mono w-4">{t("journal.form.high")}</span>
          </div>
          <div className="flex justify-between text-[9px] text-fg-subtle font-mono mt-1 px-7">
            <span>{t("journal.form.lowLabel")}</span>
            <span>{t("journal.form.highLabel")}</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("journal.form.followedRules")}</label>
          <div className="flex gap-3">
            {[
              { val: true, label: t("journal.form.yes"), cls: "bg-green-400/15 text-green-400 border-green-400/40" },
              { val: false, label: t("journal.form.no"), cls: "bg-red-400/15 text-red-400 border-red-400/40" },
              { val: null, label: t("journal.form.na"), cls: "bg-surface2 text-fg-muted border-[var(--border)]" },
            ].map(({ val, label, cls }) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setForm((f) => ({ ...f, followedRules: val }))}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  form.followedRules === val ? cls : "border-[var(--border)] text-fg-subtle hover:text-fg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Review */}
      <div className="card p-5 space-y-4">
        <div className={sectionTitle}>{t("journal.form.review")}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{t("journal.form.lessons")}</label>
            <textarea
              className={`${inputCls} h-28 resize-none`}
              placeholder={t("journal.form.lessonsPlaceholder")}
              value={form.lessonsLearned}
              onChange={(e) => setForm((f) => ({ ...f, lessonsLearned: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("journal.form.improvements")}</label>
            <textarea
              className={`${inputCls} h-28 resize-none`}
              placeholder={t("journal.form.improvementsPlaceholder")}
              value={form.improvements}
              onChange={(e) => setForm((f) => ({ ...f, improvements: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("journal.form.gratitude")}</label>
            <textarea
              className={`${inputCls} h-28 resize-none`}
              placeholder={t("journal.form.gratitudePlaceholder")}
              value={form.gratitude}
              onChange={(e) => setForm((f) => ({ ...f, gratitude: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Screenshots */}
      {!isEditing ? (
        <div className="card p-5">
          <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono mb-4 flex items-center gap-2 after:flex-1 after:h-px after:bg-surface3">
            {t("trades.screenshots.title", { count: pendingFiles.length })}
          </div>

          {/* Thumbnails */}
          {pendingFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {pendingFiles.map((f, i) => (
                <div
                  key={i}
                  className="relative rounded-lg overflow-hidden bg-surface2 group"
                  style={{ paddingBottom: "56.25%" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon size={10} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop zone */}
          <label
            className={`cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-all ${
              dragging
                ? "border-purple-500 bg-purple-500/8"
                : "border-[var(--border)] hover:border-purple-500/50 hover:bg-surface2"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <Camera size={22} strokeWidth={1.5} className={dragging ? "text-purple-400" : "text-fg-subtle/50"} />
            <div className="text-center">
              <span className="text-sm font-semibold text-fg-muted">{t("trades.screenshots.add")}</span>
              <p className="text-xs text-fg-subtle mt-0.5">{t("trades.screenshots.dropHint")}</p>
            </div>
            <input type="file" accept="image/*" multiple className="hidden" onChange={addPendingFiles} />
          </label>
        </div>
      ) : (
        <ScreenshotGallery journalEntryId={editEntry!.id} screenshots={editScreenshots ?? []} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pb-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-purple-500 hover:bg-purple-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {isPending
            ? t("journal.form.saving")
            : isEditing
            ? t("journal.form.update")
            : t("journal.form.submit")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-[var(--border)] text-fg-muted hover:text-foreground text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          {t("journal.form.cancel")}
        </button>
      </div>
    </form>
  );
}
