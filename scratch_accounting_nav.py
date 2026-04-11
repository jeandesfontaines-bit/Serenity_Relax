import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Lift necessary logic to TherapistDashboard level (if needed) or handle it simply.
# Actually, I can just define exportToCSV in the head of TherapistDashboard using a memoized or filtered list.
# For now, I'll just use a simple approach: only show the button in the nav and have it call a function.

# 2. Find the Nav logic again
old_nav_piece = """                    {tab === 'clients' && <span className="text-sm font-black text-slate-300 uppercase tracking-widest border-l border-slate-100 pl-4">Patients</span>}
                  </div>"""

new_nav_piece = """                    {(tab === 'clients' || tab === 'accounting') && (
                      <div className="flex flex-col border-l border-slate-100 pl-4">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{tab === 'clients' ? 'Patients' : 'Comptabilité'}</span>
                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">{tab === 'clients' ? 'Liste complète et fiches' : 'Gestion des factures et paiements'}</span>
                      </div>
                    )}
                  </div>"""

text = text.replace(old_nav_piece, new_nav_piece)

# 3. Add the Export Button in the right side of Nav
old_right_side = """                  {tab === 'clients' && (
                    <button onClick={() => setIsAddingClient(!isAddingClient)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isAddingClient ? 'bg-slate-50 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200'}`}>
                       {isAddingClient ? 'Annuler' : 'Nouveau Patient'}
                    </button>
                  )}"""

# Note: exportToCSV will be defined at parent level
new_right_side = """                  {tab === 'accounting' && (
                    <button onClick={() => (window as any).exportAccountsToCSV?.()} className="text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition active:scale-95" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>
                      <Download size={14}/> Exporter CSV
                    </button>
                  )}
                  {tab === 'clients' && (
                    <button onClick={() => setIsAddingClient(!isAddingClient)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isAddingClient ? 'bg-slate-50 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200'}`}>
                       {isAddingClient ? 'Annuler' : 'Nouveau Patient'}
                    </button>
                  )}"""

text = text.replace(old_right_side, new_right_side)

# 4. Remove the redundant header in AccountingView
old_accounting_header = """        <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end bg-white border-b border-slate-200 gap-4">
          <div>
            <h3 className="text-2xl font-medium text-neutral-900 tracking-tighter">Comptabilité</h3>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1">Gestion des factures et paiements</p>
          </div>
          <button onClick={exportToCSV} className="text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 transition active:scale-95" style={{ background: 'linear-gradient(135deg, #54A0FF, #5F27CD)' }}>
            <Download size={16}/> Exporter CSV
          </button>
        </div>"""

text = text.replace(old_accounting_header, '')

# 5. Define exportAccountsToCSV at parent level to satisfy the button click
# I will find a place in TherapistDashboard to put it.
# I'll search for where `const TherapistDashboard = () => {` starts and add it there.

with open(path, 'w') as f:
    f.write(text)

