import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update the Arrows block condition
# Change {tab === 'scheduler' && ( to {(tab === 'scheduler' || tab === 'accounting' || tab === 'dashboard') && (
# BUT hide it for accounting if the user wants to remove everything related to months.
# Actually, the user says "enleve le mois".

# I'll modify the arrows container to NOT show for 'clients' but KEEP for others where it makes sense.
# Wait, I'll just change line 1659 to only dashboard/scheduler.

text = text.replace("{tab === 'scheduler' && (", "{(tab === 'scheduler' || tab === 'dashboard') && (")

with open(path, 'w') as f:
    f.write(text)

