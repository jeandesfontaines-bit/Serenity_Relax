import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Fix Table Headers with correct Sort keys and Checkbox
old_thead_tr = """                <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  <th className="p-8">Patient</th>
                  <th className="p-8">Date & Heure</th>
                  <th className="p-8">Soin effecteur</th>
                  <th className="p-8 text-right">Montant</th>
                  <th className="p-8 text-center">Statut</th>
                  <th className="p-8 text-right">Action</th>
                </tr>"""

new_thead_tr = """                <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  <th className="p-8 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300"
                      onChange={(e) => {
                        if (e.target.checked) setSelectedInvoices(filteredAppts.map(a => a.id));
                        else setSelectedInvoices([]);
                      }}
                      checked={selectedInvoices.length === filteredAppts.length && filteredAppts.length > 0}
                    />
                  </th>
                  <th onClick={() => setSortConfig({ key: 'title', direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 cursor-pointer hover:text-slate-900 transition-all select-none">Patient {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => setSortConfig({ key: 'date', direction: sortConfig.key === 'date' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 cursor-pointer hover:text-slate-900 transition-all select-none">Date & Heure {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="p-8">Soin effecteur</th>
                  <th onClick={() => setSortConfig({ key: 'price', direction: sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 text-right cursor-pointer hover:text-slate-900 transition-all select-none">Montant {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="p-8 text-center">Statut</th>
                  <th className="p-8 text-right">Action</th>
                </tr>"""

text = text.replace(old_thead_tr, new_thead_tr)

# 2. Fix Row Checkbox (Add the <td>)
old_row_start = """                {filteredAppts.slice(0, visibleCount).map(a => {
                  const inv = invoices.find(inv => inv.appointmentId === a.id);
                  return (
                    <tr key={a.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors cursor-pointer" onClick={() => { if(inv) window.open("/therapist/invoice/" + inv.id, "_blank"); }}>
                      <td className="p-8">"""

new_row_start = """                {filteredAppts.slice(0, visibleCount).map(a => {
                  const inv = invoices.find(inv => inv.appointmentId === a.id);
                  const isSel = selectedInvoices.includes(a.id);
                  return (
                    <tr key={a.id} className={`group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors cursor-pointer ${isSel ? 'bg-blue-50/50' : ''}`} onClick={() => { if(inv) window.open("/therapist/invoice/" + inv.id, "_blank"); }}>
                      <td className="p-8 w-10" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300"
                          checked={isSel}
                          onChange={() => {
                            if (isSel) setSelectedInvoices(prev => prev.filter(id => id !== a.id));
                            else setSelectedInvoices(prev => [...prev, a.id]);
                          }}
                        />
                      </td>
                      <td className="p-8">"""

text = text.replace(old_row_start, new_row_start)

with open(path, 'w') as f:
    f.write(text)

