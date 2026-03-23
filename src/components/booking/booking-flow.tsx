
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
      <Card className="border-none shadow-none rounded-[3rem] p-12 text-center bg-white">
        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-4xl font-serif font-bold text-slate-950 mb-4">Confirmé !</h2>
        <p className="text-muted-foreground font-serif italic mb-8">
          Merci {formData.firstName}. Votre séance pour <strong>{selectedService?.name.split(' - ')[0]}</strong> le {date ? format(date, 'PPP') : ''} à {time} est validée.
        </p>
        <Button asChild className="rounded-full px-10 py-6 bg-slate-950 text-white font-bold uppercase tracking-widest">
          <a href="/">Retour à l'accueil</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center px-4 max-w-xs mx-auto mb-8 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 w-16 rounded-full transition-colors ${step >= i ? 'bg-slate-950' : 'bg-slate-100'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-none rounded-[3rem] overflow-hidden bg-white">
          <Tabs defaultValue="browse" className="w-full">
            <div className="px-8 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-slate-50 border rounded-full p-1">
                <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-white shadow-sm font-bold uppercase text-[9px] tracking-widest">Menu Classique</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-full flex items-center gap-2 data-[state=active]:bg-white shadow-sm font-bold uppercase text-[9px] tracking-widest">
                  <Brain className="h-3 w-3 text-emerald-500" /> Conseil IA
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-8">
              <TabsContent value="browse" className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400 ml-2">Choisir votre soin</Label>
                  <Select 
                    value={selectedService?.id} 
                    onValueChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                  >
                    <SelectTrigger className="w-full h-16 rounded-2xl text-base px-6 border-slate-100 bg-slate-50 focus:ring-slate-950">
                      <SelectValue placeholder="Parcourir nos rituels" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-serif font-bold text-lg">{s.name.split(' - ')[0]}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.duration} • CHF {s.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100">
                  <h3 className="text-lg font-serif font-bold text-indigo-950 mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-500" /> Consultation Intuitive
                  </h3>
                  <Textarea 
                    id="ai-query"
                    name="ai-query"
                    placeholder="ex: J'ai des tensions au cou..."
                    className="min-h-[120px] rounded-2xl border-indigo-200 bg-white text-base shadow-sm font-serif italic"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <Button 
                    onClick={handleAiRecommend} 
                    disabled={aiLoading || !aiQuery}
                    className="mt-6 w-full rounded-full bg-indigo-600 text-white font-bold h-12 uppercase text-[10px] tracking-widest"
                  >
                    {aiLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Trouver mon soin idéal
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>

          <div className="p-8 pt-0 flex justify-end">
            <Button 
              disabled={!selectedService} 
              onClick={() => setStep(2)}
              className="rounded-full px-12 py-7 text-[10px] uppercase tracking-[0.2em] font-black bg-slate-950"
            >
              Étape suivante <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-none rounded-[3rem] p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-slate-950 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-emerald-600" /> Date
              </h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-3xl border border-slate-100 shadow-sm p-4 bg-white mx-auto"
                disabled={(d) => d < new Date() || d.getDay() === 0}
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-slate-950 flex items-center gap-2">
                <ChevronRight className="h-6 w-6 text-emerald-600" /> Horaire
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {times.map((t) => (
                  <Button
                    key={t}
                    variant={time === t ? 'default' : 'outline'}
                    onClick={() => setTime(t)}
                    className={`rounded-2xl py-6 text-lg border-slate-100 ${time === t ? 'bg-slate-950 text-white' : 'hover:border-slate-300'}`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-12">
            <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full text-[10px] font-black uppercase tracking-widest">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(3)} className="rounded-full px-12 text-[10px] font-black uppercase tracking-widest bg-slate-950">
              Coordonnées <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none shadow-none rounded-[3rem] p-12 bg-white">
          <h2 className="text-2xl font-serif font-bold text-slate-950 mb-8 flex items-center gap-2">
            <User className="h-7 w-7 text-emerald-600" /> Vos Informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="Prénom" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Nom" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" autoComplete="email" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" autoComplete="tel" type="tel" placeholder="Téléphone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date de Naissance</Label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="dob" name="dob" type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none pl-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse (Rue et N°)</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="address" name="address" autoComplete="street-address" placeholder="Chemin de..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none pl-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code Postal</Label>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" placeholder="1216" value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" autoComplete="address-level2" placeholder="Cointrin" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Caisse Maladie (optionnel)</Label>
              <Input id="insurance" name="insurance" placeholder="Helsana, CSS..." value={formData.insurance} onChange={e => setFormData({...formData, insurance: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insuranceNumber">N° Assuré (optionnel)</Label>
              <Input id="insuranceNumber" name="insuranceNumber" placeholder="N° Assuré" value={formData.insuranceNumber} onChange={e => setFormData({...formData, insuranceNumber: e.target.value})} className="rounded-xl h-14 bg-slate-50 border-none" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message">Message pour João</Label>
              <Textarea id="message" name="message" placeholder="Message..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-xl bg-slate-50 border-none font-serif italic" />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full text-[10px] font-black uppercase tracking-widest">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button 
              className="rounded-full px-16 py-8 text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isSubmitting}
              onClick={completeBooking}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirmer la Réservation'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
