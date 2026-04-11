import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Add bulk action functions inside TherapistDashboard or PatientsView helper
patients_view_start = text.find('const PatientsView = () => {')

# Define functions
bulk_functions = """
    const bulkDeleteClients = async () => {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedClients.length} dossiers patients ? Cette action est irréversible.`)) return;
      try {
        for (const id of selectedClients) { await deleteDoc(doc(firestore, 'clients', id)); }
        setSelectedClients([]);
      } catch (e) { console.error(e); }
    };

    const mergeClients = async () => {
      if (selectedClients.length !== 2) {
        alert("Veuillez sélectionner exactement 2 clients à fusionner.");
        return;
      }
      const [idA, idB] = selectedClients;
      const clientA = clients.find(c => c.id === idA);
      const clientB = clients.find(c => c.id === idB);
      if (!clientA || !clientB) return;

      if (!confirm(`Voulez-vous fusionner le dossier de ${clientB.firstName} ${clientB.lastName} DANS celui de ${clientA.firstName} ${clientA.lastName} ? Toutes les notes et factures seront transférées.`)) return;

      try {
        // Transfer appointments
        const bAppts = appointments.filter(a => a.clientId === idB);
        for (const appt of bAppts) {
          await updateDoc(doc(firestore, 'appointments', appt.id), { 
            clientId: idA,
            clientNameSnapshot: `${clientA.firstName} ${clientA.lastName}`.trim()
          });
        }
        // Delete Client B
        await deleteDoc(doc(firestore, 'clients', idB));
        setSelectedClients([]);
        alert("Fusion terminée avec succès.");
      } catch (e) { console.error(e); }
    };
"""

# Insert before the first `const filtered = ...`
insert_f_pos = text.find('const filtered = ', patients_view_start)
text = text[:insert_f_pos] + bulk_functions + text[insert_f_pos:]

# 2. Update the Selection Badge UI in PatientsView to add buttons
old_badge = """        {selectedClients.length > 0 && (
          <div className="px-12 py-3 bg-blue-600 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
            <span>{selectedClients.length} dossiers patients sélectionnés</span>
            <button onClick={() => setSelectedClients([])} className="bg-white/20 px-3 py-1 rounded-lg hover:bg-white/40 transition-all">Tout désélectionner</button>
          </div>
        )}"""

new_badge = """        {selectedClients.length > 0 && (
          <div className="px-12 py-3 bg-slate-900 text-white flex justify-between items-center text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-8">
               <span>{selectedClients.length} dossiers patients sélectionnés</span>
               <div className="h-4 w-px bg-white/20"/>
               <div className="flex gap-4">
                  <button onClick={bulkDeleteClients} className="flex items-center gap-2 hover:text-red-400 transition-all">
                     <Trash2 size={14}/> Supprimer en masse
                  </button>
                  {selectedClients.length === 2 && (
                    <button onClick={mergeClients} className="flex items-center gap-2 hover:text-blue-400 transition-all">
                       <Users size={14}/> Fusionner (Merge)
                    </button>
                  )}
               </div>
            </div>
            <button onClick={() => setSelectedClients([])} className="bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all">Tout désélectionner</button>
          </div>
        )}"""

text = text.replace(old_badge, new_badge)

with open(path, 'w') as f:
    f.write(text)

