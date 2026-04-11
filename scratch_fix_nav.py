import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Reconstruct the Nav block carefully
nav_start = text.find('<nav className="h-28')
nav_end = text.find('</nav>', nav_start) + 6

new_nav = """        <nav className="h-28 border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-6 w-full">
            {selectedClient && (
              <button 
                onClick={() => setSelectedClient(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all shadow-sm"
              >
                <ChevronLeft size={20}/>
              </button>
            )}
            {selectedClient ? (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none capitalize mb-2">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h1>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.15em]">Dossier Patient</p>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => { setIsEditingClient(true); setClEditForm(selectedClient); }} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Éditer Profil</button>
                   <button onClick={() => window.open(`https://wa.me/${selectedClient.phone?.replace(/\\\\s+/g, '')}`, '_blank')} className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">WhatsApp</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none capitalize whitespace-nowrap">
                    {format(cur, 'MMMM yyyy', { locale: fr })}
                  </h1>
                  
                  {(tab === 'scheduler' || tab === 'clients') && (
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
                  )}

                  {tab === 'clients' && !isAddingClient && (
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 ml-4">
                      <Search size={14} className="text-slate-300"/>
                      <input 
                        type="text" value={clSearch} onChange={e => setClSearch(e.target.value)}
                        placeholder="RECHERCHER..." 
                        className="bg-transparent border-none text-[10px] font-black w-48 outline-none text-slate-600 placeholder:text-slate-300 uppercase tracking-widest"
                      />
                    </div>
                  )}
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
                       {blockMode ? "Confirmer" : 'Édition Agenda'}
                     </button>
                    </>
                  )}

                  {tab === 'clients' && (
                    <button onClick={() => setIsAddingClient(!isAddingClient)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isAddingClient ? 'bg-slate-50 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200'}`}>
                       {isAddingClient ? 'Annuler' : 'Nouveau Patient'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>"""

text = text[:nav_start] + new_nav + text[nav_end:]

# 2. Remove the old header inside PatientsView
old_patients_header = """        <div className="px-12 py-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-10">
             <div>
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-normal mb-2">Patients</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Liste complète et fiches dossiers</p>
             </div>
             <div className="w-px h-10 bg-slate-100"/>
             {!isAddingClient && (
               <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                 <Search size={16} className="text-slate-300"/>
                 <input 
                   type="text" value={clSearch} onChange={e => setClSearch(e.target.value)}
                   placeholder="Rechercher..." 
                   className="bg-transparent border-none text-xs font-extrabold w-64 outline-none text-slate-600 placeholder:text-slate-300 uppercase tracking-widest"
                 />
               </div>
             )}
          </div>
          <button onClick={() => setIsAddingClient(!isAddingClient)} className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isAddingClient ? 'bg-slate-50 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200'}`}>
             {isAddingClient ? 'Annuler' : 'Nouveau Patient'}
          </button>
        </div>"""

text = text.replace(old_patients_header, '')

with open(path, 'w') as f:
    f.write(text)

