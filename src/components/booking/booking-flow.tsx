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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recommendMassageService } from '@/ai/flows/ai-service-recommender';
import { Sparkles, CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2, Brain, MessageCircle, MapPin, ShieldCheck } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously } from 'firebase/auth';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    if (serviceId) {
      const found = services.find(s => s.id === serviceId);
      if (found) setSelectedService(found);
    }
  }, [searchParams, services]);

  const handleAiRecommend = async () => {
    if (!aiQuery) return;
    setAiLoading(true);
    try {
      const result = await recommendMassageService({
        clientDescription: aiQuery,
        serviceCatalog: services.map(s => ({
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: `CHF ${s.price}`
        }))
      });
      
      const found = services.find(s => s.name === result.recommendedServiceName);
      if (found) {
        setSelectedService(found);
        toast({ title: "Recommandation IA", description: `Le soin "${found.name.split(' - ')[0]}" semble idéal pour vous.` });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: 'Impossible de joindre le conseiller.' });
    } finally {
      setAiLoading(false);
    }
  };

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
          <Button asChild className="high-end-button bg-emerald-600 hover:bg-emerald-700 text-white px-10 gap-2">
            <a href="https://wa.me/41790000000" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> Confirmer via WhatsApp
            </a>
          </Button>
        </div>

        <Button asChild variant="ghost" className="high-end-button text-muted-foreground px-12">
          <a href="/">Retour au sanctuaire</a>
        </Button>
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

      {step === 1 && (
        <Card className="border-none shadow-none rounded-[2.5rem] overflow-hidden bg-white">
          <Tabs defaultValue="browse" className="w-full">
            <div className="px-8 pt-8 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 border rounded-full p-1 h-14">
                <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-[0.2em] h-full transition-all">Menu des Soins</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-full flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-[0.2em] h-full transition-all">
                  <Brain className="h-3.5 w-3.5" /> Consultation IA
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-8 pb-4">
              <TabsContent value="browse" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground ml-2">Sélectionner votre rituel</Label>
                  <Select 
                    value={selectedService?.id} 
                    onValueChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                  >
                    <SelectTrigger className="w-full h-16 rounded-2xl text-base px-6 border-black/5 bg-background focus:ring-primary shadow-sm hover:shadow-md transition-all">
                      <SelectValue placeholder="Parcourir nos soins" />
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
              </TabsContent>

              <TabsContent value="ai" className="space-y-6 mt-0">
                <div className="p-8 rounded-[2rem] bg-muted/30 border border-black/5">
                  <h3 className="text-xl font-serif font-medium text-primary mb-4 flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary/40" /> Intuition Digitale
                  </h3>
                  <Textarea 
                    id="ai-query"
                    name="ai-query"
                    placeholder="Décrivez votre état physique ou émotionnel..."
                    className="min-h-[140px] rounded-[1.5rem] border-black/5 bg-white text-base shadow-sm italic p-6 resize-none focus:ring-primary"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <Button 
                    onClick={handleAiRecommend} 
                    disabled={aiLoading || !aiQuery}
                    className="mt-6 w-full h-14 rounded-full bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black shadow-lg transition-all"
                  >
                    {aiLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Trouver le soin idéal
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>

          <div className="px-8 pb-8 flex justify-end">
            <Button 
              disabled={!selectedService} 
              onClick={() => setStep(2)}
              className="high-end-button bg-primary text-white px-10"
            >
              Suivant <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-none rounded-[2.5rem] p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-medium text-primary flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-primary/20" /> La Date
              </h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={fr}
                className="rounded-[2rem] border border-black/5 shadow-sm p-6 bg-muted/20 mx-auto scale-90 md:scale-100"
                disabled={(d) => d < new Date()}
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-medium text-primary flex items-center gap-3">
                <ChevronRight className="h-5 w-5 text-primary/20" /> L'Horaire
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {times.map((t) => (
                  <Button
                    key={t}
                    variant={time === t ? 'default' : 'outline'}
                    onClick={() => setTime(t)}
                    className={`h-16 rounded-xl text-lg font-medium border-black/5 transition-all ${time === t ? 'bg-primary text-white shadow-lg' : 'bg-background hover:bg-white hover:shadow-md'}`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-12">
            <Button variant="ghost" onClick={() => setStep(1)} className="high-end-button text-muted-foreground border border-black/5 px-8">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(3)} className="high-end-button bg-primary text-white px-10">
              Détails <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-2 border-none shadow-none rounded-[2.5rem] p-8 md:p-12 bg-white">
            <h2 className="text-2xl font-serif font-medium text-primary mb-10 flex items-center gap-3">
              <User className="h-6 w-6 text-primary/20" /> Vos Coordonnées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mb-12">
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Prénom</Label>
                <Input id="firstName" name="firstName" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Nom</Label>
                <Input id="lastName" name="lastName" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Téléphone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Date de Naissance</Label>
                <Input id="dob" name="dob" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Code Postal</Label>
                <Input id="postalCode" name="postalCode" placeholder="1216" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Adresse</Label>
                <Input id="address" name="address" placeholder="Rue et N°, Ville" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-14 bg-muted/20 border-none px-5 text-base focus:bg-white shadow-inner transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2.5">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground ml-2">Message pour João</Label>
                <Textarea id="message" name="message" placeholder="Message ou motif de consultation..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-2xl bg-muted/20 border-none p-6 text-base h-32 focus:bg-white shadow-inner transition-all resize-none italic" />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(2)} className="high-end-button text-muted-foreground border border-black/5 px-8">
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
              <Button 
                className="high-end-button bg-primary text-white shadow-lg px-12 h-16 text-xs tracking-[0.2em]"
                disabled={isSubmitting}
                onClick={completeBooking}
              >
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'CONFIRMER'}
              </Button>
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
      )}
    </div>
  );
}
