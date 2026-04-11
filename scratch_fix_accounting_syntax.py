import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Capture the payment modal block
modal_block = """        {payingApptId && (
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
        )}"""

# 2. Remove the misplaced block and fix the sort syntax
# I need to match the exact text in the file.
text = text.replace(modal_block, "")

# The sort logic was likely broken after the replace.
# Let's find the `}).sort` and ensure it ends with `);`
# Actually, I'll just find the exact spot.
bad_spot = """    }).sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];
      if (key === 'client') { valA = a.title; valB = b.title; }
      if (key === 'price') { valA = a.price || 150; valB = b.price || 150; }
      if (key === 'paid') { valA = a.paid ? 1 : 0; valB = b.paid ? 1 : 0; }
      if (!valA && valA !== 0) valA = '';
      if (!valB && valB !== 0) valB = '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    }"""

good_spot = bad_spot + ");"
text = text.replace(bad_spot, good_spot)

# 3. Insert the modal block correctly before the final `);` of the AccountingView return
# Find the return (...) of AccountingView
acc_return_start = text.find('return (', text.find('const AccountingView = () => {'))
acc_return_end = text.find(');', acc_return_start + 10) # Find the end of return

# Insert before the last </div> before );
# Wait, let's just insert it right before the last closing div of the return.
# The return contains multiple nested divs.
last_div = text.rfind('</div>', acc_return_start, acc_return_end)
text = text[:last_div] + modal_block + text[last_div:]

with open(path, 'w') as f:
    f.write(text)

