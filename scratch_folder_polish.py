import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add state to TherapistDashboard
insert_pos = text.find('const [selectedClients, setSelectedClients] = useState<string[]>([]);')
text = text[:insert_pos] + "  const [selectedFolderAppts, setSelectedFolderAppts] = useState<string[]>([]);\n" + text[insert_pos:]

# 2. Update the "Archive des séances" table (Sequence 02)
seq02_start = text.find('SÉQUENCE 02')
thead_start = text.find('<thead>', seq02_start)
thead_end = text.find('</thead>', thead_start) + 8

# a. New Table Header (Add Checkbox)
new_folder_thead = """<thead className="bg-slate-50/50">
                                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                       <th className="p-8 w-10">
                                          <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-slate-300"
                                            onChange={(e) => {
                                              const ids = appointments.filter(a => (a.clientId === selectedClient.id || a.title === `${selectedClient.firstName} ${selectedClient.lastName}`) && new Date(a.date) < startOfDay(new Date())).map(a => a.id);
                                              if (e.target.checked) setSelectedFolderAppts(ids);
                                              else setSelectedFolderAppts([]);
                                            }}
                                            checked={selectedFolderAppts.length > 0}
                                          />
                                       </th>
                                       <th className="p-8">Date</th>
                                       <th className="p-8">Soin</th>
                                       <th className="p-8 text-center">Notes / Docs</th>
                                       <th className="p-8 text-right">Statut</th>
                                    </tr>
                                 </thead>"""

text = text[:thead_start] + new_folder_thead + text[thead_end:]

# b. New Table Row (Add Checkbox + Conditional Click)
old_folder_tr_start = text.find('<tr key={a.id}', seq02_start)
# We'll replace the whole map return block to be safe
map_block_start = text.find('.map(a => {', seq02_start)
map_block_end = text.find('})', map_block_start) + 2

new_folder_row_block = """.map(a => {
                                          const hasInv = invoices.find(inv => inv.appointmentId === a.id);
                                          const isSel = selectedFolderAppts.includes(a.id);
                                          return (
                                             <tr 
                                               key={a.id} 
                                               className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer group ${isSel ? 'bg-blue-50/20' : ''}`} 
                                               onClick={() => {
                                                 if (selectedFolderAppts.length > 0) {
                                                   if (isSel) setSelectedFolderAppts(prev => prev.filter(id => id !== a.id));
                                                   else setSelectedFolderAppts(prev => [...prev, a.id]);
                                                 } else {
                                                   setSelectedAppt(a);
                                                 }
                                               }}
                                             >
                                                <td className="p-8 w-10" onClick={(e) => e.stopPropagation()}>
                                                   <input 
                                                     type="checkbox" 
                                                     className="w-4 h-4 rounded border-slate-300 pointer-events-auto"
                                                     checked={isSel}
                                                     readOnly
                                                   />
                                                </td>
                                                <td className="p-8 text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{a.date}</td>
                                                <td className="p-8 font-black text-slate-900 text-sm tracking-tight">{a.serviceName?.split(' - ')[0]}</td>
                                                <td className="p-8 text-center">
                                                   <div className="flex items-center justify-center gap-2">
                                                      {a.notes && <div title="Notes de séance" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm"><Edit3 size={14}/></div>}
                                                      {hasInv ? (
                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(hasInv); }} className="w-8 h-8 rounded-lg bg-white border border-slate-100 inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><FileText size={14}/></button>
                                                      ) : <span className="text-[9px] font-black text-slate-100 uppercase italic opacity-40">Archive</span>}
                                                   </div>
                                                </td>
                                                <td className="p-8 text-right">
                                                   <span className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-all">Honoré</span>
                                                </td>
                                             </tr>
                                          )
                                       })"""

text = text[:map_block_start] + new_folder_row_block + text[map_block_end:]

# 3. Add Selection Badge for Folder Invoices
folder_badge = """
                        {selectedFolderAppts.length > 0 && (
                          <div className="mb-6 p-6 bg-slate-900 text-white flex justify-between items-center rounded-3xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
                             <div className="flex items-center gap-6">
                                <span>{selectedFolderAppts.length} séances sélectionnées</span>
                                <div className="h-4 w-px bg-white/20"/>
                                <button className="hover:text-indigo-400 transition-all">Exporter Documents</button>
                             </div>
                             <button onClick={() => setSelectedFolderAppts([])} className="bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all">Tout désélectionner</button>
                          </div>
                        )}
"""
insert_badge_pos = text.find('<div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">', seq02_start)
text = text[:insert_badge_pos] + folder_badge + text[insert_badge_pos:]

with open(path, 'w') as f:
    f.write(text)

