import { getDictionary } from "@/lib/i18n";
import { JournalForm } from "@/components/journal/JournalForm";

export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
  const dict = await getDictionary();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.topbar.newJournal}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.topbar.newJournalSub}</p>
      </div>
      <JournalForm defaultDate={today} marketConditions={[...dict.marketConditions]} />
    </div>
  );
}
