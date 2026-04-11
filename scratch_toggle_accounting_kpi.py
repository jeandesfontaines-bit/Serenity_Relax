import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Replace the onClick handlers to support toggling
text = text.replace("onClick={() => setFilterStatus('all')}", "onClick={() => setFilterStatus('all')}") # Already all
text = text.replace("onClick={() => setFilterStatus('paid')}", "onClick={() => setFilterStatus(filterStatus === 'paid' ? 'all' : 'paid')}")
text = text.replace("onClick={() => setFilterStatus('pending')}", "onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}")

with open(path, 'w') as f:
    f.write(text)

