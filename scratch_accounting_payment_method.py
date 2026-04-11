import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add state for payment selector
accounting_start = text.find('const AccountingView = () => {')
insert_state = text.find('const [searchTerm, setSearchTerm] = useState(\'\');', accounting_start)
text = text[:insert_state] + "    const [payingApptId, setPayingApptId] = useState<string | null>(null);\n" + text[insert_state:]

# 2. Update togglePayment and add confirmPayment
old_toggle = """    const togglePayment = async (id: string, current: boolean) => {
      try {
        await updateDoc(doc(firestore, 'appointments', id), { paid: !current });
      } catch (e) {
        console.error("Error updating payment", e);
      }
    };"""

new_toggle = """    const togglePayment = async (id: string, current: boolean) => {
      if (!current) {
        setPayingApptId(id);
      } else {
        try {
          await updateDoc(doc(firestore, 'appointments', id), { paid: false, paymentMethod: null });
        } catch (e) { console.error(e); }
      }
    };

    const confirmPayment = async (id: string, method: string) => {
      try {
        await updateDoc(doc(firestore, 'appointments', id), { paid: true, paymentMethod: method });
        setPayingApptId(null);
      } catch (e) { console.error(e); }
    };"""

text = text.replace(old_toggle, new_toggle)

# 3. Add the Payment Method Modal/Overlay
payment_modal = """
        {payingApptId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-12 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
               <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Valider le paiement</h3>
               <p className="text-slate-400 font-bold text-sm mb-10 italic">Choisissez le mode de paiement utilisé par le client :</p>
               
               <div className="grid grid-cols-1 gap-4 mb-10">
                  {[
                    { id: 'carte', label: 'Carte Bancaire', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white', icon: <CreditCard size={20}/> },
                    { id: 'twint', label: 'TWINT', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white', icon: <div className="w-5 h-5 flex items-center justify-center font-black text-[8px] border-2 border-current rounded-full">T</div> },
                    { id: 'espece', label: 'Espèces', color: 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-600 hover:text-white', icon: <History size={20}/> }
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => confirmPayment(payingApptId, m.id)}
                      className={`flex items-center gap-6 p-6 rounded-3xl border text-left transition-all group ${m.color}`}
                    >
                       <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center shrink-0 group-hover:bg-white/20">
                          {m.icon}
                       </div>
                       <div>
                          <p className="font-black uppercase tracking-widest text-xs">{m.label}</p>
                          <p className="text-[10px] opacity-60 font-bold mt-0.5 whitespace-nowrap">Marquer cette facture comme réglée via {m.label}</p>
                       </div>
                    </button>
                  ))}
               </div>
               
               <button onClick={() => setPayingApptId(null)} className="w-full py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-all underline underline-offset-8 decoration-slate-200">Annuler</button>
            </div>
          </div>
        )}
"""

# Insert before the closing div of AccountingView
last_div_pos = text.rfind('</div>', accounting_start, text.find('};', text.find('const PatientsView')))
# Wait, let's be more precise.
# Find the last `return (...)` closing tag.
end_pos = text.find(');', text.find('return', text.find('const AccountingView')))
text = text[:end_pos] + payment_modal + text[end_pos:]

with open(path, 'w') as f:
    f.write(text)

