import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Add onDoubleClick to the profile info items
old_it_render = """                               <div key={i} className="flex items-center gap-5">
                                  <div className="min-w-0">"""

new_it_render = """                               <div 
                                  key={i} 
                                  className="flex items-center gap-5 cursor-text group/item"
                                  onDoubleClick={() => { setIsEditingClient(true); setClEditForm(selectedClient); }}
                               >
                                  <div className="min-w-0">"""

text = text.replace(old_it_render, new_it_render)

# Also add onDoubleClick to the Name and Insurance
text = text.replace('<h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">', '<h2 onDoubleClick={() => { setIsEditingClient(true); setClEditForm(selectedClient); }} className="text-3xl font-black text-slate-900 tracking-tight mb-2 cursor-text">')
text = text.replace('<span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">', '<span onDoubleClick={() => { setIsEditingClient(true); setClEditForm(selectedClient); }} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full cursor-text">')

with open(path, 'w') as f:
    f.write(text)

