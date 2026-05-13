"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Camera, X } from "lucide-react";

interface Screenshot {
  id: string;
  url: string;
  label: string | null;
}

interface ScreenshotGalleryProps {
  tradeId?: string;
  journalEntryId?: string;
  screenshots: Screenshot[];
}

async function deleteScreenshot(id: string): Promise<void> {
  const res = await fetch(`/api/screenshots/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("delete failed");
}

export function ScreenshotGallery({ tradeId, journalEntryId, screenshots: initialScreenshots }: ScreenshotGalleryProps) {
  const t = useTranslation();
  const [screenshots, setScreenshots] = useState(initialScreenshots);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        if (tradeId) formData.append("tradeId", tradeId);
        if (journalEntryId) formData.append("journalEntryId", journalEntryId);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          throw new Error(t("trades.screenshots.uploadError"));
        }
        const data = await res.json();
        setScreenshots((prev) => [...prev, { id: data.id, url: data.url, label: null }]);
      }
      toast.success(t("trades.screenshots.uploaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("trades.screenshots.uploadError"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleDelete(id: string) {
    if (!confirm(t("trades.screenshots.confirmDelete"))) return;
    startTransition(async () => {
      try {
        await deleteScreenshot(id);
        setScreenshots((prev) => prev.filter((s) => s.id !== id));
        toast.success(t("trades.screenshots.deleted"));
      } catch {
        toast.error(t("trades.screenshots.deleteError"));
      }
    });
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono">
          {t("trades.screenshots.title", { count: screenshots.length })}
        </div>
        <label className="cursor-pointer bg-surface2 hover:bg-surface3 border border-[var(--border)] text-fg-muted hover:text-foreground text-xs px-3 py-1.5 rounded-lg transition-all font-mono">
          <Camera size={13} strokeWidth={1.75} className="mr-1.5" />
          {uploading ? t("trades.screenshots.uploading") : t("trades.screenshots.add")}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {screenshots.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-xl py-10 text-center">
          <Camera size={28} strokeWidth={1.25} className="mx-auto mb-2 text-fg-subtle/30" />
          <div className="text-fg-subtle text-sm font-mono">{t("trades.screenshots.noScreenshots")}</div>
          <div className="text-fg-subtle/60 text-xs mt-1">{t("trades.screenshots.hint")}</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {screenshots.map((ss) => (
            <div
              key={ss.id}
              className="relative group rounded-lg overflow-hidden bg-surface2"
              style={{ paddingBottom: "56.25%" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ss.url}
                alt={ss.label ?? "Screenshot"}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                onClick={() => setLightbox(ss.url)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setLightbox(ss.url)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 rounded font-mono transition-all"
                >
                  {t("trades.screenshots.view")}
                </button>
                <button
                  onClick={() => handleDelete(ss.id)}
                  disabled={isPending}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-1 rounded transition-all flex items-center justify-center"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Screenshot full"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
