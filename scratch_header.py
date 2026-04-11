import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

old_nav = """        <nav className="h-24 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            {selectedClient && (
              <button 
                onClick={() => setSelectedClient(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shadow-sm"
              >
                <ChevronLeft size={20}/>
              </button>
            )}
            <div>
              <h1 className="text-xl font-medium tracking-tight text-slate-900 leading-none">
                {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : format(new Date(), 'd MMMM yyyy', { locale: fr })}
              </h1>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em] mt-1">
                {selectedClient ? 'Dossier Patient' : (tab === 'scheduler' ? (view === 'month' ? 'Vue mensuelle' : view === 'week' ? 'Vue hebdomadaire' : 'Vue quotidienne') : '')}
              </p>
            </div>

            {tab === 'scheduler' && (
              <>
               <button 
                 onClick={() => { setCfgOpen(!cfgOpen); setBlockMode(false); }}
                 className={`ml-4 py-2.5 px-6 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${cfgOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
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
                 className={`ml-4 py-2.5 px-6 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
               >
                 {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                 {blockMode ? "Confirmer Changements" : 'Mode Édition Agenda'}
               </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {tab === 'scheduler' && (
              <>
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  {(['month', 'week'] as const).map(v => (
                    <button key={v} onClick={() => setView(v)} className={`view-btn ${view === v ? 'active' : ''}`}>
                      {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => period(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                    <ChevronLeft size={16}/>
                  </button>
                  <button onClick={() => setCur(new Date())} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                    Aujourd'hui
                  </button>
                  <button onClick={() => period(1)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                    <ChevronRight size={16}/>
                  </button>
                </div>
              </>
            )}
            
          </div>
        </nav>"""

new_nav = """        <nav className="h-28 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6">
            {selectedClient && (
              <button 
                onClick={() => setSelectedClient(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shadow-sm"
              >
                <ChevronLeft size={20}/>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none capitalize mb-3">
                {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : format(cur, 'MMMM yyyy', { locale: fr })}
              </h1>
              {selectedClient ? (
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em]">Dossier Patient</p>
              ) : (
                tab === 'scheduler' && (
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
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {tab === 'scheduler' && (
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
                 {blockMode ? "Confirmer Changements" : 'Mode Édition Agenda'}
               </button>
              </>
            )}
          </div>
        </nav>"""

if old_nav in text:
    text = text.replace(old_nav, new_nav)
else:
    print("Could not find the navigation block exactly.")

with open(path, 'w') as f:
    f.write(text)

