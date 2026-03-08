import { BookingFlow } from '@/components/booking/booking-flow';
import { SERVICES } from '@/lib/types';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F2] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-headline font-bold text-primary mb-4 italic">Your Sanctuary Awaits</h1>
          <p className="text-muted-foreground text-lg">Secure your moment of professional rejuvenation.</p>
        </header>

        <BookingFlow services={SERVICES} />
      </div>
    </div>
  );
}