import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update clForm usage to include birthDate
text = text.replace(
    "const [clForm,     setClForm]     = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '' });",
    "const [clForm,     setClForm]     = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '', birthDate: '' });"
)
text = text.replace(
    "setClForm({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '' });",
    "setClForm({ firstName: '', lastName: '', email: '', phone: '', address: '', insurance: '', birthDate: '' });"
)

# 2. Remove avatar from DashboardOverview -> Activité Récente (approx line 911)
old_dashboard_activity = """                     {clients.slice(0, 4).map((c, i) => (
                        <div key={i} className="relative flex items-center gap-5 group cursor-pointer" onClick={() => openClientFolder(c)}>
                           <div className="absolute -left-[1.35rem] w-3 h-3 rounded-full bg-white border-4 border-blue-500 z-10"/>
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {c.firstName[0]}{c.lastName[0]}
                           </div>
                           <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1.5">{c.firstName} {c.lastName}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Inscrit il y a {i + 1}j</p>
                           </div>
                        </div>
                     ))}"""

new_dashboard_activity = """                     {clients.slice(0, 4).map((c, i) => (
                        <div key={i} className="relative flex items-center gap-5 group cursor-pointer" onClick={() => openClientFolder(c)}>
                           <div className="absolute -left-[1.35rem] w-3 h-3 rounded-full bg-white border-4 border-blue-500 z-10"/>
                           <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1.5">{c.firstName} {c.lastName}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Inscrit il y a {i + 1}j</p>
                           </div>
                        </div>
                     ))}"""

text = text.replace(old_dashboard_activity, new_dashboard_activity)


# 3. Add birthdate input to the new patient form (approx line 1190)
old_patient_form_admin = """                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administration</label>
                     <input value={clForm.insurance} onChange={e => setClForm({...clForm, insurance: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Assurance (ex: Helsana)"/>
                     <textarea value={clForm.address} onChange={e => setClForm({...clForm, address: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500 min-h-[120px]" placeholder="Adresse complète..."/>"""

new_patient_form_admin = """                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administration</label>
                     <div className="grid grid-cols-2 gap-4">
                        <input value={clForm.insurance} onChange={e => setClForm({...clForm, insurance: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Assurance (ex: Helsana)"/>
                        <input type="text" value={clForm.birthDate} onChange={e => setClForm({...clForm, birthDate: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Date de Naissance (ex: 12/04/1985)"/>
                     </div>
                     <textarea value={clForm.address} onChange={e => setClForm({...clForm, address: e.target.value})} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500 min-h-[120px]" placeholder="Adresse complète..."/>"""

text = text.replace(old_patient_form_admin, new_patient_form_admin)

# 4. Add birthdate and address to the edit client profile form
old_edit_client_form = """                             <input value={clEditForm.phone || ''} onChange={e => setClEditForm({...clEditForm, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Téléphone"/>
                             <input value={clEditForm.insurance || ''} onChange={e => setClEditForm({...clEditForm, insurance: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Assurance"/>
                          </div>"""

new_edit_client_form = """                             <input value={clEditForm.phone || ''} onChange={e => setClEditForm({...clEditForm, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Téléphone"/>
                             <input value={clEditForm.insurance || ''} onChange={e => setClEditForm({...clEditForm, insurance: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Assurance"/>
                             <input value={clEditForm.birthDate || ''} onChange={e => setClEditForm({...clEditForm, birthDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Date de naissance"/>
                             <input value={clEditForm.address || ''} onChange={e => setClEditForm({...clEditForm, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-blue-500" placeholder="Adresse complète"/>
                          </div>"""

text = text.replace(old_edit_client_form, new_edit_client_form)

# 5. Add Address and BirthDate to the displayed items in the client profile 
old_display_items = """                       {[
                         { label: 'Email', val: selectedClient.email, Icon: Mail },
                         { label: 'Téléphone', val: selectedClient.phone, Icon: Activity }
                       ].map((it, i) => ("""

new_display_items = """                       {[
                         { label: 'Email', val: selectedClient.email },
                         { label: 'Téléphone', val: selectedClient.phone },
                         { label: 'Date de naissance', val: selectedClient.birthDate },
                         { label: 'Adresse', val: selectedClient.address }
                       ].map((it, i) => ("""

text = text.replace(old_display_items, new_display_items)

with open(path, 'w') as f:
    f.write(text)

