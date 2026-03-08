"use client";

import { useState } from 'react';
import { Service, SERVICES } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { recommendMassageService } from '@/ai/flows/ai-service-recommender';
import { Sparkles, CheckCircle2, CalendarIcon, User, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export function BookingFlow({ services }: { services: Service[] }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
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

  const completeBooking = () => {
    toast({
      title: "Booking Successful!",
      description: "An email confirmation has been sent to your inbox.",
    });
    setStep(4);
  };

  if (step === 4) {
    return (
      <Card className="border-none shadow-2xl rounded-[3rem] p-12 text-center bg-white">
        <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
        <h2 className="text-4xl font-headline font-bold text-primary mb-4">Confirmed!</h2>
        <p className="text-muted-foreground mb-8">
          Thank you, {formData.firstName}. Your session for <strong>{selectedService?.name}</strong> on {date ? format(date, 'PPP') : ''} at {time} is confirmed.
          <br /><br />
          Check your email for your magic link to access your portal.
        </p>
        <Button asChild className="rounded-full px-8">
          <a href="/">Return Home</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex justify-between items-center px-4 max-w-xs mx-auto mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-2 w-16 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      {step === 1 && (
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
          <Tabs defaultValue="browse" className="w-full">
            <div className="bg-primary/5 p-8 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-background border rounded-full">
                <TabsTrigger value="browse" className="rounded-full">Browse Services</TabsTrigger>
                <TabsTrigger value="ai" className="rounded-full flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> AI Matchmaker
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-8">
              <TabsContent value="browse">
                <div className="grid grid-cols-1 gap-4">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className={`p-6 text-left rounded-3xl border-2 transition-all ${selectedService?.id === s.id ? 'border-primary bg-primary/5' : 'border-transparent bg-background hover:bg-muted'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-headline font-bold">{s.name}</h3>
                        <span className="font-bold text-primary">CHF {s.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{s.description}</p>
                      <span className="text-xs font-semibold uppercase tracking-widest text-secondary">{s.duration}</span>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ai">
                <div className="space-y-6">
                  <div className="p-8 rounded-3xl bg-secondary/10 border-2 border-secondary/20">
                    <h3 className="text-xl font-headline font-bold text-primary mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-secondary" /> How are you feeling?
                    </h3>
                    <Textarea 
                      placeholder="e.g. My lower back is extremely tight from sitting all day, and I've been feeling quite stressed lately. I need something deep but relaxing."
                      className="min-h-[120px] rounded-2xl border-none shadow-inner text-base"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <Button 
                      onClick={handleAiRecommend} 
                      disabled={aiLoading || !aiQuery}
                      className="mt-6 w-full rounded-full bg-secondary text-primary hover:bg-secondary/90 font-bold"
                    >
                      {aiLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Find My Perfect Match
                    </Button>
                  </div>
                  {selectedService && (
                    <div className="p-6 rounded-3xl border-2 border-primary bg-primary/5 animate-in fade-in slide-in-from-top-4">
                       <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Our AI Recommendation:</p>
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
              className="rounded-full px-10 py-6"
            >
              Select Schedule <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-none shadow-2xl rounded-[3rem] p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
                <CalendarIcon className="h-6 w-6" /> Pick Your Date
              </h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-3xl border shadow-sm p-4 w-fit bg-white"
                disabled={(date) => date < new Date() || date.getDay() === 0}
              />
            </div>
            <div className="space-y-6">
               <h2 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
                <ChevronRight className="h-6 w-6" /> Select Time
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {times.map((t) => (
                  <Button
                    key={t}
                    variant={time === t ? 'default' : 'outline'}
                    onClick={() => setTime(t)}
                    className="rounded-2xl py-6 text-lg"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-12">
            <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Services
            </Button>
            <Button disabled={!date || !time} onClick={() => setStep(3)} className="rounded-full px-10">
              Personal Details <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-none shadow-2xl rounded-[3rem] p-12 bg-white">
          <h2 className="text-3xl font-headline font-bold text-primary mb-8 flex items-center gap-2">
            <User className="h-7 w-7" /> Almost There
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="Jean" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Dupont" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="jean.dupont@email.ch" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+41 79 123 45 67" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="rounded-xl" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Full Address</Label>
              <Input placeholder="Chemin du Lac 15, 1202 Genève" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Promo Code (Optional)</Label>
              <Input placeholder="AURA10" value={formData.promoCode} onChange={e => setFormData({...formData, promoCode: e.target.value})} className="rounded-xl" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Message to Therapist</Label>
              <Textarea placeholder="Any specific areas of tension?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="rounded-xl" />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Time
            </Button>
            <Button 
              className="rounded-full px-12 py-7 text-lg shadow-xl"
              disabled={!formData.firstName || !formData.lastName || !formData.email}
              onClick={completeBooking}
            >
              Complete Booking
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}