import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update the KPI boxes to be interactive and change the first label
old_kpi_block = """        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 pb-4 shrink-0">
          <div className="bg-neutral-50 p-6 rounded-[2rem] border border-slate-200">
            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">Total Sélection</p>
            <div className="text-2xl font-black text-neutral-900">{totalRevenue} CHF</div>
            <p className="text-[10px] font-bold text-neutral-400 mt-1">{filteredAppts.length} Transactions</p>
          </div>
          <div className="bg-neutral-50 p-6 rounded-[2rem] border border-slate-200">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">Réglé</p>
            <div className="text-2xl font-black text-neutral-900">{paidRevenue} CHF</div>
            <p className="text-[10px] font-bold text-neutral-400 mt-1">{filteredAppts.filter(a => a.paid).length} Paiements</p>
          </div>
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
            <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-1">En attente</p>
            <div className="text-2xl font-black text-red-700">{pendingRevenue} CHF</div>
            <p className="text-[10px] font-bold text-red-500 mt-1">{filteredAppts.filter(a => !a.paid).length} Impayés</p>
          </div>
        </div>"""

new_kpi_block = """        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 pb-4 shrink-0">
          <div 
            onClick={() => setFilterStatus('all')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'all' ? 'bg-slate-900 border-slate-900 text-white scale-[1.02] shadow-2xl' : 'bg-neutral-50 border-slate-200 hover:border-slate-400'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'all' ? 'text-slate-400' : 'text-neutral-400'}`}>Mois en cours</p>
            <div className="text-2xl font-black">{totalRevenue} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'all' ? 'text-slate-500' : 'text-neutral-400'}`}>{filteredAppts.length} Transactions</p>
          </div>

          <div 
            onClick={() => setFilterStatus('paid')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'paid' ? 'bg-emerald-600 border-emerald-600 text-white scale-[1.02] shadow-2xl' : 'bg-neutral-50 border-slate-200 hover:border-slate-400'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'paid' ? 'text-emerald-200' : 'text-neutral-600'}`}>Réglé</p>
            <div className="text-2xl font-black">{paidRevenue} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'paid' ? 'text-emerald-300' : 'text-neutral-400'}`}>{filteredAppts.filter(a => a.paid).length} Paiements</p>
          </div>

          <div 
            onClick={() => setFilterStatus('pending')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'pending' ? 'bg-red-600 border-red-600 text-white scale-[1.02] shadow-2xl' : 'bg-red-50 border-red-100 hover:border-red-300'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'pending' ? 'text-red-200' : 'text-red-600'}`}>En attente</p>
            <div className="text-2xl font-black">{pendingRevenue} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'pending' ? 'text-red-300' : 'text-red-500'}`}>{filteredAppts.filter(a => !a.paid).length} Impayés</p>
          </div>
        </div>"""

text = text.replace(old_kpi_block, new_kpi_block)

# 2. Remove the old small tab buttons to avoid redundancy
old_small_buttons = """          <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1">
            {(['all', 'paid', 'pending'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`view-btn ${filterStatus === s ? 'active' : ''}`}>
                {s === 'all' ? 'Tous' : s === 'paid' ? 'Réglé' : 'Attente'}
              </button>
            ))}
          </div>"""

text = text.replace(old_small_buttons, '')

with open(path, 'w') as f:
    f.write(text)

