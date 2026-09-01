import { useState } from "react";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (!data.session) {
          setError("আপনার email verify করুন, তারপর Login করুন।");
        } else {
          onLogin();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <div className="text-center mb-7">
          <div className="text-4xl mb-3">💰</div>

          <h1 className="text-2xl font-bold text-slate-800">
            Expense Tracker
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            {isSignup ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "আপনার অ্যাকাউন্টে Login করুন"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ অক্ষর"
              minLength={6}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading
              ? "অপেক্ষা করুন..."
              : isSignup
                ? "অ্যাকাউন্ট তৈরি করুন"
                : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
          className="w-full mt-5 text-sm text-blue-600 font-medium"
        >
          {isSignup
            ? "আগে থেকেই অ্যাকাউন্ট আছে? Login করুন"
            : "নতুন অ্যাকাউন্ট তৈরি করতে চান? Signup করুন"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-8">
          App Developed by ARIFIN MAHMUD
        </p>
      </div>
    </div>
  );
}