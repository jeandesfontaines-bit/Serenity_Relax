import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Unified list of profile information
old_fields = """                              {[
                                { label: 'Email', val: selectedClient.email, Icon: Mail },
                                { label: 'Téléphone', val: selectedClient.phone, Icon: Activity }
                              ].map((it, i) => ("""

new_fields = """                              {[
                                { label: 'Email', val: selectedClient.email, Icon: Mail },
                                { label: 'Téléphone', val: selectedClient.phone, Icon: Activity },
                                { label: 'Date de Naissance', val: selectedClient.birthDate, Icon: Calendar },
                                { label: 'Adresse', val: selectedClient.address, Icon: Search },
                                { label: 'Code Postal', val: selectedClient.zipCode, Icon: Map },
                                { label: 'Ville', val: selectedClient.city, Icon: Globe }
                              ].map((it, i) => ("""

# I need to ensure Icons are imported
if "Globe" not in text:
    text = text.replace("Calendar", "Calendar, Globe, Map")

text = text.replace(old_fields, new_fields)

with open(path, 'w') as f:
    f.write(text)

