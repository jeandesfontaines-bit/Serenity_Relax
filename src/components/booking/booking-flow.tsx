
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Service } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2, MessageCircle, MapPin, ShieldCheck } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

export function BookingFlow({ services }: { services: Service[] }) {
  const searchParams = useSearchParams();
  const { firestore } = useFirestore();
  const { user } = useUser();
  const auth = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    address: '', 
    city: '',
    postalCode: '',
    country: 'Suisse',
    dob: '',
    insurance: '', 
    insuranceNumber: '', 
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      const found = services.find(s => s.id === serviceId);
      if (found) setSelectedService(found);
    }
  }, [searchParams, services]);

  const times = ['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

  const validateConfirmation = () => {
    const missing = [];
    if (!selectedService) missing.push("Soin");
    if (!date) missing.push("Date");
    if (!time) missing.push("Horaire");
    if (!formData.firstName) missing.push("Prénom");
    if (!formData.lastName) missing.push("Nom");
    if (!formData.email) missing.push("Email");
    if (!formData.phone) missing.push("Téléphone");
    if (!formData.address) missing.push("Adresse");
    if (!formData.city) missing.push("Ville");
    if (!formData.postalCode) missing.push("Code Postal");
    if (!formData.dob) missing.push("Date de Naissance");
    
    return missing;
  };

  const completeBooking = async () => {
    const missing = validateConfirmation();
    if (missing.length > 0) {
      toast({ 
        variant: 'destructive', 
        title: 'Informations manquantes', 
        description: `Veuillez remplir : ${missing.join(", ")}.` 
      });
      return;
    }

    if (!firestore) return;

    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;
      
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      if (!finalUserId) {
        throw new Error("Impossible d'établir une session sécurisée.");
      }

      const appointmentId = `apt_${Date.now()}`;
      const startTimeStr = `${format(date!, 'yyyy-MM-dd')}T${time}:00`;
      const durationMatch = selectedService!.duration.match(/\d+/);
      const duration = durationMatch ? parseInt(durationMatch[0]) : 60;
      const endTime = addMinutes(new Date(startTimeStr), duration);

      setDocumentNonBlocking(doc(firestore, 'appointments', appointmentId), {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService!.id,
        serviceName: selectedService!.name,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'Booked',
        clientMessage: formData.message,
        isLoyaltyFreeSession: false,
        isConfirmed: false,
        createdAt: serverTimestamp()
      });

      setDocumentNonBlocking(doc(firestore, 'clients', finalUserId), {
        id: finalUserId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addressStreet: formData.address,
        addressCity: formData.city,
        addressPostalCode: formData.postalCode,
        addressCountry: formData.country,
        dateOfBirth: formData.dob,
        insuranceFundName: formData.insurance,
        insuranceNumber: formData.insuranceNumber,
        loyaltySessionsCompleted: 0,
        isNextSessionFree: false,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const invoiceId = `INV-${Date.now()}`;
      setDocumentNonBlocking(doc(firestore, 'invoices', invoiceId), {
        id: invoiceId,
        appointmentId: appointmentId,
        clientId: finalUserId,
        invoiceNumber: invoiceId,
        issueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        totalAmount: selectedService!.price,
        status: 'Pending',
        therapistRccNumberSnapshot: 'Z123456',
        clinicNameSnapshot: 'SERENITY RELAX',
        clinicAddressSnapshot: 'Chemin de Joinville 26, 4ème étage, 1216 Cointrin',
        clientNameSnapshot: `${formData.firstName} ${formData.lastName}`,
        clientAddressSnapshot: `${formData.address}, ${formData.postalCode} ${formData.city}`,
        serviceNameSnapshot: selectedService!.name,
        serviceDurationMinutesSnapshot: duration,
        servicePriceSnapshot: selectedService!.price,
        isLoyaltyFreeSessionApplied: false
      });

      setStep(4);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message || 'Une erreur est survenue lors de la confirmation.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <Card className="border-none shadow-none rounded-[3rem] p-12 md:p-20 text-center bg-white">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-8" />
        <h2 className="text-3xl font-serif font-medium text-primary mb-4">Réservé.</h2>
        <p className="text-muted-foreground text-base mb-8 max-w-sm mx-auto leading-relaxed italic">
          Merci {formData.firstName}. Votre séance de <span className="font-bold text-primary">{selectedService?.name.split(' - ')[0]}</span> est enregistrée pour le {date ? format(date, 'd MMMM', { locale: fr }) : ''} à {time}.
        </p>
        
        <div className="bg-muted/30 p-8 rounded-[2rem] mb-10 border border-black/5">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Étape Finale Importante</p>
          <p className="text-sm text-muted-foreground mb-6">Après votre réservation en ligne, pensez à confirmer votre rendez-vous via WhatsApp pour garantir votre créneau.</p>
          <button className="high-end-button bg-emerald-600 border-emerald-600 text-white w-full">
            <a href="https://wa.me/41783336823" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <MessageCircle size={22} /> CONFIRMER WHATSAPP
            </a>
          </button>
        </div>

        <button className="high-end-button w-full border-neutral-200">
          <a href="/">RETOUR AU SANCTUAIRE</a>
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center px-12 max-w-xs mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 w-12 md:w-16 rounded-full transition-all duration-700 ${step >= i ? 'bg-primary' : 'bg-primary/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-none rounded-[2.5rem] overflow-hidden bg-white p-12">
              <div className="space-y-10">
                <header className="space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Étape 01</span>
                  <h2 className="text-3xl font-serif font-medium text-primary">Choisissez votre rituel.</h2>
                  <p className="text-muted-foreground text-sm italic">Sélectionnez le soin qui répond à vos besoins du moment.</p>
                </header>

                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground ml-2">Nos prestations</Label>
                  <Select 
                    value={selectedService?.id} 
                    onValueChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                  >
                    <SelectTrigger className="w-full h-16 rounded-2xl text-base px-6 border-black/5 bg-background focus:ring-primary shadow-sm hover:shadow-md transition-all">
                      <SelectValue placeholder="Parcourir le menu des soins" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-1">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="rounded-xl py-4 px-4 focus:bg-background cursor-pointer">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-serif font-bold text-base">{s.name.split(' - ')[0]}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{s.duration} • CHF {s.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-8">
                  <button 
                    disabled={!selectedService} 
                    onClick={() => setStep(2)}
                    className="high-end-button"
                  >
                    Suivant <ChevronRight className="ml-2 h-6 w-6" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-none rounded-[2.5rem] p-12 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <h2 className="text-2xl font-serif font-medium text-primary flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary/20" /> La Date
                  </h2>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={fr}
                    className="rounded-[2rem] border border-black/5 shadow-sm p-6 bg-muted/20 mx-auto"
                    disabled={(d) => d < new Date()}
                  />
                </div>
                <div className="space-y-8">
                  <h2 className="text-2xl font-serif font-medium text-primary flex items-center gap-3">
                    <ChevronRight className="h-5 w-5 text-primary/20" /> L'Horaire
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {times.map((t) => (
                      <Button
                        key={t}
                        variant={time === t ? 'default' : 'outline'}
                        onClick={() => setTime(t)}
                        className={`h-14 rounded-xl text-lg font-medium border-black/5 transition-all ${time === t ? 'bg-primary text-white shadow-lg' : 'bg-background hover:bg-white hover:shadow-md'}`}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-16 gap-4">
                <button onClick={() => setStep(1)} className="high-end-button border-neutral-200">
                  <ChevronLeft className="mr-2 h-6 w-6" /> Retour
                </button>
                <button disabled={!date || !time} onClick={() => setStep(3)} className="high-end-button">
                  Détails <ChevronRight className="ml-2 h-6 w-6" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-2 border-none shadow-none rounded-[2.5rem] p-12 bg-white">
                <h2 className="text-2xl font-serif font-medium text-primary mb-12 flex items-center gap-3">
                  <User className="h-6 w-6 text-primary/20" /> Vos Coordonnées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10 mb-12">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Prénom</Label>
                    <Input id="firstName" name="firstName" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Nom</Label>
                    <Input id="lastName" name="lastName" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Téléphone</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Date de Naissance</Label>
                    <Input id="dob" name="dob" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Code Postal</Label>
                    <Input id="postalCode" name="postalCode" placeholder="1216" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Ville</Label>
                    <Input id="city" name="city" placeholder="Genève" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Adresse</Label>
                    <Input id="address" name="address" placeholder="Rue et N°" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-6 text-base focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Message pour João</Label>
                    <Textarea id="message" name="message" placeholder="Message ou motif de consultation..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-2xl bg-muted/20 border-none p-6 text-base h-32 focus:bg-white shadow-inner transition-all resize-none italic" />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <button onClick={() => setStep(2)} className="high-end-button border-neutral-200">
                    <ChevronLeft className="mr-2 h-6 w-6" /> Retour
                  </button>
                  <button 
                    className="high-end-button min-w-[200px]"
                    disabled={isSubmitting}
                    onClick={completeBooking}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : 'CONFIRMER'}
                  </button>
                </div>
              </Card>

              <aside className="space-y-6">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                    <MapPin size={14} className="text-primary/40" /> Informations Pratiques
                  </h3>
                  <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                    <div>
                      <p className="font-bold text-primary mb-1">Lieu</p>
                      <p>Chemin de Joinville 26, Alpha Business Center, 4ème étage – 1216 Cointrin (Genève)</p>
                    </div>
                    <div>
                      <p className="font-bold text-primary mb-1">Horaires</p>
                      <p>Lun - Ven : 8h00 – 20h00</p>
                      <p>Sam - Dim : 9h30 – 20h00</p>
                      <p className="italic mt-1">Uniquement sur rendez-vous.</p>
                    </div>
                    <p className="pt-2 border-t border-black/5">Séances à domicile possibles sur demande, selon disponibilité.</p>
                  </div>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-slate-950 text-white p-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                    <MessageCircle size={14} className="text-emerald-500" /> CONFIRMATION WHATSAPP
                  </h3>
                  <p className="text-xs leading-relaxed italic text-white/70">
                    Après votre réservation en ligne, pensez à confirmer votre rendez-vous via WhatsApp pour garantir votre créneau.
                  </p>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary/40" /> Conditions & Informations
                  </h3>
                  <ul className="space-y-3 text-[10px] text-muted-foreground leading-relaxed list-disc pl-4">
                    <li>Les prestations proposées sont exclusivement dédiées au bien-être et à la relaxation.</li>
                    <li>Elles ne remplacent en aucun cas un avis ou un traitement médical.</li>
                    <li>En réservant une séance, vous confirmez être en bonne condition physique.</li>
                    <li>Toute annulation ou modification doit être effectuée au minimum 24h à l'avance.</li>
                    <li>En cas d'annulation tardive ou d'absence, la séance pourra être facturée.</li>
                  </ul>
                </Card>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
