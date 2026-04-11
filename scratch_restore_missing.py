import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Add missing DashboardOverview pieces
old_overview_end = """               </div>
            </div>
          </div>
        </div>
      </div>"""

new_overview_end = """               </div>
            </div>
            
            <div className="space-y-16">
               <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-100 pb-4">Activité Récente</h3>
                  <div className="space-y-8 pl-4 border-l-2 border-slate-50 ml-2">
                     {clients.slice(0, 4).map((c, i) => (
                        <div key={i} className="relative flex items-center gap-5 group cursor-pointer" onClick={() => openClientFolder(c)}>
                           <div className="absolute -left-[1.35rem] w-3 h-3 rounded-full bg-white border-4 border-blue-500 z-10"/>
                           <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors uppercase">{c.firstName} {c.lastName}</p>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-300">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><Bell size={20}/></div>
                  <h4 className="text-lg font-black uppercase mb-2">Conseil du jour</h4>
                  <p className="text-sm text-slate-400 leading-relaxed italic">"Pensez à relancer les factures en attente avant la fin de semaine pour optimiser votre trésorerie."</p>
               </div>
            </div>
          </div>
        </div>
      </div>"""

text = text.replace(old_overview_end, new_overview_end)

with open(path, 'w') as f:
    f.write(text)
