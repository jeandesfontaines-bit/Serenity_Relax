import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add Status Sorting logic to AccountingView
old_sort_logic = """      if (key === 'price') { valA = a.price || 150; valB = b.price || 150; }
      if (!valA) valA = '';
      if (!valB) valB = '';"""

new_sort_logic = """      if (key === 'price') { valA = a.price || 150; valB = b.price || 150; }
      if (key === 'paid') { valA = a.paid ? 1 : 0; valB = b.paid ? 1 : 0; }
      if (!valA && valA !== 0) valA = '';
      if (!valB && valB !== 0) valB = '';"""

text = text.replace(old_sort_logic, new_sort_logic)

# 2. Add onClick to Status header in AccountingView
old_status_th = '<th className="p-8 text-center">Statut</th>'
new_status_th = '<th onClick={() => setSortConfig({ key: \'paid\', direction: sortConfig.key === \'paid\' && sortConfig.direction === \'asc\' ? \'desc\' : \'asc\' })} className="p-8 text-center cursor-pointer hover:text-slate-900 transition-all select-none">Statut {sortConfig.key === \'paid\' ? (sortConfig.direction === \'asc\' ? \'↑\' : \'↓\') : \'\'}</th>'

text = text.replace(old_status_th, new_status_th)

with open(path, 'w') as f:
    f.write(text)

