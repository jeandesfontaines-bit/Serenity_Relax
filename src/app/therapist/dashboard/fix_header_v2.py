import sys
file_path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if '<div className="flex items-center gap-6">' in line:
        start = i
    if '</h1' in line and start != -1:
        end = i
        break

if start != -1 and end != -1:
    new_content = [
        lines[start],
        '                  {tab === \'client-detail\' && (\n',
        '                    <button onClick={() => setTab(\'clients\')} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#5F27CD] hover:text-white transition-all flex items-center justify-center shadow-sm">\n',
        '                      <ChevronRight size={20} className="rotate-180"/>\n',
        '                    </button>\n',
        '                  )}\n',
        '                  <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase">\n',
        '                    {tab === \'scheduler\' ? format(cur, \'MMMM yyyy\', { locale: fr }) : tab === \'clients\' ? \'PATIENTS\' : tab === \'accounting\' ? \'COMPTABILITÉ\' : tab === \'client-detail\' ? `${selectedClient?.firstName} ${selectedClient?.lastName}` : \'DASHBOARD\'}\n',
        '                  </h1>\n'
    ]
    lines[start:end+1] = new_content

with open(file_path, 'w') as f:
    f.writelines(lines)
