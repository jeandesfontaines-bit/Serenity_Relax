import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
   return (
      <div className="mb-5 space-y-1">
         <h4 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h4>
         <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
   );
}

export function InlineEditableField({
   placeholder,
   value,
   onChange,
   type = 'text',
   align = 'left',
   className = '',
   editingClassName = '',
}: {
   placeholder: string,
   value: string,
   onChange: (v: string) => void,
   type?: string,
   align?: 'left' | 'center',
   className?: string,
   editingClassName?: string,
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

   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') {
         setDraft(value);
         setEditing(false);
      }
   };

   return editing ? (
      <input
         autoFocus
         type={type}
         value={draft}
         onChange={e => setDraft(e.target.value)}
         onBlur={commit}
         onKeyDown={handleKey}
         placeholder={placeholder}
         className={`w-full rounded-2xl border border-[#d9e2ee] bg-white px-4 text-[15px] font-medium tracking-tight text-slate-900 outline-none transition focus:border-slate-900 focus:ring-0 ${align === 'center' ? 'text-center' : ''} ${editingClassName || 'h-12'}`}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`flex min-h-[3rem] cursor-text items-center rounded-2xl border border-[#d9e2ee] bg-white px-4 text-[15px] font-medium tracking-tight text-slate-900 transition ${align === 'center' ? 'justify-center text-center' : ''} ${className}`}
      >
         <span className="truncate">
            {value || <span className="text-slate-400">{placeholder}</span>}
         </span>
      </div>
   );
}

export function InlineEditableTextarea({
   placeholder,
   value,
   onChange,
   rows = 3,
   variant = 'default',
}: {
   placeholder: string,
   value: string,
   onChange: (v: string) => void,
   rows?: number,
   variant?: 'default' | 'soft',
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

   const baseView = variant === 'soft'
      ? 'border border-[#d9e2ee] bg-[#f8fbff]'
      : 'border shadow-sm';
   const baseEdit = variant === 'soft'
      ? 'border border-slate-900 bg-white'
      : 'border shadow-sm';

   return editing ? (
      <textarea
         autoFocus
         value={draft}
         onChange={(e) => setDraft(e.target.value)}
         onBlur={commit}
         rows={rows}
         placeholder={placeholder}
         className={`w-full resize-none rounded-[20px] p-4 text-[15px] font-medium leading-7 text-slate-900 outline-none ${baseEdit}`}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`min-h-[120px] w-full cursor-text rounded-[20px] p-4 text-[15px] font-medium leading-7 text-slate-900 transition ${baseView}`}
      >
         <p className="whitespace-pre-wrap leading-relaxed">
            {value || <span className="text-slate-400">{placeholder}</span>}
         </p>
      </div>
   );
}

export function InlineEditableFieldDark({
   placeholder,
   value,
   onChange,
   type = 'text',
}: {
   placeholder: string,
   value: string,
   onChange: (v: string) => void,
   type?: string,
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

   const masked = value ? '•'.repeat(Math.min(Math.max(value.length, 6), 12)) : '';

   return editing ? (
      <input
         autoFocus
         type={type}
         value={draft}
         onChange={e => setDraft(e.target.value)}
         onBlur={commit}
         onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
               setDraft(value);
               setEditing(false);
            }
         }}
         placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-white/25 bg-white/10 px-4 text-[15px] font-medium tracking-tight text-white outline-none placeholder:text-white/35"
       />
   ) : (
      <div
          onDoubleClick={() => setEditing(true)}
          className="flex h-12 cursor-text items-center rounded-2xl border border-white/10 bg-white/8 px-4 text-[15px] font-medium tracking-tight text-white transition-all"
       >
         <span className="truncate">
            {masked || <span className="opacity-20">{placeholder}</span>}
         </span>
      </div>
   );
}

export function InputGroup({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, type?: string }) {
   return (
      <div className="space-y-2">
         <div className="flex items-center gap-2 px-1 text-slate-500">
            {icon && <div className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</div>}
            <label className="text-sm font-medium leading-none">{label}</label>
         </div>
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="h-12 w-full rounded-2xl border border-[#d9e2ee] bg-white px-4 text-[15px] font-medium tracking-tight text-slate-900 outline-none transition focus:border-slate-900" 
         />
      </div>
   );
}

export function ToggleItem({ label, desc, val, set }: { label: string, desc: string, val: boolean, set: (v: boolean) => void }) {
   return (
      <div className="flex items-center justify-between rounded-[20px] border border-[#e2e9f3] bg-[#f8fbff] p-4 transition-all">
         <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all shadow-sm" style={{ background: val ? "hsl(var(--primary))" : "#e9f0f7", color: val ? "hsl(var(--primary-foreground))" : "#64748b" }}>
               <Bell size={16} strokeWidth={2.1} />
            </div>
            <div>
               <h5 className="text-sm font-semibold leading-none text-slate-900">{label}</h5>
               <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
         </div>
         <button 
            onClick={() => set(!val)} 
            className="relative h-7 w-12 rounded-full transition-all shadow-inner" style={{ background: val ? "hsl(var(--primary))" : "#dbe4ef" }}
         >
            <motion.div 
               animate={{ x: val ? 22 : 3 }}
               className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
            />
         </button>
      </div>
   );
}
