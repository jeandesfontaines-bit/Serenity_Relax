import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add Selection and Sorting states to AccountingView
accounting_start = text.find('const AccountingView = () => {')
insert_state = text.find('const [searchTerm, setSearchTerm] = useState(\'\');', accounting_start)
states = """    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
"""
text = text[:insert_state] + states + text[insert_state:]

# 2. Update filteredAppts to handle sorting
old_filter_start = text.find('const filteredAppts = appointments.filter', accounting_start)
old_filter_end = text.find('.sort((a,b) =>', old_filter_start)
old_filter_end = text.find('));', old_filter_end) + 3

new_filtered_logic = """    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'paid' ? a.paid : filterStatus === 'pending' ? !a.paid : true;
      let matchMonth = true;
      if (filterStatus === 'month') {
        try {
          const d = parse(a.date, 'yyyy-MM-dd', new Date());
          matchMonth = isSameMonth(d, cur) && isSameYear(d, cur);
        } catch(e) { matchMonth = false; }
      }
      return matchSearch && matchStatus && matchMonth;
    }).sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];
      if (key === 'client') { valA = a.title; valB = b.title; }
      if (key === 'price') { valA = a.price || 150; valB = b.price || 150; }
      if (!valA) valA = '';
      if (!valB) valB = '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });\n"""

text = text[:old_filter_start] + new_filtered_logic + text[old_filter_end:]

# 3. Update exportToCSV to use selected invoices
old_export = """    const exportToCSV = () => {
      const headers = ['Client', 'Date', 'Heure', 'Service', 'Montant', 'Statut'];
      const rows = filteredAppts.map(a => ["""

new_export = """    const exportToCSV = () => {
      const toExport = selectedInvoices.length > 0 
        ? filteredAppts.filter(a => selectedInvoices.includes(a.id))
        : filteredAppts;

      const headers = ['Client', 'Date', 'Heure', 'Service', 'Montant', 'Statut'];
      const rows = toExport.map(a => ["""

text = text.replace(old_export, new_export)

# 4. Update the Table UI: Headers (Checkboxes + Sortable)
old_thead = """                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-8 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Client</th>
                    <th className="p-8 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Date & Heure</th>
                    <th className="p-8 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Soin</th>
                    <th className="p-8 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Montant</th>
                    <th className="p-8 text-center text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Statut</th>
                    <th className="p-8 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>"""

# Helper for sort indicator
# Use a simple lambda or similar if possible. But I'll just hardcode the headers.
# I'll add a checkbox for Select All.

new_thead = """                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-8 w-10">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 transition-all checked:bg-slate-900"
                        onChange={(e) => {
                          if (e.target.checked) setSelectedInvoices(filteredAppts.map(a => a.id));
                          else setSelectedInvoices([]);
                        }}
                        checked={selectedInvoices.length === filteredAppts.length && filteredAppts.length > 0}
                      />
                    </th>
                    <th onClick={() => setSortConfig({ key: 'title', direction: sortConfig.key === 'title' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-900 transition-all">Client {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th onClick={() => setSortConfig({ key: 'date', direction: sortConfig.key === 'date' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-900 transition-all">Date & Heure {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="p-8 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Soin</th>
                    <th onClick={() => setSortConfig({ key: 'price', direction: sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] cursor-pointer hover:text-slate-900 transition-all">Montant {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="p-8 text-center text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Statut</th>
                    <th className="p-8 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>"""

text = text.replace(old_thead, new_thead)

# 5. Update Table Rows (Checkboxes)
old_tr = """                    <tr 
                      key={a.id} 
                      onClick={() => setSelectedClient(patients.find(p => p.id === a.clientId) || null)}
                      className="group border-b border-slate-50 hover:bg-neutral-50/50 transition-all cursor-pointer"
                    >
                      <td className="p-8">"""

new_tr = """                    <tr 
                      key={a.id} 
                      onClick={() => setSelectedClient(patients.find(p => p.id === a.clientId) || null)}
                      className={`group border-b border-slate-50 hover:bg-neutral-50/50 transition-all cursor-pointer ${selectedInvoices.includes(a.id) ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="p-8" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 transition-all checked:bg-slate-900"
                          checked={selectedInvoices.includes(a.id)}
                          onChange={() => {
                            if (selectedInvoices.includes(a.id)) setSelectedInvoices(prev => prev.filter(id => id !== a.id));
                            else setSelectedInvoices(prev => [...prev, a.id]);
                          }}
                        />
                      </td>
                      <td className="p-8">"""

text = text.replace(old_tr, new_tr)

# 6. Add a "Rows Selected" indicator to the Export button or near it
# Since the Export button is in the Nav, I'll update window.exportAccountsToCSV to show count
# wait, the button text itself can change if possible.
# But it's in the common nav.
# I'll just add a small badge in the Accounting View when selection is active.

selection_badge = """
        {selectedInvoices.length > 0 && (
          <div className="px-8 py-2 bg-indigo-600 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
            <span>{selectedInvoices.length} factures sélectionnées pour l'exportation</span>
            <button onClick={() => setSelectedInvoices([])} className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/40 transition-all">Tout désélectionner</button>
          </div>
        )}
"""

# Insert before the search bar
insert_badge_pos = text.find('<div className="px-8 py-4 flex flex-col md:flex-row gap-4 shrink-0">', accounting_start)
text = text[:insert_badge_pos] + selection_badge + text[insert_badge_pos:]

with open(path, 'w') as f:
    f.write(text)

