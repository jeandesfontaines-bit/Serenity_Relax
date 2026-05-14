import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

export function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
   return (
      <div className="border-l-[2px] pl-2.5 py-0.5 mb-4" style={{ borderColor: 'hsl(var(--primary))' }}>
         <h4 className="text-[10px] font-black tracking-tight leading-none uppercase" style={{ color: 'hsl(var(--foreground))' }}>{title}</h4>
         <p className="text-[7.5px] font-bold uppercase tracking-[0.15em] mt-1 leading-none" style={{ color: 'hsl(var(--muted-foreground))' }}>{subtitle}</p>
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
         className={`w-full h-8 px-3 rounded-full text-[9px] font-bold tracking-tight outline-none shadow-sm ${align === 'center' ? 'text-center' : ''} ${editingClassName}`}
         style={{ background: 'hsl(var(--secondary))', borderWidth: '1px', borderStyle: 'solid', borderColor: 'hsl(var(--primary))', color: 'hsl(var(--foreground))' }}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`flex h-8 cursor-text items-center rounded-full px-3 text-[9px] font-bold tracking-tight transition-all ${align === 'center' ? 'justify-center text-center' : ''} ${className}`}
         style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
      >
         <span className="truncate">
            {value || <span style={{ color: 'hsl(var(--border))' }}>{placeholder}</span>}
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
      ? 'shadow-inner'
      : 'border shadow-sm';
   const baseEdit = variant === 'soft'
      ? 'ring-4 shadow-inner'
      : 'border shadow-sm';

   return editing ? (
      <textarea
         autoFocus
         value={draft}
         onChange={(e) => setDraft(e.target.value)}
         onBlur={commit}
         rows={rows}
         placeholder={placeholder}
         className={`w-full rounded-xl p-3 text-[10px] font-medium outline-none resize-none leading-relaxed ${baseEdit}`}
         style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
      />
   ) : (
      <div
         onDoubleClick={() => setEditing(true)}
         className={`min-h-[88px] w-full cursor-text rounded-xl p-3 text-[10px] font-medium transition-all hover:-translate-y-0.5 ${baseView}`}
         style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
      >
         <p className="whitespace-pre-wrap leading-relaxed">
            {value || <span style={{ color: 'hsl(var(--border))' }}>{placeholder}</span>}
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
          className="w-full h-8 px-3 rounded-full border text-[9px] font-bold tracking-tight outline-none shadow-inner"
          style={{ background: 'hsla(var(--primary-foreground) / 0.1)', borderColor: 'hsl(var(--primary-foreground))', color: 'hsl(var(--primary-foreground))' }}
       />
   ) : (
      <div
          onDoubleClick={() => setEditing(true)}
          className="flex h-8 cursor-text items-center rounded-full px-3 text-[9px] font-bold tracking-tight transition-all"
          style={{ background: 'hsla(var(--primary-foreground) / 0.05)', color: 'hsl(var(--primary-foreground))' }}
       >
         <span className="truncate">
            {masked || <span className="opacity-20">{placeholder}</span>}
         </span>
      </div>
   );
}

export function InputGroup({ label, value, onChange, icon, type = 'text' }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, type?: string }) {
   return (
      <div className="space-y-1.5 group">
         <div className="flex items-center gap-2 transition-colors px-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {icon && <div className="shrink-0 scale-[0.6] w-4 h-4 flex items-center justify-center">{icon}</div>}
            <label className="text-[7.5px] font-bold uppercase tracking-[0.2em] leading-none">{label}</label>
         </div>
         <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full h-8 px-3 rounded-full text-[9px] font-bold tracking-tight transition-all outline-none shadow-sm border focus:ring-4" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }} 
         />
      </div>
   );
}

export function ToggleItem({ label, desc, val, set }: { label: string, desc: string, val: boolean, set: (v: boolean) => void }) {
   return (
      <div className="flex items-center justify-between p-2 rounded-xl shadow-sm group transition-all border" style={{ background: "hsl(var(--background))", borderColor: "hsl(var(--border))" }}>
         <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-md" style={{ background: val ? "hsl(var(--primary))" : "hsl(var(--secondary))", color: val ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))" }}>
               <Bell size={9} strokeWidth={2.5} />
            </div>
            <div>
               <h5 className="text-[8px] font-bold tracking-tight leading-none uppercase" style={{ color: "hsl(var(--foreground))" }}>{label}</h5>
               <p className="text-[6.5px] font-bold uppercase tracking-[0.1em] mt-1 leading-none" style={{ color: "hsl(var(--muted-foreground))" }}>{desc}</p>
            </div>
         </div>
         <button 
            onClick={() => set(!val)} 
            className="w-7 h-4 rounded-full relative transition-all shadow-inner" style={{ background: val ? "hsl(var(--primary))" : "hsl(var(--secondary))" }}
         >
            <motion.div 
               animate={{ x: val ? 14 : 2 }}
               className="w-2.5 h-2.5 rounded-full absolute top-1 shadow-md" style={{ background: "hsl(var(--background))" }}
            />
         </button>
      </div>
   );
}
