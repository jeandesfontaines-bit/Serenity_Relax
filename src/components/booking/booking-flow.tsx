"use client";

import { useState, useEffect } from 'react';
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
import { Sparkles, CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signInAnonymously } from 'firebase/auth';

export function BookingFlow({ services }: { services: Service[] }) {
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
    promoCode: '',
    message: ''
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDate(new Date());
  }, []);

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
        toast({
          title: "AI Recommendation",
          description: `Recommended: ${found.name}`,
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not fetch recommendation.' });
    } finally {
      setAiLoading(false);
    }
  };

  const times = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];

  const completeBooking = async () => {
    if (!firestore || !selectedService || !date || !time) return;
    setIsSubmitting(true);

    try {
      // Ensure we have an authenticated user context (Anonymous if not logged in)
      let finalUserId = user?.uid;
      if (!finalUserId) {
        const cred = await signInAnonymously(auth);
        finalUserId = cred.user.uid;
      }

      const appointmentId = `apt_${Date.now()}`;
      
      // Calculate Appointment Times
      const startTimeStr = `${format(date, 'yyyy-MM-dd')}T${time}:00`;
      const duration = parseInt(selectedService.duration.split(' ')[0]);
      const endTime = addMinutes(new Date(startTimeStr), duration);

      // 1. Create Appointment
      const appointmentData = {
        id: appointmentId,
        clientId: finalUserId,
        serviceId: selectedService.id,
        startTime: startTimeStr,
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss"),
        status: 'Booked',
        clientMessage: formData.message,
        isLoyaltyFreeSession: false,
        isConfirmed: false,
        createdAt: serverTimestamp()
      };
      setDocumentNonBlocking(doc(firestore, 'appointments', appointmentId), appointmentData);

      // 2. Create/Update Client Profile
      const clientData = {
        id: finalUserId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        addressStreet: formData.address,
        addressCity: 'Geneva',
        addressCountry: 'Switzerland',
        loyaltySessionsCompleted: 0,
        isNextSessionFree: false,
        updatedAt: serverTimestamp()
      };
      setDocumentNonBlocking(doc(firestore, 'clients', finalUserId), clientData, { merge: true });

      // 3. Create Swiss-Compliant Invoice
      const invoiceId = `INV-${Date.now()}`;
      const invoiceData = {
        id: invoiceId,
        appointmentId: appointmentId,
        clientId: finalUserId,
        invoiceNumber: invoiceId,
        issueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        totalAmount: selectedService.price,
        status: 'Pending',
        therapistRccNumberSnapshot: 'X1234.56',
        clinicNameSnapshot: 'SERENITY RELAX',
        clinicAddressSnapshot: 'Chemin de Joinville 26, 1216 Cointrin',
        clientNameSnapshot: `${formData.firstName} ${formData.lastName}`,
        clientAddressSnapshot: formData.address,
        serviceNameSnapshot: selectedService.name,
        serviceDurationMinutesSnapshot: duration,
        servicePriceSnapshot: selectedService.price,
        isLoyaltyFreeSessionApplied: false
      };
      setDocumentNonBlocking(doc(firestore, 'invoices', invoiceId), invoiceData, { merge: true });

      toast({
        title: "Booking Successful!",
        description: "Session confirmed for " + format(date, 'PPP') + " at " + time,
      });
      setStep(4);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'An unexpected error occurred during confirmation.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <Card className="border-none shadow-none rounded-[3rem] p-12 text-center bg-white">
        <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
        <h2 className="text-4xl font-headline font-bold text-primary mb-4">Confirmed!</h2>
        <p className="text-muted-foreground mb-8">
          Thank you, {formData.firstName}. Your session for <strong>{selectedService?.name}</strong> on {date ? format(date, 'PPP') : ''} at {time} is confirmed.
          <br /><br />
          Check your email for access to your personal portal.
        </p>
        <Button asChild className="rounded-full px-8 bg-primary text-white">
          <a href="/">Return Home</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4 max-w-xs mx-auto mb-8 pt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 w-16 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-none rounded-[3rem] overflow-hidden bg-white">
          <Tabs defaultValue="browse" className="w-full">
            <div className="px-8 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 border rounded-full p-1">
                <TabsTrigger value="browse" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Classic Menu</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-full flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Sparkles className="h-3 w-3 text-secondary" /> AI Consultant
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-8">
              <TabsContent value="browse" className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="service-select" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Select Your Treatment</Label>
                  <Select 
                    value={selectedService?.id} 
                    onValueChange={(id) => {
                      const s = services.find(srv => srv.id === id);
                      if (s) setSelectedService(s);
                    }}
                  >
                    <SelectTrigger id="service-select" className="w-full h-16 rounded-2xl text-base px-6 border-muted bg-background focus:ring-primary shadow-sm">
                      <SelectValue placeholder="Browse our therapeutic menu" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-[300px]">
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="py-4 focus:bg-primary/5 cursor-pointer">
                          <div className="flex flex-col gap-1">
                            <span className="font-headline font-bold text-lg">{s.name.split(' - ')[0]}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.duration} • CHF {s.price}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedService && (
                  <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-headline font-bold text-primary mb-2">{selectedService.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">"{selectedService.description}"</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai">
                <div className="space-y-6">
                  <div className="p-8 rounded-3xl bg-secondary/5 border border-secondary/20">
                    <h3 className="text-lg font-headline font-bold text-primary mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-secondary" /> Personalized Match
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Describe your state (e.g., muscle tension, stress, recovery) for a tailored recommendation.</p>
                    <Textarea 
                      placeholder="e.g. I have severe neck tension from office work and need deep relaxation."
                      className="min-h-[120px] rounded-2xl border-muted bg-white text-base shadow-sm"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <Button 
                      onClick={handleAiRecommend} 
                      disabled={aiLoading || !aiQuery}
                      className="mt-6 w-full rounded-full bg-primary text-white hover:bg-primary/90 font-bold h-12"
                    >
                      {aiLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Find My Perfect Session
                    </Button>
                  </div>
                  {selectedService && (
                    <div className="p-6 rounded-3xl border border-primary bg-primary/5 animate-in fade-in slide-in-from-top-4">
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">AI-Recommended Choice:</p>
                       <h4 className="text-xl font-headline font-bold">{selectedService.name}</h4>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>

          <div className="p-8 pt-0 flex justify-end">
            <Button 
              disabled={!selectedService} 
              onClick={() => setStep(2)}
              className="rounded-full px-10 py-6 text-xs uppercase tracking-widest font-bold"
            >
              Next: Schedule <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-none rounded-[3rem] p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" /> Date Selection
              </h2>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-3xl border border-muted shadow-sm p-4 bg-white"
                  disabled={(d) => d < new Date() || d.getDay() === 0}
                />
              </div>
            </div>
            <div className="space-y-6">
               <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
                <ChevronRight className="h-6 w-6" /> Available Times
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {times.map((t) => (
                  <Button
                    key={t}
                    variant={time === t ? 'default' : 'outline'}
                    onClick={() => setTime(t)}
                    className={`rounded-2xl py-6 text-lg border-muted ${time === t ? 'bg-primary text-white' : 'hover:border-primary/40'}`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-12">
            <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full text-xs uppercase tracking-widest font-bold">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(3)} className="rounded-full px-10 text-xs uppercase tracking-widest font-bold">
              Personal Details <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none shadow-none rounded-[3rem] p-12 bg-white">
          <h2 className="text-2xl font-headline font-bold text-primary mb-8 flex items-center gap-2">
            <User className="h-7 w-7" /> Client Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">First Name</Label>
              <Input placeholder="Jean" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl h-12 border-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Last Name</Label>
              <Input placeholder="Dupont" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl h-12 border-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Email</Label>
              <Input type="email" placeholder="jean.dupont@email.ch" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl h-12 border-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Phone</Label>
              <Input placeholder="+41 79 123 45 67" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl h-12 border-muted" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Address</Label>
              <Input placeholder="Rue de Lausanne 12, Geneva" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl h-12 border-muted" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-2">Notes for Praticien (Optional)</Label>
              <Textarea placeholder="Specific areas of tension or preferences..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-xl border-muted" />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full text-xs uppercase tracking-widest font-bold">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              className="rounded-full px-12 py-7 text-xs uppercase tracking-widest font-bold shadow-xl bg-primary text-white"
              disabled={!formData.firstName || !formData.lastName || !formData.email || isSubmitting}
              onClick={completeBooking}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Confirm Reservation'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}