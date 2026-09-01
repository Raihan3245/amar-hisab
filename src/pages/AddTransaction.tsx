
import { useState } from "react";
import type { Transaction, TransactionType } from "../App";

interface Props {
  defaultType: TransactionType;
  transaction?: Transaction | null;
  onSave: (t: Omit<Transaction, "id">) => void;
  onCancel: () => void;
}

const incomeCategories = [ 
  "বেতন",
  "ফ্রিল্যান্স",
  "উপহার",
  "বিনিয়োগ",
  "ব্যবসা",
  "ভাড়া",
  "টাকা জমা",
  "অন্যান্য",
];

const expenseCategories = [
  "বাজার",
  "খাবার",
  "বাসা ভাড়া",
  "বিল",
  "যাতায়াত",
  "কেনাকাটা",
  "চিকিৎসা",
  "অন্যান্য",
];
const categoryIcons: Record<string, string> = {
  বেতন: "💼",
  ফ্রিল্যান্স: "💻",
  উপহার: "🎁",
  বিনিয়োগ: "📈",
  ব্যবসা: "🏢",
  ভাড়া: "🏠",
  "টাকা জমা": "💰",
  বাজার: "🛒",
খাবার: "🍛",
"বাসা ভাড়া": "🏠",
বিল: "💡",
যাতায়াত: "🚗",
কেনাকাটা: "🛍️",
চিকিৎসা: "💊",
অন্যান্য: "📌",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

function nowTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

export default function AddTransaction({ defaultType, transaction, onSave, onCancel }: Props) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? defaultType);
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [category, setCategory] = useState(transaction?.category ?? "");
  const [note, setNote] = useState(transaction?.note ?? "");
  const [date, setDate] = useState(transaction?.date ?? today());
  const [time, setTime] = useState(transaction?.time ?? nowTime());

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleSave = () => {
    if (!amount || !category) return;
    onSave({ type, amount: parseFloat(amount), category, note, date, time });
  };

  const isIncome = type === "income";

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div
        className={`${isIncome ? "bg-emerald-600" : "bg-rose-500"} px-5 pt-12 pb-8 rounded-b-3xl transition-colors duration-300`}
      >
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-white text-lg font-semibold">
            {transaction ? "লেনদেন সম্পাদনা করুন" : "লেনদেন যোগ করুন"}
          </h1>
        </div>

        {/* Type Toggle */}
        <div className="flex bg-white/20 rounded-2xl p-1 mb-5">
          <button
            onClick={() => {
              setType("income");
              setCategory("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === "income"
                ? "bg-white text-emerald-600 shadow"
                : "text-white"
            }`}
          >
            আয়
          </button>

          <button
            onClick={() => {
              setType("expense");
              setCategory("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              type === "expense"
                ? "bg-white text-rose-500 shadow"
                : "text-white"
            }`}
          >
            ব্যয়
          </button>
        </div>

        {/* Amount */}
        <div className="text-center">
          <p className="text-white/70 text-sm mb-2">পরিমাণ (টাকা)</p>

          <div className="flex items-center justify-center gap-2">
            <span className="text-white text-3xl font-light">৳</span>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="০"
              className="bg-transparent text-white text-4xl font-bold w-40 text-center outline-none placeholder:text-white/40"
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-5 flex flex-col gap-4">
        {/* Category */}
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">বিভাগ</p>

          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-xs transition-all ${
                  category === cat
                    ? isIncome
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-rose-50 border-rose-300 text-rose-600"
                    : "bg-white border-slate-200 text-slate-600"
                }`}
              >
                <span className="text-lg">{categoryIcons[cat]}</span>
                <span className="leading-tight text-center">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <p className="text-slate-600 text-sm font-medium mb-2">নোট</p>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="বিস্তারিত লিখুন..."
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400 transition-colors"
          />
        </div>

        {/* Date & Time */}
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-slate-600 text-sm font-medium mb-2">তারিখ</p>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex-1">
            <p className="text-slate-600 text-sm font-medium mb-2">সময়</p>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm outline-none focus:border-teal-400"
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!amount || !category}
          className={`w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 transition-all active:scale-95 disabled:opacity-40 ${
            isIncome
              ? "bg-emerald-600 shadow-lg shadow-emerald-200"
              : "bg-rose-500 shadow-lg shadow-rose-200"
          }`}
        >
          সংরক্ষণ করুন
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
