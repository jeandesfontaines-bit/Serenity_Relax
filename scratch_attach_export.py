import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

text = text.replace('const exportToCSV = () => {', 'const exportToCSV = () => {\n    (window as any).exportAccountsToCSV = exportToCSV;')

with open(path, 'w') as f:
    f.write(text)
