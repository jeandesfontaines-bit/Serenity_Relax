"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Service } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2, MessageCircle, MapPin, ShieldCheck, Clock } from 'lucide-react';
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
      <Card className="border-none shadow-none rounded-[3rem] p-12 md:p-16 text-center bg-white">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-serif font-medium text-primary mb-4">Réservé.</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto leading-relaxed italic">
          Merci {formData.firstName}. Votre séance de <span className="font-bold text-primary">{selectedService?.name.split(' - ')[0]}</span> est enregistrée pour le {date ? format(date, 'd MMMM', { locale: fr }) : ''} à {time}.
        </p>
        
        <div className="bg-muted/30 p-6 rounded-[2rem] mb-8 border border-black/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Étape Finale Importante</p>
          <p className="text-xs text-muted-foreground mb-6">Après votre réservation en ligne, pensez à confirmer votre rendez-vous via WhatsApp pour garantir votre créneau.</p>
          <button className="high-end-button bg-emerald-600 border-emerald-600 text-white w-full py-3 text-[12px]">
            <a href="https://wa.me/41783336823" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <MessageCircle size={18} /> CONFIRMER WHATSAPP
            </a>
          </button>
        </div>

        <button className="high-end-button w-full border-neutral-200 py-3 text-[12px]">
          <a href="/">RETOUR AU SANCTUAIRE</a>
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-12 max-w-xs mx-auto pt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 w-10 md:w-14 rounded-full transition-all duration-700 ${step >= i ? 'bg-primary' : 'bg-primary/10'}`} />
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
            className="p-6 md:p-10"
          >
            <div className="space-y-8">
              <header className="space-y-2 text-center">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">Étape 01</span>
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-primary tracking-tight">Choisissez votre rituel.</h2>
                <p className="text-muted-foreground text-sm italic max-w-md mx-auto">Sélectionnez le soin souhaité pour passer à la planification.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s);
                      setStep(2);
                    }}
                    className="group text-left p-6 rounded-[2rem] border-2 border-black/5 bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500 flex flex-col justify-between min-h-[140px]"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-serif font-bold text-lg text-primary leading-tight">{s.name.split(' - ')[0]}</h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{s.duration}</p>
                      </div>
                      <span className="font-serif font-bold text-xl text-primary">CHF {s.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all">
                      Réserver ce soin <ChevronRight size={12} strokeWidth={3} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
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
            <Card className="border-none shadow-none rounded-[2.5rem] p-8 md:p-10 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h2 className="text-xl font-serif font-medium text-primary flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-primary/20" /> La Date
                  </h2>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={fr}
                    className="rounded-[1.5rem] border border-black/5 shadow-sm p-4 bg-muted/20 mx-auto"
                    disabled={(d) => d < new Date()}
                  />
                </div>
                <div className="space-y-6">
                  <h2 className="text-xl font-serif font-medium text-primary flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary/20" /> L'Horaire
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {times.map((t) => (
                      <Button
                        key={t}
                        variant={time === t ? 'default' : 'outline'}
                        onClick={() => setTime(t)}
                        className={`h-12 rounded-xl text-base font-medium border-black/5 transition-all ${time === t ? 'bg-primary text-white shadow-lg' : 'bg-background hover:bg-white hover:shadow-md'}`}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-12 gap-4">
                <button onClick={() => setStep(1)} className="high-end-button border-neutral-200 py-3 px-6 text-[12px]">
                  <ChevronLeft className="mr-2 h-5 w-5" /> Retour
                </button>
                <button disabled={!date || !time} onClick={() => setStep(3)} className="high-end-button py-3 px-6 text-[12px]">
                  Détails <ChevronRight className="ml-2 h-5 w-5" />
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
            className="p-6 md:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-2 border-none shadow-none rounded-[2rem] p-8 bg-white">
                <h2 className="text-xl font-serif font-medium text-primary mb-8 flex items-center gap-3">
                  <User className="h-5 w-5 text-primary/20" /> Vos Coordonnées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mb-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Prénom</Label>
                    <Input id="firstName" name="firstName" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Nom</Label>
                    <Input id="lastName" name="lastName" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Téléphone</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Date de Naissance</Label>
                    <Input id="dob" name="dob" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Code Postal</Label>
                    <Input id="postalCode" name="postalCode" placeholder="1216" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Ville</Label>
                    <Input id="city" name="city" placeholder="Genève" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Adresse</Label>
                    <Input id="address" name="address" placeholder="Rue et N°" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4 text-sm focus:bg-white shadow-inner transition-all" />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <button onClick={() => setStep(2)} className="high-end-button border-neutral-200 py-3 px-6 text-[12px]">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Retour
                  </button>
                  <button 
                    className="high-end-button min-w-[160px] py-3 text-[12px]"
                    disabled={isSubmitting}
                    onClick={completeBooking}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'CONFIRMER'}
                  </button>
                </div>
              </Card>

              <aside className="space-y-4">
                <Card className="rounded-[1.5rem] border-none shadow-sm bg-white p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <MapPin size={12} className="text-primary/40" /> Lieu
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Chemin de Joinville 26, Alpha Business Center, 4ème étage – 1216 Cointrin (Genève)
                  </p>
                </Card>

                <Card className="rounded-[1.5rem] border-none shadow-sm bg-slate-950 text-white p-6">
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3 flex items-center gap-2">
                    <MessageCircle size={12} className="text-emerald-500" /> WHATSAPP
                  </h3>
                  <p className="text-[10px] leading-relaxed italic text-white/70">
                    Confirmez votre créneau par message après réservation.
                  </p>
                </Card>

                <Card className="rounded-[1.5rem] border-none shadow-sm bg-white p-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-primary/40" /> Conditions
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    Annulation possible jusqu'à 24h avant le rendez-vous.
                  </p>
                </Card>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}