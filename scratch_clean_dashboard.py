import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Remove the junk at the end (from line 2049 onwards)
lines = lines[:2046]

# Ensure the last lines are correct
# Line 2046 should be the closing of the return
# Line 2047 should be the closing of the component
# Line 2048 should be the export default or similar

with open(path, 'w') as f:
    f.writelines(lines)
    f.write('    </div>\n  );\n};\n\nexport default TherapistDashboard;\n')

