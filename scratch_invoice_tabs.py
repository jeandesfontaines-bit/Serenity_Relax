import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Replace in Archive table
text = text.replace('onClick={(e) => { e.stopPropagation(); setSelectedInvoice(hasInv); }}', 'onClick={(e) => { e.stopPropagation(); window.open("/therapist/invoice/" + hasInv.id, "_blank"); }}')

# Replace in Appointment Detail view
text = text.replace('if (hasInv) setSelectedInvoice(hasInv);', 'if (hasInv) window.open("/therapist/invoice/" + hasInv.id, "_blank");')

with open(path, 'w') as f:
    f.write(text)

