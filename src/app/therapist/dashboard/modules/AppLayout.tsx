import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'scheduler', label: 'Agenda', icon: 'calendar_today' },
  { id: 'clients', label: 'Clients', icon: 'group' },
  { id: 'accounting', label: 'Finances', icon: 'payments' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const filledIcon = {
  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
} as const;

const outlinedIcon = {
  fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
} as const;

function isActive(itemId: string, activePage: string) {
  if (itemId === 'clients' && activePage === 'client-detail') return true;
  return itemId === activePage;
}

export default function AppLayout({ children, activePage, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1c1b] [font-family:'Manrope',sans-serif]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-stone-200 bg-stone-50 p-6 md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#435544] text-white shadow-sm">
            <span className="material-symbols-outlined" style={filledIcon}>
              spa
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-emerald-900 [font-family:'Public_Sans',sans-serif]">
              Serene Sanctuary
            </h1>
            <p className="text-xs tracking-wide text-stone-600">Therapist Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.id, activePage);
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-all duration-300 ${
                  active
                    ? 'bg-emerald-50 font-medium text-emerald-900 shadow-sm'
                    : 'text-stone-500 hover:bg-emerald-50/50 hover:text-stone-800'
                }`}
              >
                <span className="material-symbols-outlined" style={active ? filledIcon : outlinedIcon}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <button
            onClick={() => onNavigate('scheduler')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#435544] py-3 text-sm font-medium text-white shadow-md transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]" style={filledIcon}>
              add
            </span>
            <span>New Appointment</span>
          </button>

          <button className="flex items-center gap-3 px-4 py-3 text-sm text-stone-500 transition-all hover:text-stone-800">
            <span className="material-symbols-outlined" style={outlinedIcon}>
              help_outline
            </span>
            <span>Help Center</span>
          </button>

          <div className="flex items-center gap-3 border-t border-stone-100 px-2 py-4">
            <img
              alt="Professional therapist profile picture"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8xKgNfzfZUWy66iEIdCMM4ahzz9yHPFmnVE49KnBWdSm9KkxUxaIBOfjmnG6XI29zXRvzmbVwOndpeqF4zNQka8dBtbXGnBNsK8Rl7rvFD80XICiMiVSn00Mj32j9WD8mkeloPI3OEnCh-f4iKGXd88L7di39K-k8i4yHkLfEozl-vn_R_v9-aRATbYREguISElVGYMTbsq3yU_I3wHqOzpCghBjhJE0-AzHm7LRwD7AkLbzBLbvx6joz3hsVAdLWxM8yIWB7Y-c"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">João Silva</p>
              <p className="truncate text-xs text-stone-500">Holistic Practitioner</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col pb-20 md:ml-64 md:pb-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="relative w-full max-w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-stone-400" style={outlinedIcon}>
              search
            </span>
            <input
              type="text"
              placeholder="Search appointments, clients, or notes..."
              className="w-full rounded-full border border-transparent bg-[#f4f3f1] py-2 pl-10 pr-4 text-sm text-stone-600 outline-none transition focus:border-emerald-500/20 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>

          <div className="ml-4 hidden items-center gap-6 md:flex">
            <button className="relative text-stone-500 transition-colors hover:text-emerald-700">
              <span className="material-symbols-outlined" style={outlinedIcon}>
                notifications
              </span>
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-[#ba1a1a]" />
            </button>
            <button className="text-stone-500 transition-colors hover:text-emerald-700">
              <span className="material-symbols-outlined" style={outlinedIcon}>
                account_circle
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-stone-200 bg-stone-50/95 px-3 py-2 backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, activePage);
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] transition-all ${
                active ? 'text-emerald-900' : 'text-stone-500'
              }`}
            >
              <span className="material-symbols-outlined" style={active ? filledIcon : outlinedIcon}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
