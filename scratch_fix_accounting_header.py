import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Remove View Toggles (Mois/Semaine) and Today from Accounting
old_v_toggles = """                  {(tab === 'scheduler' || tab === 'accounting') && (
                    <div className="flex items-center gap-4">
                      <div className="flex bg-slate-50 p-1 rounded-full gap-1 border border-slate-100">
                        {(['month', 'week'] as const).map(v => (
                          <button key={v} onClick={() => setView(v)} className={`view-btn !rounded-full ${view === v ? 'active' : ''}`}>
                            {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-0 text-slate-600">
                        <button onClick={() => period(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all">
                          <ChevronLeft size={16} strokeWidth={2.5}/>
                        </button>
                        <button onClick={() => setCur(new Date())} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">
                          Aujourd'hui
                        </button>
                        <button onClick={() => period(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all">
                          <ChevronRight size={16} strokeWidth={2.5}/>
                        </button>
                      </div>
                    </div>
                  )}"""

new_v_toggles = """                  {(tab === 'scheduler' || tab === 'accounting') && (
                    <div className="flex items-center gap-4">
                      {tab === 'scheduler' && (
                        <div className="flex bg-slate-50 p-1 rounded-full gap-1 border border-slate-100">
                          {(['month', 'week'] as const).map(v => (
                            <button key={v} onClick={() => setView(v)} className={`view-btn !rounded-full ${view === v ? 'active' : ''}`}>
                              {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-0 text-slate-600">
                        <button onClick={() => period(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all">
                          <ChevronLeft size={16} strokeWidth={2.5}/>
                        </button>
                        {tab === 'scheduler' && (
                          <button onClick={() => setCur(new Date())} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all">
                            Aujourd'hui
                          </button>
                        )}
                        <button onClick={() => period(1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 hover:text-slate-900 transition-all">
                          <ChevronRight size={16} strokeWidth={2.5}/>
                        </button>
                      </div>
                    </div>
                  )}"""

text = text.replace(old_v_toggles, new_v_toggles)

# 2. Remove Scheduler Buttons from Accounting
old_sch_buttons = """                  {(tab === 'scheduler' || tab === 'accounting') && (
                    <>
                     <button 
                       onClick={() => { setCfgOpen(!cfgOpen); setBlockMode(false); }}
                       className={`py-3 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${cfgOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                     >
                       <Settings size={14}/>
                       {cfgOpen ? 'Fermer Créneaux' : 'Créneaux Types'}
                     </button>

                     <button 
                       onClick={() => {
                         const nextMode = !blockMode;
                         setBlockMode(nextMode);
                         setTab('scheduler');
                         setCfgOpen(false);
                       }}
                       className={`py-3 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
                     >
                       {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                       {blockMode ? "Confirmer" : 'Édition Agenda'}
                     </button>
                    </>
                  )}"""

new_sch_buttons = """                  {tab === 'scheduler' && (
                    <>
                     <button 
                       onClick={() => { setCfgOpen(!cfgOpen); setBlockMode(false); }}
                       className={`py-3 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${cfgOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                     >
                       <Settings size={14}/>
                       {cfgOpen ? 'Fermer Créneaux' : 'Créneaux Types'}
                     </button>

                     <button 
                       onClick={() => {
                         const nextMode = !blockMode;
                         setBlockMode(nextMode);
                         setTab('scheduler');
                         setCfgOpen(false);
                       }}
                       className={`py-3 px-6 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
                     >
                       {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                       {blockMode ? "Confirmer" : 'Édition Agenda'}
                     </button>
                    </>
                  )}"""

text = text.replace(old_sch_buttons, new_sch_buttons)

with open(path, 'w') as f:
    f.write(text)

