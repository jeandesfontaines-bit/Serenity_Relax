import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update Table Header
old_header = """                  <th onClick={() => setSortConfig({ key: 'title', direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 cursor-pointer hover:text-slate-900 transition-all select-none">Patient {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>"""

new_header = """                  <th onClick={() => setSortConfig({ key: 'title', direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 cursor-pointer hover:text-slate-900 transition-all select-none">Patient {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                  <th className="p-8 text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em]">N° Facture</th>"""

text = text.replace(old_header, new_header)

# 2. Update Table Row
# Remove from Name column and add its own column
old_name_cell = """                      <td className="p-8">
                        <div className="font-extrabold text-sm text-neutral-900 tracking-tight">{a.title}</div>
                        {inv ? <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">#{inv.invoiceNumber}</div> : <div className="text-[9px] font-black text-neutral-300 uppercase tracking-widest mt-1">Sans Facture</div>}
                      </td>"""

new_name_cell = """                      <td className="p-8">
                        <div className="font-extrabold text-sm text-neutral-900 tracking-tight">{a.title}</div>
                      </td>
                      <td className="p-8">
                        {inv ? (
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-500 text-[10px] font-black border border-indigo-100 rounded-xl">#{inv.invoiceNumber}</span>
                        ) : (
                          <span className="text-[9px] font-black text-neutral-200 uppercase tracking-widest italic">N/A</span>
                        )}
                      </td>"""

text = text.replace(old_name_cell, new_name_cell)

with open(path, 'w') as f:
    f.write(text)

