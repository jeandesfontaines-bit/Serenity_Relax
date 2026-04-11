import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

old_headers = """          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            return (
              <div key={i} className={`py-6 text-center border-r border-slate-200 relative group transition-all`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{DAYS_S[i]}</p>
                <div className="flex flex-col items-center mt-2">
                   <p className={`text-2xl leading-none ${isToday ? 'text-blue-600' : 'text-slate-900 opacity-80'}`}>{d.getDate()}</p>
                   {isToday && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shadow-lg shadow-blue-200"/>}
                </div>
              </div>
            );
          })}"""

new_headers = """          {days.map((d, i) => {
            const isToday = isSameDay(new Date(), d);
            const dStr = fmt(d);
            const isOpen = isDayOpen(dStr);
            return (
              <div key={i} 
                className={`py-6 text-center border-r border-slate-200 relative group transition-all ${blockMode ? 'cursor-pointer hover:bg-slate-50' : ''}`}
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
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{DAYS_S[i]}</p>
                <div className="flex flex-col items-center mt-2">
                   <p className={`text-2xl leading-none ${isToday ? 'text-blue-600' : 'text-slate-900 opacity-80'}`}>{d.getDate()}</p>
                   {isToday && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 shadow-lg shadow-blue-200"/>}
                </div>
              </div>
            );
          })}"""

text = text.replace(old_headers, new_headers)

with open(path, 'w') as f:
    f.write(text)

