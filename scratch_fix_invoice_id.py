import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Replace addDoc with setDoc for invoice generation
old_add_doc = """      await addDoc(collection(firestore, 'invoices'), invoiceData);
      window.open("/therapist/invoice/" + invoiceId, "_blank");"""

# Wait, previously I replaced it using python script that replaced:
# setSelectedInvoice(invoiceData) -> window.open("/therapist/invoice/" + invoiceId, "_blank")
# I'll just find the function block.
start_idx = text.find("const generateInvoiceForAppt = async (appt: any) => {")
end_idx = text.find("};", start_idx)
block = text[start_idx:end_idx+2]

new_block = block.replace("await addDoc(collection(firestore, 'invoices'), invoiceData);", "invoiceData.id = invoiceId;\n      await setDoc(doc(firestore, 'invoices', invoiceId), invoiceData);")

text = text[:start_idx] + new_block + text[end_idx+2:]

# Just in case `setDoc` and `doc` aren't imported around there? `doc` and `setDoc` are imported at the top of page.tsx because they are used for other things.

with open(path, 'w') as f:
    f.write(text)

