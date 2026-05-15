import React from 'react';
import { Edit3 } from 'lucide-react';

export function ActionBtn({ icon, label, sub, onClick, isPrimary = false }: { icon: React.ReactNode, label: string, sub: string, onClick?: () => void, isPrimary?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all group relative overflow-hidden ${
        isPrimary 
          ? 'shadow-xl hover:scale-[1.03] bg-primary text-primary-foreground border-transparent' 
          : 'border border-border shadow-sm bg-background text-foreground'
      }`}
    >
      <div className={`mb-3 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
        isPrimary ? 'bg-white/10' : ''
      }`}>
        {icon}
      </div>
      <p className="text-[11px] font-bold tracking-[0.05em] mb-1">{label}</p>
      <p className={`text-[8px] font-bold tracking-[0.05em] opacity-40`}>{sub}</p>
    </button>
  );
}

export function DetailRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-3xl border border-border transition-all group shadow-sm hover:shadow-lg hover:-translate-y-0.5 bg-background">
      <div className="w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-inner bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <p className="dashboard-eyebrow mb-1">{label}</p>
        <div className="text-lg font-bold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function SummaryCard({ label, value, sub, accent = false }: { label: string, value: string | number, sub: string, accent?: boolean }) {
  return (
    <div className={`border rounded-3xl p-6 text-center space-y-1 transition-all shadow-sm ${
      accent ? "bg-primary border-transparent" : "bg-background border-border"
    }`}>
      <p className={`text-[9px] font-bold tracking-[0.05em] ${
        accent ? 'text-primary-foreground/50' : 'text-muted-foreground'
      }`}>{label}</p>
      <p className={`text-2xl font-bold tracking-tight leading-none ${
        accent ? 'text-primary-foreground' : 'text-foreground'
      }`}>{value}</p>
      <p className={`text-[10px] font-bold tracking-[0.05em] ${
        accent ? 'text-primary-foreground/25' : 'text-border'
      }`}>{sub}</p>
    </div>
  );
}

export function BarChart({ size, strokeWidth }: { size: number, strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  );
}

export function EditableField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  return editing ? (
    <input
      ref={inputRef}
      autoFocus
      type={type}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKey}
      placeholder={label}
      className="w-full bg-transparent outline-none border-b-2 border-primary transition-colors py-1"
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className="cursor-text rounded px-2 -mx-2 transition-all flex items-center justify-between group/field hover:bg-secondary bg-transparent"
    >
      <span className="truncate">{value || <span className="font-normal italic text-border">{label}</span>}</span>
      <Edit3 size={14} className="opacity-0 group-hover/field:opacity-100 transition-opacity ml-2 text-muted-foreground" />
    </div>
  );
}

export function InlineEditableTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  return editing ? (
    <textarea
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      placeholder={placeholder}
      className="w-full min-h-[150px] rounded-2xl p-6 text-base font-medium border-none outline-none resize-none relative z-10 leading-relaxed shadow-inner transition-all focus:ring-4 bg-secondary text-foreground"
    />
  ) : (
    <div
      onDoubleClick={() => setEditing(true)}
      className="w-full min-h-[150px] cursor-text rounded-2xl p-6 text-base font-medium transition-all relative z-10 leading-relaxed shadow-inner bg-secondary text-foreground"
    >
      <p className="whitespace-pre-wrap">
        {value || <span className="text-border">{placeholder}</span>}
      </p>
    </div>
  );
}
