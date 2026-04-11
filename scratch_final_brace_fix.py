import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Fix the typo in the edit form label
text = text.replace('Identité</div <div', 'Identité</label><div')

# Fix the typo in h3 tracking
text = text.replace('tracking-[0.4em]>Journal', 'tracking-[0.4em]">Journal')

# Check for unclosed divs manually in the blocks
# selectedClient block starts at selectedClient ? (
# It has a div for the whole block is line 192 (approx)
# Inside it has <div 96 p-16 ...> (Profile)
#   Then <div space-y-20>
#     Then isEditing ? (...) : (...)
#   Then </div> (closes space-y-20)
# Then </div> (closes w-450)
# Then <div flex-1 p-20 ...> (Right Area)
#   Then <div max-w-6xl ...>
#     Then <div flex items-end...></div>
#     Then <div bg-white...> ... </div>
#   Then </div> (closes max-w-6xl)
# Then </div> (closes flex-1)
# Then </div> (closes divide-x)

# Let's count them in code logic.

with open(path, 'w') as f:
    f.write(text)
