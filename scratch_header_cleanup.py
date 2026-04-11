import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Original block with month
old_header_block = """                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none capitalize whitespace-nowrap">
                      {format(cur, 'MMMM yyyy', { locale: fr })}
                    </h1>
                    {(tab === 'clients' || tab === 'accounting') && (
                      <div className="flex flex-col border-l border-slate-100 pl-6 gap-0.5">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{tab === 'clients' ? 'Patients' : 'Comptabilité'}</span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.15em] leading-none">{tab === 'clients' ? 'Liste complète et fiches dossiers' : 'Gestion des factures et paiements'}</span>
                      </div>
                    )}"""

new_header_block = """                    {(tab === 'dashboard' || tab === 'scheduler') ? (
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none capitalize whitespace-nowrap">
                        {format(cur, 'MMMM yyyy', { locale: fr })}
                      </h1>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none uppercase">{tab === 'clients' ? 'Patients' : 'Comptabilité'}</h1>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.15em] leading-none">{tab === 'clients' ? 'Liste complète et fiches dossiers' : 'Gestion des factures et paiements'}</span>
                      </div>
                    )}"""

text = text.replace(old_header_block, new_header_block)

# Also remove the redundant month arrows logic if in patients/accounting?
# The arrows are probably further down in the header.
# Actually, the user just said "enleve le mois".

with open(path, 'w') as f:
    f.write(text)

