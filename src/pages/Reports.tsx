import { useState } from "react";
import type { Transaction } from "../App";

interface Props {
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

function formatBDT(n: number) {
  return "৳" + n.toLocaleString("bn-BD");
}

const categoryColors: Record<string, string> = {
  বেতন: "#0d9488", ফ্রিল্যান্স: "#0891b2", উপহার: "#7c3aed", বিনিয়োগ: "#059669", ব্যবসা: "#1d4ed8", ভাড়া: "#b45309",
  খাবার: "#f43f5e", যানবাহন: "#f97316", বিল: "#8b5cf6", বিনোদন: "#ec4899", স্বাস্থ্য: "#10b981", শিক্ষা: "#3b82f6", কেনাকাটা: "#f59e0b", অন্যান্য: "#6b7280",
};

export default function Reports({ transactions, totalIncome, totalExpense }: Props) {
  const [view, setView] = useState<"expense" | "income">("expense");

  const relevant = transactions.filter((t) => t.type === view);
  const total = view === "expense" ? totalExpense : totalIncome;

  const byCategory: Record<string, number> = {};
  relevant.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(0) : "0";

  // Donut chart segments
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = sorted.map(([cat, amt]) => {
    const pct = total > 0 ? amt / total : 0;
    const dash = pct * circumference;
    const seg = { cat, amt, pct, dash, offset, color: categoryColors[cat] || "#6b7280" };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-teal-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-xl font-semibold mb-1">রিপোর্ট</h1>
        <p className="text-teal-100 text-sm">আগস্ট ২০২৬</p>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard label="মোট আয়" value={formatBDT(totalIncome)} color="text-emerald-600" bg="bg-emerald-50" />
          <SummaryCard label="মোট ব্যয়" value={formatBDT(totalExpense)} color="text-rose-500" bg="bg-rose-50" />
          <SummaryCard label="সঞ্চয়" value={formatBDT(savings)} color={savings >= 0 ? "text-teal-600" : "text-rose-500"} bg="bg-teal-50" />
        </div>

        {/* Savings rate bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-700 font-medium text-sm">সঞ্চয়ের হার</p>
            <p className="text-teal-600 font-bold">{savingsRate}%</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, Number(savingsRate)))}%` }}
            />
          </div>
          <p className="text-slate-400 text-xs mt-1.5">আয়ের {savingsRate}% সঞ্চয় হয়েছে</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setView("expense")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === "expense" ? "bg-white text-rose-500 shadow" : "text-slate-500"}`}
          >
            ব্যয়ের বিভাগ
          </button>
          <button
            onClick={() => setView("income")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === "income" ? "bg-white text-emerald-600 shadow" : "text-slate-500"}`}
          >
            আয়ের বিভাগ
          </button>
        </div>

        {/* Donut chart */}
        {segments.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
            <div className="flex-shrink-0">
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
                {segments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                    strokeDashoffset={-seg.offset + circumference * 0.25}
                    strokeLinecap="butt"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                ))}
                <text x="75" y="72" textAnchor="middle" className="text-xs" fontSize="11" fill="#64748b">মোট</text>
                <text x="75" y="88" textAnchor="middle" fontWeight="700" fontSize="13" fill="#0f172a">
                  {formatBDT(total)}
                </text>
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {sorted.slice(0, 5).map(([cat, amt]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: categoryColors[cat] || "#6b7280" }} />
                  <span className="text-slate-600 text-xs truncate flex-1">{cat}</span>
                  <span className="text-slate-800 text-xs font-medium">{total > 0 ? Math.round((amt / total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-slate-700 font-medium text-sm mb-3">বিস্তারিত বিভাজন</p>
          <div className="flex flex-col gap-3">
            {sorted.map(([cat, amt]) => {
              const pct = total > 0 ? (amt / total) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-600 text-sm">{cat}</span>
                    <span className="text-slate-800 text-sm font-medium">{formatBDT(amt)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: categoryColors[cat] || "#6b7280" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-3`}>
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`${color} font-bold text-sm leading-tight`}>{value}</p>
    </div>
  );
}
