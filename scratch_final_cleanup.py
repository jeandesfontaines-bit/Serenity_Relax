import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Fix Sidebar Nav Icon list
text = text.replace("Icon: Calendar, Globe, MapRange,", "Icon: Calendar,")

# 2. Fix the typo </div>/div> at line 1985
text = text.replace("</div>/div>", "</div>")

# 3. Fix the evModal null check at line 2000
text = text.replace("new Date(evModal.date)", "new Date(evModal?.date || '')")
text = text.replace("evModal.time", "evModal?.time")

# 4. Check if there are other syntax errors around line 2099
# The ternary chain looks like this:
# {selectedAppt ? (...) : selectedClient ? (...) : evModal ? (...) : (tab === 'scheduler' ? (...) : ...)}

with open(path, 'w') as f:
    f.write(text)

