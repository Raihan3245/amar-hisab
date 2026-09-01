
import { useMemo, useState } from "react";
import type { Transaction } from "../App";

interface Props {
  transactions: Transaction[];
  balance: number;
  totalIncome: number;
  totalExpense: number;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

function formatBDT(amount: number) {
  return "৳" + amount.toLocaleString("bn-BD");
}

function formatDate(date: string) {
  const d = new Date(date);

  return d.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
  });
}

function getMonthKey(date: string) {
  return date.substring(0, 7);
}

function getCurrentMonthKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
  });
}

const categoryIcons: Record<string, string> = {
  বেতন: "💼",
  খাবার: "🍽️",
  যানবাহন: "🚗",
  ফ্রিল্যান্স: "💻",
  বিল: "📄",
  বিনোদন: "🎬",
  উপহার: "🎁",
  স্বাস্থ্য: "🏥",
  শিক্ষা: "📚",
  কেনাকাটা: "🛍️",
  অন্যান্য: "📌",
};

export default function Dashboard({
  transactions,
  balance,
  totalIncome,
  totalExpense,
  onAddIncome,
  onAddExpense,
  onEdit,
  onDelete,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentMonthKey()
  );

  /*
   * যেসব মাসে transaction আছে সেগুলো বের করছি।
   * বর্তমান মাস সবসময় থাকবে।
   */
  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    months.add(getCurrentMonthKey());

    transactions.forEach((transaction) => {
      months.add(getMonthKey(transaction.date));
    });

    return Array.from(months).sort((a, b) =>
      b.localeCompare(a)
    );
  }, [transactions]);

  /*
   * Selected month অনুযায়ী transaction filter
   */
  const monthlyTransactions = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          getMonthKey(transaction.date) === selectedMonth
      )
      .sort((a, b) => {
        const dateA = `${a.date} ${a.time || "00:00"}`;
        const dateB = `${b.date} ${b.time || "00:00"}`;

        return dateB.localeCompare(dateA);
      });
  }, [transactions, selectedMonth]);

  /*
   * Selected month-এর income
   */
  const monthlyIncome = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  /*
   * Selected month-এর expense
   */
  const monthlyExpense = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  /*
   * Selected month-এর লাভ / ক্ষতি
   */
  const monthlyBalance =
    monthlyIncome - monthlyExpense;

  /*
   * Dashboard-এ সর্বোচ্চ ৫টি recent transaction
   */
  const recent = monthlyTransactions.slice(0, 5);

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="bg-teal-600 px-5 pt-12 pb-8 rounded-b-3xl">

        <div className="flex items-center justify-between mb-6">

          <div>
            <p className="text-teal-100 text-sm">
              {formatMonth(selectedMonth)}
            </p>

            <h1 className="text-white text-xl font-semibold">
              আমার ওয়ালেট
            </h1>
          </div>

          <button
            className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center"
            aria-label="বিজ্ঞপ্তি"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={1.8}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

        </div>

        {/* Balance */}
        <div className="text-center mb-6">

          <div className="flex items-center justify-center gap-2 mb-2">

            <p className="text-teal-100 text-sm">
              মোট ব্যালেন্স
            </p>

            {/* Month selector */}
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
              className="bg-white/15 text-white text-xs font-medium rounded-lg px-2 py-1 outline-none border border-white/20 cursor-pointer"
              aria-label="মাস নির্বাচন করুন"
            >
              {availableMonths.map((month) => (
                <option
                  key={month}
                  value={month}
                  className="text-slate-800 bg-white"
                >
                  {formatMonth(month)}
                </option>
              ))}
            </select>

          </div>

          <p className="text-white text-4xl font-bold tracking-tight">
            {formatBDT(monthlyBalance)}
          </p>

          {/* লাভ / ক্ষতি */}
          <p
            className={`text-xs mt-2 font-medium ${
              monthlyBalance >= 0
                ? "text-emerald-100"
                : "text-rose-100"
            }`}
          >
            {monthlyBalance >= 0
              ? "এই মাসে লাভ"
              : "এই মাসে ক্ষতি"}
          </p>

        </div>

        {/* Income / Expense cards */}
        <div className="flex gap-3">

          <div className="flex-1 bg-white/15 rounded-2xl p-3 flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-emerald-400/30 flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19V5m-7 7l7-7 7 7"
                />
              </svg>

            </div>

            <div>
              <p className="text-teal-100 text-xs">
                আয়
              </p>

              <p className="text-white font-semibold text-sm">
                {formatBDT(monthlyIncome)}
              </p>
            </div>

          </div>

          <div className="flex-1 bg-white/15 rounded-2xl p-3 flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-rose-400/30 flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fda4af"
                strokeWidth={2}
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 5v14m7-7l-7 7-7-7"
                />
              </svg>

            </div>

            <div>
              <p className="text-teal-100 text-xs">
                ব্যয়
              </p>

              <p className="text-white font-semibold text-sm">
                {formatBDT(monthlyExpense)}
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 pt-5">

        <p className="text-slate-500 text-xs font-medium mb-3 uppercase tracking-wide">
          দ্রুত যোগ করুন
        </p>

        <div className="flex gap-3">

          <button
            onClick={onAddIncome}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium text-sm active:scale-95 transition-transform"
          >
            <span className="text-lg">+</span>
            আয় যোগ
          </button>

          <button
            onClick={onAddExpense}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 font-medium text-sm active:scale-95 transition-transform"
          >
            <span className="text-lg">−</span>
            ব্যয় যোগ
          </button>

        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 pt-5">

        <div className="flex items-center justify-between mb-3">

          <p className="text-slate-700 font-semibold">
            {formatMonth(selectedMonth)}-এর লেনদেন
          </p>

          <span className="text-xs text-teal-600 font-medium">
            {monthlyTransactions.length} টি
          </span>

        </div>

        <div className="flex flex-col gap-2">

          {recent.length > 0 ? (
            recent.map((t) => (
              <TransactionRow
                key={t.id}
                t={t}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl px-4 py-8 shadow-sm text-center">

              <div className="text-3xl mb-2">
                📭
              </div>

              <p className="text-slate-500 text-sm">
                এই মাসে কোনো লেনদেন নেই
              </p>

              <p className="text-slate-400 text-xs mt-1">
                নতুন লেনদেন যোগ করলে এখানে দেখা যাবে
              </p>

            </div>
          )}

        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}

function TransactionRow({
  t,
  onEdit,
  onDelete,
}: {
  t: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const icon =
    categoryIcons[t.category] || "📌";

  const isIncome = t.type === "income";

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">

      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">
        {icon}
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-slate-800 font-medium text-sm truncate">
          {t.category}
        </p>

        <p className="text-slate-400 text-xs">
          {t.note}
        </p>

      </div>

      <div className="text-right">

        <p
          className={`font-semibold text-sm ${
            isIncome
              ? "text-emerald-600"
              : "text-rose-500"
          }`}
        >
          {isIncome ? "+" : "−"}
          {formatBDT(t.amount)}
        </p>

        <p className="text-slate-400 text-xs mb-2">
          {formatDate(t.date)}
        </p>

        <div className="flex items-center justify-end gap-1.5">

          <button
            onClick={() => onEdit(t)}
            aria-label="লেনদেন সম্পাদনা করুন"
            className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.232 5.232l3.536 3.536M4 20h4l10.768-10.768a2.5 2.5 0 10-3.536-3.536L4.464 16.464A2 2 0 004 17.879V20z"
              />
            </svg>
          </button>

          <button
            onClick={() => onDelete(t.id)}
            aria-label="লেনদেন মুছুন"
            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16m-10 4v5m4-5v5M9 7V4h6v3m-9 0l1 13h8l1-13"
              />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
}

