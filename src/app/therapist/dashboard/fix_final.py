import sys
file_path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

# 1. Update main layout margin
for i, line in enumerate(lines):
    if 'selectedAppt || selectedClient' in line:
        lines[i] = line.replace('selectedAppt || selectedClient', 'selectedAppt')

# 2. Template for fixed slide-over section
# This includes the closing for 1192 content wrapper
appt_drawer = """        <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-40 transform transition-transform duration-500 ease-in-out border-l border-slate-100 flex flex-col ${selectedAppt ? 'translate-x-0' : 'translate-x-full'}`}>
            {selectedAppt && (
              <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
                 <div className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-[#5F27CD] uppercase tracking-[0.3em]">Détail Réservation</p>
                    <button onClick={() => setSelectedAppt(null)} className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition text-slate-300"><X size={20}/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-10 space-y-10">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-[#5F27CD]/5 flex items-center justify-center text-[#5F27CD] text-2xl font-black">
                          {selectedAppt.time?.split(':')[0]}
                       </div>
                       <div>
                          <h2 className="text-2xl font-medium tracking-tighter text-slate-900">{selectedAppt.clientNameSnapshot || selectedAppt.title}</h2>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{fmtFR(new Date(selectedAppt.date))}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Soin', val: selectedAppt.serviceName || 'Soin Signature', icon: <Leaf size={14}/> },
                         { label: 'Prix', val: `${selectedAppt.price || 150} CHF`, icon: <CreditCard size={14}/> },
                         { label: 'Contact', val: selectedAppt.phone || 'Non renseigné', icon: <Activity size={14}/> },
                         { label: 'Statut', val: selectedAppt.paid ? 'Réglé' : 'À régler', icon: <CheckCircle2 size={14}/>, color: selectedAppt.paid ? 'text-emerald-500' : 'text-orange-500' }
                       ].map((it, i) => (
                         <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{it.icon} {it.label}</div>
                            <p className={`text-xs font-bold ${it.color || 'text-slate-900'}`}>{it.val}</p>
                         </div>
                       ))}
                    </div>

                    <div className="pt-10 border-t border-slate-100 space-y-4">
                       <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all">Modifier le Contact</button>
                       <button onClick={deleteEvent} className="w-full py-4 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 rounded-2xl transition">Annuler le Rendez-vous</button>
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>
"""

# Find tags
idx_slide = -1
for i, line in enumerate(lines):
    if 'SLIDE-OVER DETAIL PANEL' in line:
        idx_slide = i
        break
idx_event = -1
for i, line in enumerate(lines):
    if 'EVENT MODAL' in line:
        idx_event = i
        break

if idx_slide != -1 and idx_event != -1:
    del lines[idx_slide + 1 : idx_event]
    lines.insert(idx_slide + 1, appt_drawer)

# 3. Final structural fix
# We need to ensure that the Fragment </> is at the end, and preceded by a div closing for 1104.
# And ensure no garbage after the Dashboard function.

# Remove anything after the Dashboard closing brace
end_of_func = -1
for i in range(len(lines)-1, 0, -1):
    if '}' in lines[i] and not lines[i].strip().startswith(')') and not lines[i].strip().startswith(']'):
         # Check if it's the last } in the file
         if i == len(lines)-1 or all(not l.strip() for l in lines[i+1:]):
              end_of_func = i
              break

if end_of_func != -1:
    # Rewrite the end from line 1600 approx to end
    # Find clModal closing
    idx_clmodal_end = -1
    for i in range(idx_event, len(lines)):
        if ')}' in lines[i] and 'clModal' in "".join(lines[i-100:i]):
            idx_clmodal_end = i
            break
    
    if idx_clmodal_end != -1:
         new_end = [
             lines[idx_clmodal_end],
             "    </div>\n",
             "    </>\n",
             "  );\n",
             "}\n"
         ]
         del lines[idx_clmodal_end : len(lines)]
         lines.extend(new_end)

with open(file_path, 'w') as f:
    f.writelines(lines)
