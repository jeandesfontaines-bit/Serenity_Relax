import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update AccountingView Rows
# Original: onClick opens invoice. New: onClick toggles selection if clicking the background.
# We'll put the selection toggle on the row, and keep the invoice button as is.

old_acc_tr = """                    <tr key={a.id} className={`group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors cursor-pointer ${isSel ? 'bg-blue-50/50' : ''}`} onClick={() => { if(inv) window.open("/therapist/invoice/" + inv.id, "_blank"); }}>"""

new_acc_tr = """                    <tr 
                      key={a.id} 
                      className={`group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors cursor-pointer ${isSel ? 'bg-blue-50/20' : ''}`} 
                      onClick={() => {
                        if (isSel) setSelectedInvoices(prev => prev.filter(id => id !== a.id));
                        else setSelectedInvoices(prev => [...prev, a.id]);
                      }}
                    >"""

text = text.replace(old_acc_tr, new_acc_tr)

# 2. Update PatientsView Rows (and restore missing checkboxes)
patients_tr_start = text.find('const clientAppts = appointments.filter', text.find('const PatientsView = () => {'))
tr_line_pos = text.find('<tr key={c.id}', patients_tr_start)
tr_end_pos = text.find('</tr>', tr_line_pos) + 5

new_patient_row_content = """<tr 
                         key={c.id} 
                         className={`group hover:bg-slate-50 transition-colors cursor-pointer ${selectedClients.includes(c.id) ? 'bg-blue-50/20' : ''}`} 
                         onClick={() => {
                           if (selectedClients.includes(c.id)) setSelectedClients(prev => prev.filter(id => id !== c.id));
                           else setSelectedClients(prev => [...prev, c.id]);
                         }}
                       >
                         <td className="p-8 w-10" onClick={(e) => e.stopPropagation()}>
                           <input 
                             type="checkbox" 
                             className="w-4 h-4 rounded border-slate-300 pointer-events-none"
                             checked={selectedClients.includes(c.id)}
                             readOnly
                           />
                         </td>
                         <td className="p-8">
                               <p className="font-extrabold text-lg text-slate-900 tracking-normal leading-none">{c.firstName} {c.lastName}</p>
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 italic">Dossier ACTIF</p>
                         </td>
                         <td className="p-8">
                           <p className="text-sm font-bold text-slate-600 leading-none">{c.email || '—'}</p>
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{c.phone || '—'}</p>
                         </td>
                         <td className="p-8">
                           <span className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 rounded-xl">
                             {c.insurance || 'SANS ASSURANCE'}
                           </span>
                         </td>
                         <td className="p-8 text-center">
                           <span className="text-xl font-black text-slate-900">{clientAppts.length}</span>
                         </td>
                         <td className="p-8 text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openClientFolder(c); }}
                              className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 transition-all flex items-center justify-center ml-auto"
                            >
                               <ChevronRight size={18}/>
                            </button>
                         </td>
                       </tr>"""

text = text[:tr_line_pos] + new_patient_row_content + text[tr_end_pos:]

with open(path, 'w') as f:
    f.write(text)

