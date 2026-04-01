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
import { Sparkles, CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2, Brain, MapPin, Calendar as CalendarDays } from 'lucide-react';
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

  const times = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];

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
        clinicAddressSnapshot: 'Chemin de Joinville 26, 1216 Cointrin',
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
      <Card className="border-none shadow-none rounded-[4rem] p-24 text-center bg-white">
        <CheckCircle2 className="h-24 w-24 text-primary mx-auto mb-12" />
        <h2 className="text-5xl font-serif font-medium text-primary mb-6">Confirmé.</h2>
        <p className="text-muted-foreground font-serif italic text-lg mb-12 max-w-sm mx-auto">
          Merci {formData.firstName}. Votre séance de <strong>{selectedService?.name.split(' - ')[0]}</strong> est validée pour le {date ? format(date, 'd MMMM', { locale: fr }) : ''} à {time}.
        </p>
        <Button asChild className="high-end-button bg-primary text-white">
          <a href="/">Retour au sanctuaire</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center px-12 max-w-sm mx-auto mb-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 w-20 rounded-full transition-all duration-700 ${step >= i ? 'bg-primary' : 'bg-black/5'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-none rounded-[4rem] overflow-hidden bg-white">
          <Tabs defaultValue="browse" className="w-full">
            <div className="px-12 pt-12 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-background border rounded-full p-1.5 h-16">
                <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold uppercase text-[10px] tracking-widest h-full">Menu Classique</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-full flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-xl font-bold uppercase text-[10px] tracking-widest h-full">
                  <Brain className="h-4 w-4" /> Consultation IA
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-12">
              <TabsContent value="browse" className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground ml-4">Sélectionner votre rituel</Label>
                  <Select 
                    value={selectedService?.id} 
                    onValueChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                  >
                    <SelectTrigger className="w-full h-20 rounded-3xl text-lg px-8 border-black/5 bg-background focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Parcourir nos soins" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl p-2">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="rounded-2xl py-6 px-6 focus:bg-background cursor-pointer">
                          <div className="flex flex-col gap-1">
                            <span className="font-serif font-bold text-xl">{s.name.split(' - ')[0]}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.duration} • CHF {s.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-10">
                <div className="p-12 rounded-[3rem] bg-background border border-black/5">
                  <h3 className="text-2xl font-serif font-medium text-primary mb-6 flex items-center gap-4">
                    <Brain className="h-6 w-6 text-primary/40" /> Intuition Digitale
                  </h3>
                  <Textarea 
                    id="ai-query"
                    name="ai-query"
                    placeholder="Décrivez votre état physique ou émotionnel..."
                    className="min-h-[160px] rounded-[2rem] border-black/5 bg-white text-lg shadow-sm font-serif italic p-8"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <Button 
                    onClick={handleAiRecommend} 
                    disabled={aiLoading || !aiQuery}
                    className="mt-10 w-full high-end-button bg-primary text-white"
                  >
                    {aiLoading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Sparkles className="h-5 w-5 mr-3" />}
                    Trouver le soin idéal
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>

          <div className="px-12 pb-12 flex justify-end">
            <Button 
              disabled={!selectedService} 
              onClick={() => setStep(2)}
              className="high-end-button bg-primary text-white"
            >
              Étape suivante <ChevronRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-none rounded-[4rem] p-12 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-medium text-primary flex items-center gap-4">
                <CalendarIcon className="h-7 w-7 text-primary/20" /> La Date
              </h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={fr}
                className="rounded-[2.5rem] border border-black/5 shadow-sm p-8 bg-background mx-auto"
                disabled={(d) => d < new Date() || d.getDay() === 0}
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-medium text-primary flex items-center gap-4">
                <ChevronRight className="h-7 w-7 text-primary/20" /> L'Horaire
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {times.map((t) => (
                  <Button
                    key={t}
                    variant={time === t ? 'default' : 'outline'}
                    onClick={() => setTime(t)}
                    className={`h-16 rounded-2xl text-xl font-medium border-black/5 ${time === t ? 'bg-primary text-white' : 'bg-background hover:bg-white hover:shadow-md transition-all'}`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-20">
            <Button variant="ghost" onClick={() => setStep(1)} className="high-end-button text-muted-foreground border border-black/5">
              <ChevronLeft className="mr-3 h-5 w-5" /> Retour
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(3)} className="high-end-button bg-primary text-white">
              Coordonnées <ChevronRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none shadow-none rounded-[4rem] p-16 bg-white">
          <h2 className="text-4xl font-serif font-medium text-primary mb-12 flex items-center gap-4">
            <User className="h-8 w-8 text-primary/20" /> Coordonnées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Prénom</Label>
              <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Nom</Label>
              <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Email</Label>
              <Input id="email" name="email" autoComplete="email" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Téléphone</Label>
              <Input id="phone" name="phone" autoComplete="tel" type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Date de Naissance</Label>
              <Input id="dob" name="dob" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Adresse</Label>
              <Input id="address" name="address" autoComplete="street-address" placeholder="Rue et N°" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Code Postal</Label>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" placeholder="1216" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Ville</Label>
              <Input id="city" name="city" autoComplete="address-level2" placeholder="Cointrin" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="rounded-2xl h-16 bg-background border-none px-6" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-2">Message pour João</Label>
              <Textarea id="message" name="message" placeholder="Message ou motif de consultation..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-3xl bg-background border-none font-serif italic p-6 h-32" />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(2)} className="high-end-button text-muted-foreground border border-black/5">
              <ChevronLeft className="mr-3 h-5 w-5" /> Retour
            </Button>
            <Button 
              className="high-end-button bg-primary text-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] h-20 px-16"
              disabled={isSubmitting}
              onClick={completeBooking}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : 'Confirmer la Réservation'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}