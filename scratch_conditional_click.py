import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update AccountingView Row Logic
old_acc_row_onclick = """                      onClick={() => {
                        if (isSel) setSelectedInvoices(prev => prev.filter(id => id !== a.id));
                        else setSelectedInvoices(prev => [...prev, a.id]);
                      }}"""

new_acc_row_onclick = """                      onClick={() => {
                        if (selectedInvoices.length > 0) {
                          if (selectedInvoices.includes(a.id)) setSelectedInvoices(prev => prev.filter(id => id !== a.id));
                          else setSelectedInvoices(prev => [...prev, a.id]);
                        } else {
                          if(inv) window.open("/therapist/invoice/" + inv.id, "_blank");
                        }
                      }}"""

text = text.replace(old_acc_row_onclick, new_acc_row_onclick)

# Also fix the Checkbox in Accounting to ensure it has pointer-events for manual toggle
text = text.replace('className="w-4 h-4 rounded border-slate-300"', 'className="w-4 h-4 rounded border-slate-300 pointer-events-auto"')

# 2. Update PatientsView Row Logic
old_p_row_onclick = """                         onClick={() => {
                           if (selectedClients.includes(c.id)) setSelectedClients(prev => prev.filter(id => id !== c.id));
                           else setSelectedClients(prev => [...prev, c.id]);
                         }}"""

new_p_row_onclick = """                         onClick={() => {
                           if (selectedClients.length > 0) {
                             if (selectedClients.includes(c.id)) setSelectedClients(prev => prev.filter(id => id !== c.id));
                             else setSelectedClients(prev => [...prev, c.id]);
                           } else {
                             openClientFolder(c);
                           }
                         }}"""

text = text.replace(old_p_row_onclick, new_p_row_onclick)

with open(path, 'w') as f:
    f.write(text)

