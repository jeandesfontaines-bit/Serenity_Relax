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
import { Sparkles, CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2, Brain } from 'lucide-react';
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
      <Card className="border-none shadow-none rounded-[3rem] p-12 md:p-20 text-center bg-white">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-8" />
        <h2 className="text-3xl font-serif font-medium text-primary mb-4">Confirmé.</h2>
        <p className="text-muted-foreground font-serif italic text-base mb-8 max-w-sm mx-auto">
          Merci {formData.firstName}. Votre séance de <strong>{selectedService?.name.split(' - ')[0]}</strong> est validée pour le {date ? format(date, 'd MMMM', { locale: fr }) : ''} à {time}.
        </p>
        <Button asChild className="high-end-button bg-primary text-white">
          <a href="/">Retour au sanctuaire</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-12 max-w-xs mx-auto mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 w-12 md:w-16 rounded-full transition-all duration-700 ${step >= i ? 'bg-primary' : 'bg-black/5'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-none rounded-[3rem] overflow-hidden bg-white">
          <Tabs defaultValue="browse" className="w-full">
            <div className="px-8 pt-8 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-background border rounded-full p-1 h-12">
                <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-md font-bold uppercase text-[8px] tracking-widest h-full">Menu Classique</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-full flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold uppercase text-[8px] tracking-widest h-full">
                  <Brain className="h-3 w-3" /> Consultation IA
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-8">
              <TabsContent value="browse" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[8px] uppercase tracking-[0.3em] font-black text-muted-foreground ml-3">Sélectionner votre rituel</Label>
                  <Select 
                    value={selectedService?.id} 
                    onValueChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                  >
                    <SelectTrigger className="w-full h-14 rounded-2xl text-base px-6 border-black/5 bg-background focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Parcourir nos soins" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-1">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="rounded-xl py-4 px-4 focus:bg-background cursor-pointer">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-serif font-bold text-base">{s.name.split(' - ')[0]}</span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{s.duration} • CHF {s.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-background border border-black/5">
                  <h3 className="text-xl font-serif font-medium text-primary mb-4 flex items-center gap-3">
                    <Brain className="h-5 w-5 text-primary/40" /> Intuition Digitale
                  </h3>
                  <Textarea 
                    id="ai-query"
                    name="ai-query"
                    placeholder="Décrivez votre état physique ou émotionnel..."
                    className="min-h-[120px] rounded-[1.5rem] border-black/5 bg-white text-base shadow-sm font-serif italic p-6"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <Button 
                    onClick={handleAiRecommend} 
                    disabled={aiLoading || !aiQuery}
                    className="mt-6 w-full high-end-button bg-primary text-white"
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
              className="high-end-button bg-primary text-white"
            >
              Suivant <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-none rounded-[3rem] p-8 bg-white">
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
                className="rounded-[2rem] border border-black/5 shadow-sm p-6 bg-background mx-auto scale-90 md:scale-100"
                disabled={(d) => d < new Date() || d.getDay() === 0}
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
                    className={`h-14 rounded-xl text-lg font-medium border-black/5 ${time === t ? 'bg-primary text-white' : 'bg-background hover:bg-white hover:shadow-md transition-all'}`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-12">
            <Button variant="ghost" onClick={() => setStep(1)} className="high-end-button text-muted-foreground border border-black/5">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(3)} className="high-end-button bg-primary text-white">
              Détails <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none shadow-none rounded-[3rem] p-8 md:p-12 bg-white">
          <h2 className="text-2xl font-serif font-medium text-primary mb-8 flex items-center gap-3">
            <User className="h-6 w-6 text-primary/20" /> Vos Coordonnées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Prénom</Label>
              <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Nom</Label>
              <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Email</Label>
              <Input id="email" name="email" autoComplete="email" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Téléphone</Label>
              <Input id="phone" name="phone" autoComplete="tel" type="tel" placeholder="Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Date de Naissance</Label>
              <Input id="dob" name="dob" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Code Postal</Label>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" placeholder="1216" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Adresse</Label>
              <Input id="address" name="address" autoComplete="street-address" placeholder="Rue et N°" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-12 bg-background border-none px-5" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[8px] uppercase tracking-widest font-black text-muted-foreground ml-2">Message pour João</Label>
              <Textarea id="message" name="message" placeholder="Message ou motif de consultation..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-2xl bg-background border-none font-serif italic p-5 h-24" />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(2)} className="high-end-button text-muted-foreground border border-black/5">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button 
              className="high-end-button bg-primary text-white shadow-lg h-14 px-10"
              disabled={isSubmitting}
              onClick={completeBooking}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Réserver'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}