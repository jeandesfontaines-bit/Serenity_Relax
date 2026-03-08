export type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dob?: string;
  insuranceName?: string;
  insuranceNumber?: string;
  consultationNotes?: string;
  loyaltySessions: number;
};

export type Appointment = {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  promoCode?: string;
  priceAtBooking: number;
};

export type Invoice = {
  id: string;
  appointmentId: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending';
  amount: number;
  rccNumber: string;
  clinicAddress: string;
};

export const SERVICES: Service[] = [
  { id: '1', name: 'Massage Signature - Séance ciblée approfondie 90 min', description: 'Une expérience immersive pour une détente totale.', duration: '90 min', price: 150 },
  { id: '2', name: 'Massage Sportif / Deep Tissue - Séance ciblée 60 min', description: 'Relâchement musculaire profond pour les sportifs.', duration: '60 min', price: 120 },
  { id: '3', name: 'Massage Thérapeutique - Séance ciblée 60 min (technique suédoise)', description: 'Approche classique pour soulager les tensions.', duration: '60 min', price: 110 },
  { id: '4', name: 'Massage Deep Relax - Relaxation Profonde 60 min', description: 'Un moment de déconnexion totale.', duration: '60 min', price: 100 },
  { id: '5', name: 'Massage Thaï aux Huiles Chaudes - Étirements & Pressions Profondes 60 min', description: 'Mélange de dynamisme et de chaleur.', duration: '60 min', price: 130 },
  { id: '6', name: 'Massage aux Bambous - Stimulation Musculaire Profonde 60 min', description: 'Technique drainante et relaxante.', duration: '60 min', price: 125 },
  { id: '7', name: 'Draineur Lymphatique - Séance ciblée 60 min', description: 'Amélioration de la circulation et détox.', duration: '60 min', price: 115 },
  { id: '8', name: 'Aromathérapie - Séance ciblée 60 min', description: 'Soing par les huiles essentielles.', duration: '60 min', price: 105 },
  { id: '9', name: 'Réflexologie Plantaire Séance ciblée - 30 min', description: 'Pression sur les zones réflexes du pied.', duration: '30 min', price: 70 },
];