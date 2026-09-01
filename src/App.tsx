
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import { supabase } from "./lib/supabase";

export type Page =
  | "dashboard"
  | "add"
  | "history"
  | "reports"
  | "settings";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
  time: string;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState<Page>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [editingType, setEditingType] =
    useState<TransactionType>("expense");

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // ==============================
  // AUTH SESSION
  // ==============================

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ==============================
  // LOAD TRANSACTIONS
  // ==============================

  useEffect(() => {
    if (!session?.user?.id) {
      setTransactions([]);
      return;
    }

    const loadTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (error) {
        console.error(
          "Transaction loading error:",
          error
        );
        return;
      }

      const formattedTransactions: Transaction[] = (
        data || []
      ).map((item) => ({
        id: item.id,
        type: item.type as TransactionType,
        amount: Number(item.amount),
        category: item.category,
        note: item.description || "",
        date: item.date,
        time: item.time || "00:00",
      }));

      setTransactions(formattedTransactions);
    };

    loadTransactions();
  }, [session]);

  // ==============================
  // ADD TRANSACTION
  // ==============================

  const addTransaction = async (
    t: Omit<Transaction, "id">
  ) => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: session.user.id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.note,
        date: t.date,
        time: t.time,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Add transaction error:",
        error
      );

      alert("লেনদেন সংরক্ষণ করা যায়নি।");
      return;
    }

    const newTransaction: Transaction = {
      id: data.id,
      type: data.type as TransactionType,
      amount: Number(data.amount),
      category: data.category,
      note: data.description || "",
      date: data.date,
      time: data.time || "00:00",
    };

    setTransactions((prev) => [
      newTransaction,
      ...prev,
    ]);

    setPage("dashboard");
  };

  // ==============================
  // UPDATE TRANSACTION
  // ==============================

  const updateTransaction = async (
    t: Omit<Transaction, "id">
  ) => {
    if (
      !editingTransaction ||
      !session?.user?.id
    ) {
      return;
    }

    const { error } = await supabase
      .from("transactions")
      .update({
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.note,
        date: t.date,
        time: t.time,
      })
      .eq("id", editingTransaction.id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error(
        "Update transaction error:",
        error
      );

      alert("লেনদেন আপডেট করা যায়নি।");
      return;
    }

    setTransactions((prev) =>
      prev.map((item) =>
        item.id === editingTransaction.id
          ? {
              ...t,
              id: editingTransaction.id,
            }
          : item
      )
    );

    setEditingTransaction(null);
    setPage("history");
  };

  // ==============================
  // EDIT TRANSACTION
  // ==============================

  const editTransaction = (
    t: Transaction
  ) => {
    setEditingTransaction(t);
    setEditingType(t.type);
    setPage("add");
  };

  // ==============================
  // DELETE SINGLE TRANSACTION
  // ==============================

  const deleteTransaction = async (
    id: string
  ) => {
    const transaction = transactions.find(
      (t) => t.id === id
    );

    if (
      !transaction ||
      !session?.user?.id
    ) {
      return;
    }

    const confirmed = window.confirm(
      `এই লেনদেনটি মুছে ফেলতে চান?\n${transaction.category} — ৳${transaction.amount.toLocaleString(
        "bn-BD"
      )}`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) {
      console.error(
        "Delete transaction error:",
        error
      );

      alert("লেনদেন মুছে ফেলা যায়নি।");
      return;
    }

    setTransactions((prev) =>
      prev.filter((t) => t.id !== id)
    );
  };

  // ==============================
  // LOGOUT
  // ==============================

  const logout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      alert("লগ আউট করা যায়নি।");
      return;
    }

    setTransactions([]);
    setEditingTransaction(null);
    setPage("dashboard");
    setSession(null);
  };

  // ==============================
  // TOTALS
  // ==============================

  const totalIncome = transactions
    .filter(
      (t) => t.type === "income"
    )
    .reduce(
      (sum, t) => sum + t.amount,
      0
    );

  const totalExpense = transactions
    .filter(
      (t) => t.type === "expense"
    )
    .reduce(
      (sum, t) => sum + t.amount,
      0
    );

  const balance =
    totalIncome - totalExpense;

  // ==============================
  // ADD BUTTON NAVIGATION
  // ==============================

  const handleAddNav = (
    type: TransactionType = "expense"
  ) => {
    setEditingTransaction(null);
    setEditingType(type);
    setPage("add");
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-600">
          লোড হচ্ছে...
        </div>
      </div>
    );
  }

  // ==============================
  // LOGIN
  // ==============================

  if (!session) {
    return (
      <Login
        onLogin={() => {}}
      />
    );
  }

  // ==============================
  // MAIN APP
  // ==============================

  return (
    <div className="flex items-center justify-center min-h-full bg-slate-100">
      <div
        className="relative w-full max-w-sm min-h-full bg-[#f8fafc] flex flex-col overflow-hidden shadow-2xl"
        style={{
          maxHeight: "100dvh",
          height: "100dvh",
        }}
      >
        <div className="flex-1 overflow-y-auto pb-20">

          {/* DASHBOARD */}
          {page === "dashboard" && (
            <Dashboard
              transactions={transactions}
              balance={balance}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              onAddIncome={() =>
                handleAddNav("income")
              }
              onAddExpense={() =>
                handleAddNav("expense")
              }
              onEdit={editTransaction}
              onDelete={deleteTransaction}
            />
          )}

          {/* ADD / EDIT */}
          {page === "add" && (
            <AddTransaction
              defaultType={editingType}
              transaction={editingTransaction}
              onSave={
                editingTransaction
                  ? updateTransaction
                  : addTransaction
              }
              onCancel={() => {
                setEditingTransaction(null);
                setPage("dashboard");
              }}
            />
          )}

          {/* HISTORY */}
          {page === "history" && (
            <History
              transactions={transactions}
              onEdit={editTransaction}
              onDelete={deleteTransaction}
            />
          )}

          {/* REPORTS */}
          {page === "reports" && (
            <Reports
              transactions={transactions}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
            />
          )}

          {/* SETTINGS */}
          {page === "settings" && (
            <Settings
              transactions={transactions}
              onLogout={logout}
              userEmail={
                session.user.email || ""
              }
            />
          )}
        </div>

        {/* BOTTOM NAVIGATION */}
        <BottomNav
          page={page}
          onNavigate={setPage}
          onAdd={() =>
            handleAddNav("expense")
          }
        />
      </div>
    </div>
  );
}

