import sys
import re

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update `setSelectedInvoice(something)` -> `window.open('/therapist/invoice/' + something.id, '_blank')`
# Places to check:
#   setSelectedInvoice(inv); 
#   setSelectedInvoice(data);
#   setSelectedInvoice(invoiceData);

text = text.replace('setSelectedInvoice(inv);', 'window.open("/therapist/invoice/" + inv.id, "_blank");')
text = text.replace('setSelectedInvoice(data);', 'window.open("/therapist/invoice/" + data.id, "_blank");')
text = text.replace('setSelectedInvoice(invoiceData);', 'window.open("/therapist/invoice/" + invoiceId, "_blank");')

# 2. At line 109, we can remove the state or leave it, but just so it doesn't break anything, we'll leave it but unused.
# Actually, the modal code at the end of the file around line 1819 {selectedInvoice && ...} needs to be removed.
modal_start = text.find('{/* ══ INVOICE VIEW (PRINTABLE) ════════════════════════════════════════ */}')
if modal_start != -1:
    modal_end = text.find('    </div>\n  );\n}\n', modal_start)
    if modal_end != -1:
        text = text[:modal_start] + text[modal_end:]

with open(path, 'w') as f:
    f.write(text)

