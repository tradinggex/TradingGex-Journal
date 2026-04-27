import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JournalForm } from "@/components/journal/JournalForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJournalPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const dict = await getDictionary();

  const { data: entry } = await supabase
    .from("JournalEntry")
    .select("*")
    .eq("id", id)
    .eq("userId", user.userId)
    .maybeSingle();
  if (!entry) notFound();

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1">
          <Link href={`/journal/${id}`} className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
            {dict.journal.detail.back}
          </Link>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.topbar.editTrade}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{entry.date}</p>
      </div>
      <JournalForm editEntry={entry} marketConditions={[...dict.marketConditions]} />
    </div>
  );
}
