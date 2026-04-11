import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Align InlineConfigView headers
old_header = """        <div className="grid grid-cols-7 border-b border-slate-200 shrink-0 bg-white">
          {DAYS_S.map((d, i) => (
            <div key={i} className="py-6 text-center border-r border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{d}</p>
            </div>
          ))}
        </div>"""

new_header = """        <div className="grid grid-cols-7 border-b border-slate-200 shrink-0 bg-white">
          {DAYS_S.map((d, i) => (
            <div key={i} className="py-6 text-center border-r border-slate-200 relative group transition-all">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{d}</p>
              <div className="flex flex-col items-center mt-2">
                 <p className="text-2xl leading-none text-slate-900 opacity-80">—</p>
              </div>
            </div>
          ))}
        </div>"""
text = text.replace(old_header, new_header)

# 2. Align InlineConfigView slots
old_slot = """                  <div key={t} className="relative p-5 text-[11px] font-black border-l-4 border-slate-200 bg-white shadow-sm flex justify-between items-center group rounded-r-xl">
                    <span className="text-slate-600 truncate">{t}</span>
                    <button onClick={async () => { const nS = slots.filter(x => x !== t); const nSlots = {...configSlots, [i]: nS}; setConfigSlots(nSlots); if(firestore) await setDoc(doc(firestore, "config", "slots"), nSlots); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X size={14}/></button>
                  </div>"""

new_slot = """                  <div key={t} className="relative p-5 text-[11px] font-black border-l-4 transition-all bg-white group hover:bg-slate-50 border-slate-100 hover:border-blue-400 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <span className="tracking-tight text-slate-400">{t}</span>
                      <button onClick={async () => { const nS = slots.filter(x => x !== t); const nSlots = {...configSlots, [i]: nS}; setConfigSlots(nSlots); if(firestore) await setDoc(doc(firestore, "config", "slots"), nSlots); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X size={14}/></button>
                    </div>
                  </div>"""
text = text.replace(old_slot, new_slot)

# 3. Align background of slots container for InlineConfigView (remove bg-white if it's there)
# In InlineConfigView, the days are rendered as <div key={i} className="border-r border-slate-200 p-4 flex flex-col gap-3 min-h-[600px] transition-all bg-white">
# Let's fix that.
old_container = """              <div key={i} className="border-r border-slate-200 p-4 flex flex-col gap-3 min-h-[600px] transition-all">
                {slots.map(t => ("""
new_container = """              <div key={i} className="border-r border-slate-200 p-4 flex flex-col gap-3 min-h-[600px] transition-all bg-white">
                {slots.map(t => ("""
text = text.replace(old_container, new_container)


with open(path, 'w') as f:
    f.write(text)

