"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Service } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2, MessageCircle, MapPin, ShieldCheck, Clock, Info } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingFlowProps {
  services: Service[];
  initialServiceId?: string;
}

export function BookingFlow({ services, initialServiceId }: BookingFlowProps) {
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
    const sId = initialServiceId || searchParams.get('serviceId');
    if (sId) {
      const found = services.find(s => s.id === sId);
      if (found) {
        setSelectedService(found);
        setStep(2);
      }
    }
  }, [initialServiceId, searchParams, services]);

  const times = ['08:30', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'];

  const completeBooking = async () => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      let finalUserId = user?.uid;
      if (!finalUserId && auth) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      if (!finalUserId) throw new Error("Session non établie.");

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
        loyaltySessionsCompleted: 0,
        isNextSessionFree: false,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setStep(4);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <Card className="border-none shadow-none rounded-[3rem] p-12 text-center bg-white">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-serif font-medium text-primary mb-4">Réservé.</h2>
        <p className="text-muted-foreground text-sm mb-8 italic">Confirmation envoyée.</p>
        <button className="high-end-button bg-emerald-600 border-emerald-600 text-white w-full py-4 text-[10px] mb-4">
          <a href="https://wa.me/41783336823" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
            <MessageCircle size={18} /> CONFIRMER WHATSAPP
          </a>
        </button>
        <button onClick={() => window.location.reload()} className="high-end-button w-full border-neutral-200 py-4 text-[10px]">
          RETOUR
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center px-12 max-w-xs mx-auto pt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 w-10 rounded-full transition-all duration-700 ${step >= i ? 'bg-primary' : 'bg-primary/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 md:px-10">
            <div className="space-y-8">
              <header className="text-center">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-muted-foreground">Étape 01</span>
                <h2 className="text-3xl font-serif font-medium text-primary mt-2">Votre Rituel.</h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className="group text-left p-6 rounded-[2rem] border border-black/5 bg-white hover:border-primary/20 hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-serif font-bold text-base text-primary">{s.name.split(' - ')[0]}</h3>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-1">{s.duration}</p>
                      </div>
                      <span className="font-serif font-bold text-lg text-primary">CHF {s.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="p-6 md:p-10 bg-white rounded-[2.5rem]">
               <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-serif font-medium text-primary flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 opacity-20" /> La Date
                  </h2>
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    locale={fr} 
                    className="rounded-[1.5rem] border border-black/5 p-4 bg-muted/10" 
                    disabled={(d) => d < new Date()} 
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-serif font-medium text-primary flex items-center gap-3">
                    <Clock className="h-4 w-4 opacity-20" /> L'Horaire
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {times.map((t) => (
                      <Button 
                        key={t} 
                        variant={time === t ? 'default' : 'outline'} 
                        onClick={() => setTime(t)} 
                        className={`h-12 rounded-xl border-black/5 ${time === t ? 'bg-primary text-white' : 'bg-background hover:bg-neutral-50'}`}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-12 gap-4">
                <button onClick={() => setStep(1)} className="high-end-button border-neutral-200 py-3 px-8 text-[10px]">
                  RETOUR
                </button>
                <button disabled={!date || !time} onClick={() => setStep(3)} className="high-end-button py-3 px-8 text-[10px]">
                  DÉTAILS
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-8 bg-white p-8 rounded-[2rem]">
                <h2 className="text-xl font-serif font-medium text-primary flex items-center gap-3">
                  <User className="h-5 w-5 opacity-20" /> Coordonnées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  <Input placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  <Input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  <Input type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  <Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  <Input placeholder="Ville" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  <div className="md:col-span-2">
                    <Input placeholder="Adresse complète" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-11 bg-muted/20 border-none px-4" />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-black/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-2">
                    <Info size={14} className="opacity-30" /> Conditions & informations
                  </h3>
                  <div className="space-y-4 text-[11px] leading-relaxed text-muted-foreground italic font-sans">
                    <p>Les prestations proposées sont exclusivement dédiées au bien-être et à la relaxation. Elles ne remplacent en aucun cas un avis ou un traitement médical.</p>
                    <p>En réservant une séance, vous confirmez être en bonne condition physique et ne pas avoir de contre-indication au massage. En cas de doute, n’hésitez pas à demander l’avis de votre médecin.</p>
                    <p>Toute annulation ou modification doit être effectuée au minimum 24h à l’avance. En cas d’annulation tardive ou d’absence, la séance pourra être facturée.</p>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4 pt-6">
                  <button onClick={() => setStep(2)} className="high-end-button border-neutral-200 py-4 px-8 text-[10px]">
                    RETOUR
                  </button>
                  <button 
                    className="high-end-button min-w-[160px] py-4 text-[10px]" 
                    disabled={isSubmitting || !formData.firstName || !formData.email} 
                    onClick={completeBooking}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'CONFIRMER'}
                  </button>
                </div>
              </div>
              <aside className="space-y-4">
                <Card className="rounded-[1.5rem] border-none p-6 bg-white shadow-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">RÉSUMÉ</h3>
                  <div className="space-y-2 text-xs italic text-muted-foreground">
                    <p className="font-bold text-primary">{selectedService?.name.split(' - ')[0]}</p>
                    <p>{date ? format(date, 'd MMMM', { locale: fr }) : ''} à {time}</p>
                    <p className="font-bold text-primary mt-2">CHF {selectedService?.price}</p>
                  </div>
                </Card>
                <Card className="rounded-[1.5rem] border-none p-6 bg-neutral-900 text-white">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">IMPORTANT</h3>
                  <p className="text-[10px] italic opacity-70">Confirmez par WhatsApp après réservation pour valider votre créneau.</p>
                </Card>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
