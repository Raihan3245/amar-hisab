import { useState } from "react";
import type { Transaction } from "../App";

interface Props {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

function formatBDT(amount: number) {
  return "৳" + amount.toLocaleString("bn-BD");
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("bn-BD", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

const categoryIcons: Record<string, string> = {
  বেতন: "💼", খাবার: "🍽️", যানবাহন: "🚗", ফ্রিল্যান্স: "💻", বিল: "📄", বিনোদন: "🎬",
  উপহার: "🎁", স্বাস্থ্য: "🏥", শিক্ষা: "📚", কেনাকাটা: "🛍️", বিনিয়োগ: "📈", ব্যবসা: "🏢", ভাড়া: "🏠", অন্যান্য: "📌",
};

type Filter = "all" | "income" | "expense";

export default function History({ transactions, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    if (filter === "income" && t.type !== "income") return false;
    if (filter === "expense" && t.type !== "expense") return false;
    if (search && !t.category.includes(search) && !t.note.includes(search)) return false;
    return true;
  });

  // Group by date
  const groups: Record<string, Transaction[]> = {};
  filtered.forEach((t) => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-teal-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-xl font-semibold mb-4">লেনদেনের ইতিহাস</h1>
        {/* Search */}
        <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} className="w-4 h-4 opacity-70 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="খুঁজুন..."
            className="bg-transparent text-white placeholder:text-white/50 text-sm outline-none flex-1"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-5 pt-4">
        {(["all", "income", "expense"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f ? "bg-teal-600 text-white shadow-sm" : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            {f === "all" ? "সব" : f === "income" ? "আয়" : "ব্যয়"}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 flex items-center">{filtered.length}টি</span>
      </div>

      {/* Grouped transactions */}
      <div className="px-5 pt-4 flex flex-col gap-4">
        {sortedDates.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">📭</p>
            <p>কোনো লেনদেন পাওয়া যায়নি</p>
          </div>
        )}
        {sortedDates.map((date) => {
          const dayTotal = groups[date].reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0);
          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-xs font-medium">{formatDate(date)}</p>
                <p className={`text-xs font-semibold ${dayTotal >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {dayTotal >= 0 ? "+" : "−"}৳{Math.abs(dayTotal).toLocaleString("bn-BD")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {groups[date].map((t) => (
                  <div key={t.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0">
                      {categoryIcons[t.category] || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 font-medium text-sm">{t.category}</p>
                      <p className="text-slate-400 text-xs truncate">{t.note || "—"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-semibold text-sm ${t.type === "income" ? "text-emerald-600" : "text-rose-500"}`}>
                        {t.type === "income" ? "+" : "−"}৳{t.amount.toLocaleString("bn-BD")}
                      </p>
                      <p className="text-slate-400 text-xs mb-2">{formatTime(t.time)}</p>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(t)}
                          aria-label="লেনদেন সম্পাদনা করুন"
                          className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20h4l10.768-10.768a2.5 2.5 0 10-3.536-3.536L4.464 16.464A2 2 0 004 17.879V20z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          aria-label="লেনদেন মুছুন"
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16m-10 4v5m4-5v5M9 7V4h6v3m-9 0l1 13h8l1-13" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-6" />
    </div>
  );
}
