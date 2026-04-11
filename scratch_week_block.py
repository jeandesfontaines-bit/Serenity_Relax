import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Remove setView('month') so it doesn't force a jump when clicking Mode Edition Agenda
old_btn = """               <button 
                 onClick={() => {
                   const nextMode = !blockMode;
                   setBlockMode(nextMode);
                   setTab('scheduler');
                   setView('month');
                   setCfgOpen(false);
                 }}"""
new_btn = """               <button 
                 onClick={() => {
                   const nextMode = !blockMode;
                   setBlockMode(nextMode);
                   setTab('scheduler');
                   setCfgOpen(false);
                 }}"""
text = text.replace(old_btn, new_btn)

# 2. Add blockMode interactions to the WeekView column
old_col = """            return (
              <div key={i}
                className={`border-r border-slate-200 p-4 flex flex-col gap-3 min-h-[600px] transition-all
                  ${isOpen ? 'bg-white' : 'bg-slate-200/60 day-closed-stripes opacity-60'}
                `}
              >
                {isOpen ? ("""

new_col = """            return (
              <div key={i}
                className={`border-r border-slate-200 p-4 flex flex-col gap-3 min-h-[600px] transition-all
                  ${isOpen ? 'bg-white' : 'bg-slate-200/60 day-closed-stripes opacity-60'}
                  ${blockMode ? 'cursor-pointer hover:opacity-80 ring-inset hover:ring-2 hover:ring-blue-400' : ''}
                `}
                onMouseDown={e => {
                  if (blockMode) {
                    setIsDrag(true);
                    setDragAct(isOpen ? 'close' : 'open');
                    toggleDay(dStr);
                    e.preventDefault();
                  }
                }}
                onMouseEnter={() => { if (isDrag && blockMode) toggleDay(dStr); }}
              >
                {isOpen ? ("""
text = text.replace(old_col, new_col)


# Also disable pointer events on children in blockMode to ensure smooth dragging
old_slot = """                        <div key={t}
                          onClick={(e) => {
                            if (blockMode) return;
                            ev ? setSelectedAppt(ev) : blocked ? toggleSlot(dStr, t) : openModal(dStr, t);
                          }}"""

new_slot = """                        <div key={t}
                          onClick={(e) => {
                            if (blockMode) return;
                            ev ? setSelectedAppt(ev) : blocked ? toggleSlot(dStr, t) : openModal(dStr, t);
                          }}
                          style={{ pointerEvents: blockMode ? 'none' : 'auto' }}"""
text = text.replace(old_slot, new_slot)


with open(path, 'w') as f:
    f.write(text)

