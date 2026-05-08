'use client';

import { useMemo } from 'react';
import { useBooking } from '@/context/BookingContext';
import { LandingBookingModal } from '@/components/landing/LandingBookingModal';
import { SERVICES as LANDING_SERVICES } from '@/data';
import type { Service } from '@/lib/types';

export default function BookingFunnel() {
  const { isModalOpen, closeModal, selectedService } = useBooking();

  const services = useMemo<Service[]>(
    () =>
      LANDING_SERVICES.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.desc,
        duration: service.duration,
        price: service.price,
        image: service.image,
      })),
    [],
  );

  return (
    <LandingBookingModal
      initialServiceId={selectedService?.id}
      isOpen={isModalOpen}
      onClose={closeModal}
      services={services}
    />
  );
}
