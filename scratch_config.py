import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

inline_config_str = """
  const InlineConfigView = () => {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F1F2F6] animate-in fade-in duration-500">
        <div className="grid grid-cols-7 border-b border-slate-200 shrink-0 bg-white">
          {DAYS_S.map((d, i) => (
            <div key={i} className="py-6 text-center border-r border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto bg-[#F1F2F6]">
          {DAYS_S.map((_, i) => {
            const slots = [...(configSlots[i] || [])].sort();
            return (
              <div key={i} className="border-r border-slate-200 p-4 flex flex-col gap-3 min-h-[600px] transition-all">
                {slots.map(t => (
                  <div key={t} className="relative p-5 text-[11px] font-black border-l-4 border-slate-200 bg-white shadow-sm flex justify-between items-center group rounded-r-xl">
                    <span className="text-slate-600 truncate">{t}</span>
                    <button onClick={() => { const nS = slots.filter(x => x !== t); setConfigSlots({...configSlots, [i]: nS}); setSavingCfg(true); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"><X size={14}/></button>
                  </div>
                ))}
                
                {addingSlotForDay === i ? (
                  <div className="mt-2 p-4 bg-white border border-blue-200 rounded-2xl shadow-xl shadow-blue-50 animate-in zoom-in-95 duration-200">
                    <input 
                      autoFocus 
                      value={newSlotTime} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2) val = val.slice(0,2) + ":" + val.slice(2,4);
                        setNewSlotTime(val);
                      }} 
                      placeholder="HH:MM" 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-black text-center text-slate-900 outline-none focus:bg-white focus:border-blue-400 mb-3"
                      maxLength={5}
                    />
                    <div className="flex gap-2">
                       <button onClick={() => { setAddingSlotForDay(null); setNewSlotTime(""); }} className="flex-1 py-2 text-[8px] font-black uppercase text-slate-400 hover:text-slate-900 transition-all">Retour</button>
                       <button onClick={() => addQuickSlot(i, newSlotTime)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">Ajouter</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setAddingSlotForDay(i); setNewSlotTime(""); }}
                    className="mt-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all group"
                  >
                    <Plus size={20} className="group-hover:scale-110 transition-transform"/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const MonthView = () => {"""

text = text.replace("  const MonthView = () => {", inline_config_str)

button_str = """
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
                   setView('month');
                   setCfgOpen(false);
                 }}
                 className={`ml-4 py-2.5 px-6 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
               >
                 {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                 {blockMode ? "Confirmer Changements" : 'Mode Édition Agenda'}
               </button>
              </>
            )}
"""

old_button_str = """
            {tab === 'scheduler' && (
              <button 
                onClick={() => {
                  const nextMode = !blockMode;
                  setBlockMode(nextMode);
                  setTab('scheduler');
                  setView('month');
                }}
                className={`ml-4 py-2.5 px-6 rounded-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border shadow-sm ${blockMode ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`}
              >
                {blockMode ? <CheckCircle2 size={14}/> : <Edit3 size={14}/>}
                {blockMode ? "Confirmer Changements" : 'Mode Édition Agenda'}
              </button>
            )}
"""

text = text.replace(old_button_str.strip(), button_str.strip())


main_view_renderer_old = """
          ) : (
            tab === 'scheduler' ? (
              view === 'month' ? <MonthView/> : <WeekView/>
            ) : tab === 'clients' ? <PatientsView/> : tab === 'accounting' ? <AccountingView/> : tab === 'settings' ? <ConfigurationView/> : <DashboardOverview/>
          )}"""

main_view_renderer_new = """
          ) : (
            tab === 'scheduler' ? (
              cfgOpen ? <InlineConfigView/> : (view === 'month' ? <MonthView/> : <WeekView/>)
            ) : tab === 'clients' ? <PatientsView/> : tab === 'accounting' ? <AccountingView/> : tab === 'settings' ? <ConfigurationView/> : <DashboardOverview/>
          )}"""

text = text.replace(main_view_renderer_old, main_view_renderer_new)


with open(path, 'w') as f:
    f.write(text)

