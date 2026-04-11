import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Remove Arrows/Date Navigator from Accounting Header
# In turn 19 I added `(tab === 'scheduler' || tab === 'accounting')`. Back to `tab === 'scheduler'`.
text = text.replace("{(tab === 'scheduler' || tab === 'accounting') && (", "{tab === 'scheduler' && (")

# 2. Implement Lazy/Infinite Scroll logic in AccountingView
accounting_start = text.find('const AccountingView = () => {')
insert_state = text.find('const [searchTerm, setSearchTerm] = useState(\'\');', accounting_start)
text = text[:insert_state] + "    const [visibleCount, setVisibleCount] = useState(20);\n" + text[insert_state:]

# Replace filteredAppts usage in the table with a sliced version
# First, find the return of AccountingView
acc_return_pos = text.find('return (', accounting_start)
# Find the map over filteredAppts
map_pos = text.find('filteredAppts.map', acc_return_pos)
text = text.replace('filteredAppts.map', 'filteredAppts.slice(0, visibleCount).map')

# Add Infinite Scroll Observer at the bottom of the table
table_end = text.find('</tbody>', map_pos)
table_end = text.find('</table>', table_end) + 8

observer_code = """
        {visibleCount < filteredAppts.length && (
          <div className="p-10 flex justify-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="px-8 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-200"
            >
              Charger plus de factures...
            </button>
          </div>
        )}
"""
text = text[:table_end] + observer_code + text[table_end:]

with open(path, 'w') as f:
    f.write(text)

