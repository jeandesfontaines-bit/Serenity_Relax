import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update filterStatus type and initial state
text = text.replace("const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');", "const [filterStatus, setFilterStatus] = useState<'all' | 'month' | 'paid' | 'pending'>('all');")

# 2. Update filteredAppts logic
old_filter = """    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = a.paid ? 'paid' : 'pending';
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      
      // Filtre par mois (basé sur le navigateur en haut)
      try {
        const apptDate = parse(a.date, 'yyyy-MM-dd', new Date());
        const matchMonth = isSameMonth(apptDate, cur) && isSameYear(apptDate, cur);
        return matchSearch && matchStatus && matchMonth;
      } catch(e) { return false; }
    }).sort((a,b) => (b.date || '').localeCompare(a.date || ''));"""

# Default (all) shows everything. 'month' filters by month. 'paid' filters by paid, etc.
new_filter = """    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = 
        filterStatus === 'paid' ? a.paid : 
        filterStatus === 'pending' ? !a.paid : 
        true;

      let matchMonth = true;
      if (filterStatus === 'month') {
        try {
          const apptDate = parse(a.date, 'yyyy-MM-dd', new Date());
          matchMonth = isSameMonth(apptDate, cur) && isSameYear(apptDate, cur);
        } catch(e) { matchMonth = false; }
      }
      
      return matchSearch && matchStatus && matchMonth;
    }).sort((a,b) => (b.date || '').localeCompare(a.date || ''));"""

text = text.replace(old_filter, new_filter)

# 3. Update the KPI Boxes Logic and Labels
# The first box is now 'month' filter, others are 'paid' and 'pending'.
# We also need to define the revenues for the labels (e.g. Total Month vs Total Global).
# Let's add some helper constants before the return.

insert_revenues = """
    const curMonthAppts = appointments.filter(a => {
      try {
        const d = parse(a.date, 'yyyy-MM-dd', new Date());
        return isSameMonth(d, cur) && isSameYear(d, cur);
      } catch(e) { return false; }
    });
    const monthTotal = curMonthAppts.reduce((sum, a) => sum + (a.price || 150), 0);
    const globalPaid = appointments.filter(a => a.paid).reduce((sum, a) => sum + (a.price || 150), 0);
    const globalPending = appointments.filter(a => !a.paid).reduce((sum, a) => sum + (a.price || 150), 0);
"""

# Find a place to insert revenue helpers (after pendingRevenue or similar)
rev_pos = text.find('const pendingRevenue =')
rev_pos = text.find(';', rev_pos) + 1
text = text[:rev_pos] + insert_revenues + text[rev_pos:]

# 4. Update the Boxes rendering
old_boxes = """          <div 
            onClick={() => setFilterStatus('all')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'all' ? 'bg-slate-900 border-slate-900 text-white scale-[1.02] shadow-2xl' : 'bg-neutral-50 border-slate-200 hover:border-slate-400'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'all' ? 'text-slate-400' : 'text-neutral-400'}`}>Mois en cours</p>
            <div className="text-2xl font-black">{totalRevenue} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'all' ? 'text-slate-500' : 'text-neutral-400'}`}>{filteredAppts.length} Transactions</p>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'paid' ? 'all' : 'paid')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'paid' ? 'bg-emerald-600 border-emerald-600 text-white scale-[1.02] shadow-2xl' : 'bg-neutral-50 border-slate-200 hover:border-slate-400'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'paid' ? 'text-emerald-200' : 'text-neutral-600'}`}>Réglé</p>
            <div className="text-2xl font-black">{paidRevenue} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'paid' ? 'text-emerald-300' : 'text-neutral-400'}`}>{filteredAppts.filter(a => a.paid).length} Paiements</p>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'pending' ? 'bg-red-600 border-red-600 text-white scale-[1.02] shadow-2xl' : 'bg-red-50 border-red-100 hover:border-red-300'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'pending' ? 'text-red-200' : 'text-red-600'}`}>En attente</p>
            <div className="text-2xl font-black">{pendingRevenue} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'pending' ? 'text-red-300' : 'text-red-500'}`}>{filteredAppts.filter(a => !a.paid).length} Impayés</p>
          </div>"""

new_boxes = """          <div 
            onClick={() => setFilterStatus(filterStatus === 'month' ? 'all' : 'month')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'month' ? 'bg-slate-900 border-slate-900 text-white scale-[1.02] shadow-2xl' : 'bg-neutral-50 border-slate-200 hover:border-slate-400'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'month' ? 'text-slate-400' : 'text-neutral-400'}`}>Mois en cours</p>
            <div className="text-2xl font-black">{monthTotal} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'month' ? 'text-slate-500' : 'text-neutral-400'}`}>{curMonthAppts.length} Transactions</p>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'paid' ? 'all' : 'paid')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'paid' ? 'bg-emerald-600 border-emerald-600 text-white scale-[1.02] shadow-2xl' : 'bg-neutral-50 border-slate-200 hover:border-slate-400'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'paid' ? 'text-emerald-200' : 'text-neutral-600'}`}>Réglé (Global)</p>
            <div className="text-2xl font-black">{globalPaid} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'paid' ? 'text-emerald-300' : 'text-neutral-400'}`}>{appointments.filter(a => a.paid).length} Paiements</p>
          </div>

          <div 
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
            className={`cursor-pointer transition-all duration-300 p-6 rounded-[2rem] border ${filterStatus === 'pending' ? 'bg-red-600 border-red-600 text-white scale-[1.02] shadow-2xl' : 'bg-red-50 border-red-100 hover:border-red-300'}`}
          >
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${filterStatus === 'pending' ? 'text-red-200' : 'text-red-600'}`}>En attente (Global)</p>
            <div className="text-2xl font-black">{globalPending} CHF</div>
            <p className={`text-[10px] font-bold mt-1 ${filterStatus === 'pending' ? 'text-red-300' : 'text-red-500'}`}>{appointments.filter(a => !a.paid).length} Impayés</p>
          </div>"""

text = text.replace(old_boxes, new_boxes)

with open(path, 'w') as f:
    f.write(text)

