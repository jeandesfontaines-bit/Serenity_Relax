import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update the Selection Badge in AccountingView to include the Export button
old_acc_badge = """        {selectedInvoices.length > 0 && (
          <div className="px-8 py-2 bg-indigo-600 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
            <span>{selectedInvoices.length} factures sélectionnées pour l'exportation</span>
            <button onClick={() => setSelectedInvoices([])} className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/40 transition-all">Tout désélectionner</button>
          </div>
        )}"""

new_acc_badge = """        {selectedInvoices.length > 0 && (
          <div className="px-12 py-3 bg-slate-900 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-8">
               <span>{selectedInvoices.length} factures sélectionnées pour l'exportation</span>
               <div className="h-4 w-px bg-white/20"/>
               <button 
                 onClick={exportToCSV} 
                 className="flex items-center gap-2 hover:text-indigo-400 transition-all"
               >
                  <Download size={14}/> Exporter (.CSV)
               </button>
            </div>
            <button onClick={() => setSelectedInvoices([])} className="bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all">Tout désélectionner</button>
          </div>
        )}"""

text = text.replace(old_acc_badge, new_acc_badge)

with open(path, 'w') as f:
    f.write(text)

