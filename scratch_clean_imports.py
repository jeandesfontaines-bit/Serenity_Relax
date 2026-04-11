import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Clean up line 7
line7 = lines[6]
parts = line7.split(',')
cleaned = []
seen = set()
for p in parts:
    s = p.strip()
    if s and s not in seen:
        seen.add(s)
        cleaned.append(s)

lines[6] = '  ' + ', '.join(cleaned) + '\n'

with open(path, 'w') as f:
    f.writelines(lines)

