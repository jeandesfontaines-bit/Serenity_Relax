import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# Update the display list in the left profile
old_list = """                              {[
                                { label: 'Email', val: selectedClient.email, Icon: Mail },
                                { label: 'Téléphone', val: selectedClient.phone, Icon: Activity }
                              ].map((it, i) => ("""

new_list = """                              {[
                                { label: 'Email', val: selectedClient.email, Icon: Mail },
                                { label: 'Téléphone', val: selectedClient.phone, Icon: Activity },
                                { label: 'Date de Naissance', val: selectedClient.birthDate, Icon: Calendar },
                                { label: 'Adresse', val: selectedClient.address, Icon: Search }
                              ].map((it, i) => ("""

text = text.replace(old_list, new_list)

with open(path, 'w') as f:
    f.write(text)

