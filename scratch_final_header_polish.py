import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add useEffect to AccountingView to expose export function
accounting_start = text.find('const AccountingView = () => {')
insert_pos = text.find('const [searchTerm, setSearchTerm] = useState(\'\');', accounting_start)
use_effect_code = """
    useEffect(() => {
      (window as any).exportAccountsToCSV = exportToCSV;
      return () => { (window as any).exportAccountsToCSV = null; };
    }, [filteredAppts]);
"""
# Oops, exportToCSV is defined later in AccountingView. I should move it or put useEffect after it.
# Let's find end of exportToCSV.
export_end = text.find('document.body.removeChild(link);', accounting_start)
export_end = text.find('};', export_end) + 2

text = text[:export_end] + use_effect_code + text[export_end:]

# 2. Refine the Nav Subtitles
old_nav_sub = """                      <div className="flex flex-col border-l border-slate-100 pl-4">
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{tab === 'clients' ? 'Patients' : 'Comptabilité'}</span>
                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">{tab === 'clients' ? 'Liste complète et fiches' : 'Gestion des factures et paiements'}</span>
                      </div>"""

new_nav_sub = """                      <div className="flex flex-col border-l border-slate-100 pl-6 gap-0.5">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{tab === 'clients' ? 'Patients' : 'Comptabilité'}</span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.15em] leading-none">{tab === 'clients' ? 'Liste complète et fiches dossiers' : 'Gestion des factures et paiements'}</span>
                      </div>"""

text = text.replace(old_nav_sub, new_nav_sub)

with open(path, 'w') as f:
    f.write(text)

