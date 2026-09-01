
import { useState } from "react";
import type { Transaction } from "../App";

interface Props {
  transactions: Transaction[];
  onLogout: () => void;
  userEmail: string;
}

function formatBDT(amount: number) {
  return "৳" + amount.toLocaleString("bn-BD");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function exportTransactionsToPdf(
  transactions: Transaction[]
) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const sortedTransactions = [...transactions].sort(
    (a, b) => {
      const dateA = new Date(
        `${a.date}T${a.time || "00:00"}`
      ).getTime();

      const dateB = new Date(
        `${b.date}T${b.time || "00:00"}`
      ).getTime();

      return dateB - dateA;
    }
  );

  const rows = sortedTransactions
    .map(
      (t, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${formatDate(t.date)}</td>
          <td>${escapeHtml(t.category)}</td>
          <td>${escapeHtml(t.note || "—")}</td>
          <td>${t.type === "income" ? "আয়" : "ব্যয়"}</td>
          <td class="amount ${t.type}">
            ${t.type === "income" ? "+" : "−"}${formatBDT(t.amount)}
          </td>
        </tr>
      `
    )
    .join("");

  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=700"
  );

  if (!printWindow) {
    window.alert(
      "PDF তৈরি করতে পপ-আপ অনুমতি দিন।"
    );
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>লেনদেনের রিপোর্ট</title>

      <style>
        @page {
          size: A4;
          margin: 14mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family:
            "Noto Sans Bengali",
            "Noto Sans",
            Arial,
            sans-serif;
          color: #0f172a;
          margin: 0;
        }

        h1 {
          margin: 0;
          font-size: 24px;
          color: #0f766e;
        }

        .subtitle {
          color: #64748b;
          margin: 5px 0 18px;
          font-size: 13px;
        }

        .brand {
          border-bottom: 2px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .card {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .label {
          font-size: 11px;
          color: #64748b;
        }

        .value {
          font-size: 17px;
          font-weight: 700;
          margin-top: 3px;
        }

        .income {
          color: #059669;
        }

        .expense {
          color: #e11d48;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
        }

        th {
          background: #f0fdfa;
          color: #115e59;
          text-align: left;
        }

        th,
        td {
          border: 1px solid #cbd5e1;
          padding: 7px 6px;
          vertical-align: top;
        }

        .amount {
          text-align: right;
          font-weight: 700;
          white-space: nowrap;
        }

        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>

    <body>
      <div class="brand">
        <h1>আমার ওয়ালেট — লেনদেনের রিপোর্ট</h1>
        <div class="subtitle">
          সম্পূর্ণ লেনদেনের তালিকা
        </div>
      </div>

      <div class="summary">
        <div class="card">
          <div class="label">মোট ব্যালেন্স</div>
          <div class="value">
            ${formatBDT(balance)}
          </div>
        </div>

        <div class="card">
          <div class="label">মোট আয়</div>
          <div class="value income">
            ${formatBDT(totalIncome)}
          </div>
        </div>

        <div class="card">
          <div class="label">মোট ব্যয়</div>
          <div class="value expense">
            ${formatBDT(totalExpense)}
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>তারিখ</th>
            <th>ক্যাটাগরি</th>
            <th>বিবরণ</th>
            <th>ধরন</th>
            <th>পরিমাণ</th>
          </tr>
        </thead>

        <tbody>
          ${
            rows ||
            `
              <tr>
                <td colspan="6" style="text-align:center">
                  কোনো লেনদেন নেই
                </td>
              </tr>
            `
          }
        </tbody>
      </table>

      <div class="footer">
        <span>
          App Developed by ARIFIN MAHMUD
        </span>

        <span>v1.0.0</span>
      </div>

      <script>
        window.onload = function () {
          setTimeout(function () {
            window.print();
          }, 300);
        };

        window.onafterprint = function () {
          window.close();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}

export default function Settings({
  transactions,
  onLogout,
  userEmail,
}: Props) {
  const [currency, setCurrency] =
    useState("BDT");

  const [notifications, setNotifications] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(false);

  const [budget, setBudget] =
    useState("30000");

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="bg-teal-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <h1 className="text-white text-xl font-semibold">
          সেটিংস
        </h1>

        <p className="text-teal-100 text-sm mt-1">
          অ্যাপ কাস্টমাইজ করুন
        </p>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* Profile */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-2xl">
            👤
          </div>

          <div>
            <p className="text-slate-800 font-semibold">
              আমার অ্যাকাউন্ট
            </p>

            <p className="text-slate-400 text-sm">
              {userEmail}
            </p>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-slate-700 font-semibold text-sm mb-3">
            মাসিক বাজেট
          </p>

          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
            <span className="text-teal-600 font-bold">
              ৳
            </span>

            <input
              type="number"
              value={budget}
              onChange={(e) =>
                setBudget(e.target.value)
              }
              className="flex-1 bg-transparent outline-none text-slate-700 text-sm"
            />
          </div>
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          <p className="text-slate-700 font-semibold text-sm px-4 pt-4 pb-2">
            ডেটা ব্যবস্থাপনা
          </p>

          <ActionRow
            icon="📄"
            label="PDF হিসেবে ডেটা এক্সপোর্ট করুন"
            color="text-slate-700"
            onClick={() =>
              exportTransactionsToPdf(
                transactions
              )
            }
          />

          <Divider />

          <ActionRow
            icon="🔄"
            label="ডেটা ব্যাকআপ করুন"
            color="text-slate-700"
          />
        </div>

        {/* App info */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          <p className="text-slate-700 font-semibold text-sm px-4 pt-4 pb-2">
            অ্যাপ সম্পর্কে
          </p>
          
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xl">
              ℹ️
            </span>

            <span className="text-slate-700 text-sm flex-1">
              সংস্করণ
            </span>

            <span className="text-slate-400 text-sm">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xl">
              👨‍💻
            </span>

            <span className="text-slate-700 text-sm flex-1">
              Developed by
            </span>

            <span className="text-teal-600 text-sm font-semibold">
              ARIFIN MAHMUD
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl border-2 border-rose-200 text-rose-500 font-semibold text-sm active:scale-95 transition-transform"
        >
          লগ আউট করুন
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        value
          ? "bg-teal-500"
          : "bg-slate-200"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          value
            ? "translate-x-5.5"
            : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SettingRow({
  icon,
  label,
  right,
}: {
  icon: string;
  label: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">

      <span className="text-xl">
        {icon}
      </span>

      <span className="text-slate-700 text-sm flex-1">
        {label}
      </span>

      {right}
    </div>
  );
}

function ActionRow({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 w-full text-left active:bg-slate-50 transition-colors"
    >
      <span className="text-xl">
        {icon}
      </span>

      <span
        className={`${color} text-sm flex-1`}
      >
        {label}
      </span>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}

function Divider() {
  return (
    <div className="h-px bg-slate-100 mx-4" />
  );
}
