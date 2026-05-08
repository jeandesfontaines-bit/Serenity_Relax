"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

interface BookingData {
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phonePrefix: string;
  phone: string;
  email: string;
  streetNum: string;
  streetName: string;
  city: string;
  canton: string;
  country: string;
  note: string;
}

interface BookingContextType {
  isModalOpen: boolean;
  openModal: (service: any) => void;
  closeModal: () => void;
  selectedService: any;
  step: number;
  setStep: (step: number) => void;
  bookingData: BookingData;
  updateBookingData: (name: string, value: string) => void;
  submitBooking: () => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

const defaultBookingData: BookingData = {
  date: "",
  time: "",
  firstName: "",
  lastName: "",
  phonePrefix: "CH",
  phone: "",
  email: "",
  streetNum: "",
  streetName: "",
  city: "",
  canton: "",
  country: "Suisse",
  note: "",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(defaultBookingData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setStep(1);
    setBookingData(defaultBookingData);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedService(null);
      setStep(1);
      setBookingData(defaultBookingData);
      setError(null);
    }, 300);
  };

  const updateBookingData = (name: string, value: string) => {
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const submitBooking = async () => {
    if (!selectedService || !bookingData.date || !bookingData.time) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { firestore } = initializeFirebase();
      await addDoc(collection(firestore, "appointments"), {
        serviceId: selectedService.id,
        serviceTitle: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.duration,
        date: bookingData.date,
        time: bookingData.time,
        client: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: `${bookingData.phonePrefix} ${bookingData.phone}`,
        },
        address: {
          streetNum: bookingData.streetNum,
          streetName: bookingData.streetName,
          city: bookingData.city,
          canton: bookingData.canton,
          country: bookingData.country,
        },
        note: bookingData.note,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setStep(4); // Success step
    } catch (err: any) {
      console.error("Error submitting booking:", err);
      setError("Une erreur s'est produite lors de la réservation. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        selectedService,
        step,
        setStep,
        bookingData,
        updateBookingData,
        submitBooking,
        isSubmitting,
        error,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
