import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add states to TherapistDashboard
dashboard_line = text.find('const TherapistDashboard = () => {')
insert_pos = text.find('const [clSearch, setClSearch] = useState(\'\');', dashboard_line)
new_states = """  const [clSortConfig, setClSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'lastName', direction: 'asc' });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
"""
text = text[:insert_pos] + new_states + text[insert_pos:]

# 2. Update filtering/sorting logic in PatientsView
old_patients_logic = """    const filtered = clients.filter(c => 
      `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(clSearch.toLowerCase())
    );"""

new_patients_logic = """    const filtered = clients.filter(c => 
      `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(clSearch.toLowerCase())
    ).sort((a, b) => {
      const { key, direction } = clSortConfig;
      let valA = a[key as keyof typeof a] || '';
      let valB = b[key as keyof typeof b] || '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });"""

text = text.replace(old_patients_logic, new_patients_logic)

# 3. Update Table Headers in PatientsView
old_patients_thead = """                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Patient</th>
                    <th className="p-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Coordonnées</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assurance</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">RDV</th>
                    <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>"""

new_patients_thead = """                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="p-8 w-10">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300"
                        onChange={(e) => {
                          if (e.target.checked) setSelectedClients(filtered.map(c => c.id));
                          else setSelectedClients([]);
                        }}
                        checked={selectedClients.length === filtered.length && filtered.length > 0}
                      />
                    </th>
                    <th onClick={() => setClSortConfig({ key: 'lastName', direction: clSortConfig.key === 'lastName' && clSortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 cursor-pointer hover:text-slate-900 transition-all">Patient {clSortConfig.key === 'lastName' ? (clSortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="p-8">Coordonnées</th>
                    <th onClick={() => setClSortConfig({ key: 'insurance', direction: clSortConfig.key === 'insurance' && clSortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="p-8 cursor-pointer hover:text-slate-900 transition-all">Assurance {clSortConfig.key === 'insurance' ? (clSortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                    <th className="p-8 text-center">RDV</th>
                    <th className="p-8 text-right">Action</th>
                  </tr>
                </thead>"""

text = text.replace(old_patients_thead, new_patients_thead)

# 4. Update Row Checkbox in PatientsView
old_patients_tr = """                <tbody className="divide-y divide-slate-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => setSelectedClient(c)}>
                      <td className="p-8">"""

new_patients_tr = """                <tbody className="divide-y divide-slate-50">
                  {filtered.map(c => {
                    const isSel = selectedClients.includes(c.id);
                    return (
                    <tr key={c.id} className={`group hover:bg-slate-50 transition-all cursor-pointer ${isSel ? 'bg-blue-50/50' : ''}`} onClick={() => setSelectedClient(c)}>
                      <td className="p-8 w-10" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300"
                          checked={isSel}
                          onChange={() => {
                            if (isSel) setSelectedClients(prev => prev.filter(id => id !== c.id));
                            else setSelectedClients(prev => [...prev, c.id]);
                          }}
                        />
                      </td>
                      <td className="p-8">"""

# Close the row correctly by adding a `); }` replacement or similar
# Wait, let's find the closing of the map.
# The original code has `))}</tbody>`.
text = text.replace(old_patients_tr, new_patients_tr)
text = text.replace('))}</tbody>', ')})}</tbody>')

# 5. Add Export Selection Badge for Patients view
patients_badge = """
        {selectedClients.length > 0 && (
          <div className="px-12 py-3 bg-blue-600 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
            <span>{selectedClients.length} dossiers patients sélectionnés</span>
            <button onClick={() => setSelectedClients([])} className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/40 transition-all">Tout désélectionner</button>
          </div>
        )}
"""
insert_p_badge_pos = text.find('<div className="flex-1 overflow-y-auto px-12 py-10">', text.find('const PatientsView = () => {'))
text = text[:insert_p_badge_pos] + patients_badge + text[insert_p_badge_pos:]

with open(path, 'w') as f:
    f.write(text)

