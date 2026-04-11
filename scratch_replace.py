import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Fix spacing in uppercase titles
text = text.replace('tracking-tight uppercase', 'uppercase tracking-normal')

# Remove the bad closing tags in PatientsView
bad_jsx = """                        <td className="p-8">

                              <p className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">{c.firstName} {c.lastName}</p>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 italic">Dossier ACTIF</p>
                            </div>
                          </div>
                        </td>"""

good_jsx = """                        <td className="p-8">
                              <p className="font-extrabold text-lg text-slate-900 tracking-normal leading-none">{c.firstName} {c.lastName}</p>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 italic">Dossier ACTIF</p>
                        </td>"""

text = text.replace(bad_jsx, good_jsx)

# Also there might be a case where tracking-tight was already replaced due to the first replace
# So let's do the good_jsx without tracking-tight
bad_jsx_2 = """                        <td className="p-8">

                              <p className="font-extrabold text-lg text-slate-900 tracking-normal leading-none">{c.firstName} {c.lastName}</p>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2 italic">Dossier ACTIF</p>
                            </div>
                          </div>
                        </td>"""

text = text.replace(bad_jsx_2, good_jsx)

# Remove the icons from selectedClient view
old_map = """                         <div key={i} className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-50 flex items-center justify-center text-slate-300 shadow-sm"><it.Icon size={16}/></div>
                            <div className="min-w-0">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{it.label}</p>
                               <p className="text-sm font-bold text-slate-600 truncate">{it.val || '—'}</p>
                            </div>
                         </div>"""

new_map = """                         <div key={i} className="flex items-center gap-5">
                            <div className="min-w-0">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{it.label}</p>
                               <p className="text-sm font-bold text-slate-600 truncate">{it.val || '—'}</p>
                            </div>
                         </div>"""

text = text.replace(old_map, new_map)


with open(path, 'w') as f:
    f.write(text)
