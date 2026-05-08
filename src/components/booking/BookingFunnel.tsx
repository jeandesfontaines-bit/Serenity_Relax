'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  image: string;
  desc?: string;
};

export default function BookingFunnel({ 
  service, 
  onClose 
}: { 
  service: Service; 
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    day: null as string | null,
    time: ""
  });

  const timeslots = ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
  const days = ["Lundi 7", "Mardi 8", "Mercredi 9", "Jeudi 10", "Vendredi 11", "Samedi 12"];

  const canProceedStep1 = !!formData.day && !!formData.time;
  const canProceedStep2 = formData.name.trim() && formData.email.trim() && formData.phone.trim();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, logic for saving to Firestore would go here
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep(3);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl overflow-hidden bg-white rounded-[32px] shadow-2xl border border-white/20"
      >
        {/* Header */}
        <div className="relative h-56 bg-gray-900">
          <Image 
            src={service.image} 
            alt={service.name}
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
          >
            <X size={20} />
          </button>
          
          <div className="absolute bottom-8 left-10 text-white space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Réservation en cours</span>
            <h2 className="text-4xl font-light tracking-tight">{service.name}</h2>
            <p className="text-sm font-medium opacity-90 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="opacity-60" /> {service.duration} • {service.price}€
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-50">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>

        <div className="p-10 min-h-[450px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2">
                    <Calendar size={14} className="text-black/20" /> 1. Choisir une date
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {days.map(day => (
                      <button
                        key={day}
                        onClick={() => setFormData({...formData, day})}
                        className={`py-4 px-2 text-sm rounded-2xl border transition-all duration-300 ${
                          formData.day === day 
                            ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-[1.02]" 
                            : "bg-white text-gray-700 border-gray-100 hover:border-black/20 hover:bg-gray-50"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2">
                    <Clock size={14} className="text-black/20" /> 2. Choisir l'horaire
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {timeslots.map(time => (
                      <button
                        key={time}
                        onClick={() => setFormData({...formData, time})}
                        className={`py-4 text-sm rounded-2xl border transition-all duration-300 ${
                          formData.time === time 
                            ? "bg-black text-white border-black shadow-lg shadow-black/10 scale-[1.02]" 
                            : "bg-white text-gray-700 border-gray-100 hover:border-black/20 hover:bg-gray-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    disabled={!canProceedStep1}
                    onClick={handleNext}
                    className="w-full py-5 bg-black text-white rounded-2xl font-medium disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-900 transition-all active:scale-[0.98] shadow-xl shadow-black/10"
                  >
                    Continuer la réservation
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-black transition-colors group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour au calendrier
                </button>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Nom Complet</label>
                    <input 
                      type="text"
                      placeholder="Jean Dupont"
                      autoFocus
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Email</label>
                      <input 
                        type="email"
                        placeholder="jean@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all placeholder:text-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Téléphone</label>
                      <input 
                        type="tel"
                        placeholder="+33 6 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-6 py-5 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    disabled={!canProceedStep2 || isSubmitting}
                    onClick={handleSubmit}
                    className="w-full py-5 bg-black text-white rounded-2xl font-medium disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-900 transition-all active:scale-[0.98] shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirmer le rendez-vous
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-[0.2em]">
                    Paiement sécurisé sur place
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 space-y-8"
              >
                <div className="flex justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="h-24 w-24 bg-black text-white rounded-full flex items-center justify-center shadow-2xl shadow-black/20"
                  >
                    <CheckCircle2 size={48} strokeWidth={1.5} />
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-light tracking-tight">C'est confirmé.</h3>
                  <p className="text-gray-500 max-w-[280px] mx-auto text-sm leading-relaxed">
                    Nous vous attendons le <span className="text-black font-semibold">{formData.day}</span> à <span className="text-black font-semibold">{formData.time}</span> pour votre séance de {service.name}.
                  </p>
                </div>
                <div className="pt-8">
                  <button
                    onClick={onClose}
                    className="w-full py-5 border border-gray-100 bg-white text-black rounded-2xl font-medium hover:bg-gray-50 transition-all active:scale-[0.98]"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
