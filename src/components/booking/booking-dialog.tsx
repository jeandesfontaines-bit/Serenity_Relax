
'use client';

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { BookingFlow } from './booking-flow';
import { SERVICES } from '@/lib/types';
import { ReactNode } from 'react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

export function BookingDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 rounded-[3rem] border-none bg-background scrollbar-hide">
        <VisuallyHidden.Root>
          <DialogTitle>Réserver un soin Serenity Relax</DialogTitle>
        </VisuallyHidden.Root>
        <div className="p-1">
          <BookingFlow services={SERVICES} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
