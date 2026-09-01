import type { Page } from "../App";

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  onAdd: () => void;
}

const navItems = [
  { id: "dashboard", icon: HomeIcon, label: "হোম" },
  { id: "history", icon: HistoryIcon, label: "লেনদেন" },
  { id: "reports", icon: ChartIcon, label: "রিপোর্ট" },
  { id: "settings", icon: SettingsIcon, label: "সেটিংস" },
] as const;

export default function BottomNav({ page, onNavigate, onAdd }: Props) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-slate-200 shadow-lg z-50">
      <div className="flex items-center justify-around px-2 py-2 relative">
        {navItems.slice(0, 2).map((item) => (
          <NavButton key={item.id} item={item} active={page === item.id} onNavigate={onNavigate} />
        ))}

        {/* Center Add Button */}
        <button
          onClick={onAdd}
          className="flex flex-col items-center justify-center -mt-6 w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-300 active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {navItems.slice(2).map((item) => (
          <NavButton key={item.id} item={item} active={page === item.id} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function NavButton({ item, active, onNavigate }: { item: typeof navItems[number]; active: boolean; onNavigate: (p: Page) => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onNavigate(item.id as Page)}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${active ? "text-teal-600" : "text-slate-400"}`}
    >
      <Icon active={active} />
      <span className="text-xs font-medium">{item.label}</span>
    </button>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
