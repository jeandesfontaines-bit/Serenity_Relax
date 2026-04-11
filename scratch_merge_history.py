import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Define the refined Right Area content
new_right_area = """                <div className="flex-1 p-12 lg:p-20 overflow-y-auto">
                   <div className="max-w-5xl mx-auto">
                     <div className="flex items-end justify-between mb-16 pb-10 border-b border-slate-50">
                        <div>
                           <h3 className="text-4xl font-black text-slate-900 uppercase tracking-normal">Parcours Patient</h3>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">Toutes les séances et documents</p>
                        </div>
                     </div>

                     <div className="space-y-12">
                        {selectedFolderAppts.length > 0 && (
                          <div className="mb-6 p-6 bg-slate-900 text-white flex justify-between items-center rounded-3xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
                             <div className="flex items-center gap-6">
                                <span>{selectedFolderAppts.length} séances sélectionnées</span>
                                <div className="h-4 w-px bg-white/20"/>
                                <button className="hover:text-indigo-400 transition-all font-black uppercase">Exporter (.CSV)</button>
                             </div>
                             <button onClick={() => setSelectedFolderAppts([])} className="bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all font-black uppercase">Désélectionner</button>
                          </div>
                        )}

                        <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50/50">
                                 <tr className="border-b border-slate-100 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    <th className="p-8 w-10">
                                       <input 
                                         type="checkbox" 
                                         className="w-4 h-4 rounded border-slate-300"
                                         onChange={(e) => {
                                           const ids = appointments.filter(a => (a.clientId === selectedClient.id || a.title === `${selectedClient.firstName} ${selectedClient.lastName}`)).map(a => a.id);
                                           if (e.target.checked) setSelectedFolderAppts(ids);
                                           else setSelectedFolderAppts([]);
                                         }}
                                         checked={selectedFolderAppts.length > 0 && selectedFolderAppts.length === appointments.filter(a => (a.clientId === selectedClient.id || a.title === `${selectedClient.firstName} ${selectedClient.lastName}`)).length}
                                       />
                                    </th>
                                    <th className="p-8">Séance</th>
                                    <th className="p-8">Description / Soin</th>
                                    <th className="p-8 text-center">Docs</th>
                                    <th className="p-8 text-right">Statut</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {(() => {
                                    const clientAppts = appointments
                                      .filter(a => (a.clientId === selectedClient.id || a.title === `${selectedClient.firstName} ${selectedClient.lastName}`))
                                      .sort((a,b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
                                    
                                    if (clientAppts.length === 0) {
                                       return (<tr><td colSpan={5} className="p-20 text-center font-bold text-slate-200 tracking-widest italic uppercase text-[10px]">Aucun historique pour ce patient</td></tr>);
                                    }

                                    return clientAppts.map(a => {
                                       const hasInv = invoices.find(inv => inv.appointmentId === a.id);
                                       const isSel = selectedFolderAppts.includes(a.id);
                                       const isFuture = new Date(a.date) >= startOfDay(new Date());

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
                                             <td className="p-8">
                                                <p className="font-bold text-slate-900 leading-none">{a.date}</p>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{a.time}</p>
                                             </td>
                                             <td className="p-8">
                                                <p className="font-black text-slate-900 text-sm tracking-tight">{a.serviceName?.split(' - ')[0] || 'Soin Serenity'}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{isFuture ? 'À venir' : 'Passée'}</p>
                                             </td>
                                             <td className="p-8 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                   {hasInv && (
                                                     <button onClick={(e) => { e.stopPropagation(); window.open("/therapist/invoice/" + hasInv.id, "_blank"); }} className="w-8 h-8 rounded-lg bg-white border border-slate-100 inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                        <FileText size={14}/>
                                                     </button>
                                                   )}
                                                   {a.notes && <div title="Notes" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100"><Edit3 size={14}/></div>}
                                                </div>
                                             </td>
                                             <td className="p-8 text-right">
                                                <span className={`px-3 py-1.5 ${isFuture ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'} text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all`}>
                                                   {isFuture ? 'Confirmé' : 'Honoré'}
                                                </span>
                                             </td>
                                          </tr>
                                       );
                                    });
                                 })()}
                              </tbody>
                           </table>
                        </div>
                     </div>
                   </div>
                </div>"""

# Find the start and end of the Right Area in the dashboard
start_marker = '<div className="flex-1 p-12 lg:p-20 overflow-y-auto">'
# Since there are multiple div tags, find specifically the one for selectedClient
search_start = text.find('selectedClient ? (')
region_start = text.find(start_marker, search_start)

# We need to find the matching closing div for the Right Area
# It's inside a flex-1 row that has Profile on the left.
# The structure is:
# <div flex-1 flex flex-col lg:flex-row ...>
#    <div w-96 profile...>
#    <div flex-1 right-area...>  <-- THIS ONE
# </div>

# Let's find the closing tag of region_start
curr = region_start + len(start_marker)
count = 1
while count > 0 and curr < len(text):
    if text[curr:curr+4] == '<div':
        count += 1
    elif text[curr:curr+5] == '</div':
        count -= 1
    curr += 1
region_end = curr

text = text[:region_start] + new_right_area + text[region_end:]

with open(path, 'w') as f:
    f.write(text)

