import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
   return (
      <div className="mb-5 space-y-1">
         <h4 className="dashboard-title">{title}</h4>
         <p className="dashboard-muted-text">{subtitle}</p>
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
         className={`dashboard-field dashboard-body-strong w-full rounded-2xl px-4 ${align === 'center' ? 'text-center' : ''} ${editingClassName || 'h-12'}`}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`dashboard-body-strong flex min-h-[3rem] cursor-text items-center rounded-2xl border border-border bg-background px-4 transition ${align === 'center' ? 'justify-center text-center' : ''} ${className}`}
      >
         <span className="truncate">
            {value || <span className="text-muted-foreground/60">{placeholder}</span>}
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
      ? 'border border-border bg-secondary/20'
      : 'border border-border bg-background shadow-sm';
   const baseEdit = variant === 'soft'
      ? 'border border-primary bg-background'
      : 'border border-border bg-background shadow-sm';

   return editing ? (
         <textarea
         autoFocus
         value={draft}
         onChange={(e) => setDraft(e.target.value)}
         onBlur={commit}
         rows={rows}
         placeholder={placeholder}
         className={`dashboard-body-strong w-full resize-none rounded-xl p-4 leading-7 outline-none ${baseEdit}`}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`dashboard-body-strong min-h-[120px] w-full cursor-text rounded-xl p-4 leading-7 transition ${baseView}`}
      >
         <p className="whitespace-pre-wrap leading-relaxed">
            {value || <span className="text-muted-foreground/60">{placeholder}</span>}
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
          className="dashboard-body-strong h-12 w-full rounded-2xl border border-white/25 bg-white/10 px-4 text-white outline-none placeholder:text-white/35"
       />
   ) : (
      <div
          onDoubleClick={() => setEditing(true)}
          className="dashboard-body-strong flex h-12 cursor-text items-center rounded-2xl border border-white/10 bg-white/8 px-4 text-white transition-all"
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
         <div className="flex items-center gap-2 px-1 text-muted-foreground">
            {icon && <div className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</div>}
            <label className="dashboard-body leading-none">{label}</label>
         </div>
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="dashboard-field dashboard-body-strong h-12 rounded-2xl px-4" 
         />
      </div>
   );
}

export function ToggleItem({ label, desc, val, set }: { label: string, desc: string, val: boolean, set: (v: boolean) => void }) {
   return (
      <div className="dashboard-surface-soft flex items-center justify-between rounded-[20px] p-4 transition-all">
         <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all shadow-sm ${val ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
               <Bell size={16} strokeWidth={2.1} />
            </div>
            <div>
               <h5 className="dashboard-body-strong leading-none">{label}</h5>
               <p className="dashboard-body mt-1">{desc}</p>
            </div>
         </div>
         <button 
            onClick={() => set(!val)} 
            className={`relative h-7 w-12 rounded-full transition-all shadow-inner ${val ? 'bg-primary' : 'bg-border'}`}
         >
            <motion.div 
               animate={{ x: val ? 22 : 3 }}
               className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
            />
         </button>
      </div>
   );
}
