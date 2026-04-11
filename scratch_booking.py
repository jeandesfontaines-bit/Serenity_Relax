import sys

path = '/Users/jean/Downloads/project/src/components/booking/booking-flow.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Remove conditions from Step 3 and fix the next button
step3_conditions_block = """                  <div className="bg-[#FAF9F6] p-6 sm:p-8 rounded-3xl">
                     <div className="space-y-4 text-[0.8rem] leading-relaxed text-neutral-500 font-sans mb-6">
                      <p className="font-bold text-neutral-900">Conditions de la séance</p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Prestations dédiées au bien-être, non thérapeutiques ou médicales.</li>
                        <li>Aucune contre-indication stricte au massage (en cas de doute, avis médical requis).</li>
                        <li>Annulation minimum 24h à l'avance.</li>
                      </ul>
                    </div>
                    <div className="flex items-start space-x-4 border-t border-neutral-200 pt-6">
                      <Checkbox id="terms" checked={acceptedConditions} onCheckedChange={(checked: any) => setAcceptedConditions(checked === true)} className="mt-1" />
                      <Label htmlFor="terms" className="text-[0.85rem] font-sans font-medium text-neutral-900 cursor-pointer leading-snug">
                        J'accepte les conditions et je confirme ne pas avoir de problème de santé contre-indiquant cette séance.
                      </Label>
                    </div>
                  </div>

                  <button 
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !acceptedConditions} """

step3_new = """                  <button 
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone} """
                    
text = text.replace(step3_conditions_block, step3_new)


# 2. Add reduced / compact conditions to Step 4
step4_old = """                <div className="text-left bg-[#FAF9F6] p-8 rounded-3xl space-y-8">
                  <div className="space-y-3">
                    <p className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-[0.2em]">RITUEL CONFIRMÉ</p>
                    <p className="text-[1.2rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{selectedService?.name.split(' - ')[0]}</p>
                    <p className="text-[1rem] font-sans font-medium text-neutral-600">
                      {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : ''} à {selectedTime}
                    </p>
                  </div>
                  <div className="border-t border-neutral-200/60 pt-8 space-y-3">
                    <p className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-[0.2em]">RÉSERVÉ POUR</p>
                    <p className="text-[1.2rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{formData.firstName} {formData.lastName}</p>
                    <p className="text-[1rem] font-sans font-medium text-neutral-600">{formData.email} • {formData.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={completeBooking} 
                    disabled={isSubmitting} """

step4_new = """                <div className="text-left bg-[#FAF9F6] p-6 lg:p-8 rounded-3xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <p className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-[0.2em]">RITUEL CONFIRMÉ</p>
                      <p className="text-[1.1rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{selectedService?.name.split(' - ')[0]}</p>
                      <p className="text-[0.9rem] font-sans font-medium text-neutral-600">
                        {selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: fr }) : ''} à {selectedTime}
                      </p>
                    </div>
                    <div className="space-y-2 flex-1 sm:border-l sm:border-neutral-200/60 sm:pl-6">
                      <p className="text-[0.65rem] font-black text-neutral-400 uppercase tracking-[0.2em]">RÉSERVÉ POUR</p>
                      <p className="text-[1.1rem] leading-snug font-serif font-bold tracking-tight text-neutral-900">{formData.firstName} {formData.lastName}</p>
                      <p className="text-[0.9rem] font-sans text-neutral-500">{formData.phone}</p>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/60 pt-5 mt-5">
                     <p className="text-[0.75rem] font-bold text-neutral-900 mb-2">Conditions de la séance</p>
                     <ul className="list-disc pl-4 space-y-1 text-[0.7rem] leading-relaxed text-neutral-500 font-sans mb-4">
                        <li>Prestations dédiées au bien-être, non thérapeutiques ou médicales.</li>
                        <li>Aucune contre-indication au massage (en cas de doute, avis médical requis).</li>
                        <li>Annulation minimum 24h à l'avance.</li>
                     </ul>
                     <div className="flex items-start space-x-3 bg-white p-3 sm:p-4 rounded-xl border border-neutral-100">
                      <Checkbox id="terms" checked={acceptedConditions} onCheckedChange={(checked: any) => setAcceptedConditions(checked === true)} className="mt-0.5" />
                      <Label htmlFor="terms" className="text-[0.7rem] sm:text-[0.75rem] font-sans font-medium text-neutral-900 cursor-pointer leading-snug">
                        J'accepte les conditions et je confirme ne pas avoir de problème de santé contre-indiquant cette séance.
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={completeBooking} 
                    disabled={isSubmitting || !acceptedConditions} """

text = text.replace(step4_old, step4_new)

with open(path, 'w') as f:
    f.write(text)

