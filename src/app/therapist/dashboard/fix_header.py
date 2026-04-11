import sys
file_path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

# Update openClientFolder
for i, line in enumerate(lines):
    if 'const openClientFolder = (c: any) => {' in line:
        # Check standard opening
        if 'setTab' not in lines[i+1] and 'setTab' not in lines[i+2] and 'setTab' not in lines[i+3] and 'setTab' not in lines[i+4]:
             lines[i+3] = lines[i+3] + "    setTab('client-detail');\n"
        break

# Update Header
new_header = """                  {tab === 'client-detail' && (
                    <button onClick={() => setTab('clients')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#5F27CD] hover:text-white transition-all flex items-center justify-center shadow-sm">
                      <ChevronRight size={20} className="rotate-180"/>
                    </button>
                  )}
                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase">
                    {tab === 'scheduler' ? format(cur, 'MMMM yyyy', { locale: fr }) : tab === 'clients' ? 'PATIENTS' : tab === 'accounting' ? 'COMPTABILITÉ' : tab === 'client-detail' ? `${selectedClient?.firstName} ${selectedClient?.lastName}` : 'DASHBOARD'}
                  </h1>
"""
for i, line in enumerate(lines):
    if '<h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase">' in line:
        if i + 1 < len(lines) and 'tab ===' in lines[i+1]:
             lines[i] = new_header
             lines[i+1] = ""
             break

with open(file_path, 'w') as f:
    f.writelines(lines)
