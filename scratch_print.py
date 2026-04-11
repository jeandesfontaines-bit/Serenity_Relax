import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add print:hidden to the aside
old_aside = '<aside className="w-28 bg-white border-r border-slate-200 flex flex-col items-center py-12 gap-1 shrink-0 z-10 shadow-[20px_0_40px_rgba(0,0,0,0.02)]">'
new_aside = '<aside className="w-28 bg-white border-r border-slate-200 flex flex-col items-center py-12 gap-1 shrink-0 z-10 shadow-[20px_0_40px_rgba(0,0,0,0.02)] print:hidden">'
text = text.replace(old_aside, new_aside)

# 2. Add print:hidden to the <main> element? The user said it shows the left menu, that's the <aside>.
# Wait, the invoice modal is fixed over the page:
# <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-6 backdrop-blur-xl transition-all duration-500 overflow-y-auto" onClick={() => setSelectedInvoice(null)}>
# If the modal is fixed, when you print, normally browser prints the whole DOM, and the modal is just drawn over it. But `aside` might still show if things overlap. Usually, to print only the modal, we apply `@media print` rules, or just `print:hidden` to everything we don't want.
# Actually, the main app is enclosed in:
# <div className="min-h-screen bg-[#F8F9FB] flex font-sans">
#   <aside>...</aside>
#   <main className="flex-1 overflow-hidden flex flex-col">...</main>
# </div>
# The invoice is rendered at the end:
# {selectedInvoice && (<div className="fixed inset-0... > ... </div>}
# So if we add print:hidden to <aside> and <main>, the invoice will be the only thing left.
old_main = '<main className="flex-1 overflow-hidden flex flex-col">'
new_main = '<main className="flex-1 overflow-hidden flex flex-col print:hidden">'
text = text.replace(old_main, new_main)

# To ensure the fixed invoice prints well, we can drop its background and centering properties when printing
old_invoice_container1 = '<div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-6 backdrop-blur-xl transition-all duration-500 overflow-y-auto" onClick={() => setSelectedInvoice(null)}>'
new_invoice_container1 = '<div className="fixed inset-0 bg-slate-900/60 print:bg-white print:p-0 flex flex-col items-center justify-start z-[110] p-6 backdrop-blur-xl transition-all duration-500 overflow-y-auto" onClick={() => setSelectedInvoice(null)}>'
text = text.replace(old_invoice_container1, new_invoice_container1)

old_invoice_container2 = '<div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-4xl min-h-[800px] flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>'
new_invoice_container2 = '<div className="bg-white rounded-[4rem] print:rounded-none shadow-2xl print:shadow-none w-full max-w-4xl min-h-[800px] flex flex-col overflow-hidden relative print:block" onClick={e => e.stopPropagation()}>'
text = text.replace(old_invoice_container2, new_invoice_container2)


# 3. Remove the logo from invoice
logo_code = '<div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-3xl font-black ml-auto mb-6">S</div>'
text = text.replace(logo_code, '')

with open(path, 'w') as f:
    f.write(text)

