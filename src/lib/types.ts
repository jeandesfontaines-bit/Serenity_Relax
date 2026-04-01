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
  { id: '1', name: 'Massage Thérapeutique & Relaxant - 60 min', description: 'Approche personnalisée pour relâcher les tensions et apaiser le mental.', duration: '60 min', price: 110 },
  { id: '2', name: 'Massage Thérapeutique & Relaxant - 90 min', description: 'Une immersion prolongée pour un rééquilibrage profond du corps.', duration: '90 min', price: 160 },
  { id: '3', name: 'Deep Relax Signature - 60 min', description: 'Le rituel exclusif pour une déconnexion sensorielle totale.', duration: '60 min', price: 120 },
  { id: '4', name: 'Massage Kalari Thérapeutique - 60 min', description: 'Technique ancestrale indienne pour stimuler les points vitaux.', duration: '60 min', price: 130 },
  { id: '5', name: 'Drainage Lymphatique & Détox - 60 min', description: 'Soin fluide pour améliorer la circulation et éliminer les toxines.', duration: '60 min', price: 115 },
  { id: '6', name: 'Deep Tissue – Récupération & Performance - 60 min', description: 'Massage profond ciblant les fascias et les muscles sollicités.', duration: '60 min', price: 125 },
  { id: '7', name: 'Massage Thaï aux Huiles Chaudes - 60 min', description: 'Alliance d\'étirements et de chaleur pour une vitalité retrouvée.', duration: '60 min', price: 130 },
  { id: '8', name: 'Aromathérapie - 60 min', description: 'Soin relaxant utilisant les bienfaits des huiles essentielles bio.', duration: '60 min', price: 110 },
  { id: '9', name: 'Massage à quatre mains - 60 min', description: 'Expérience immersive et profonde orchestrée par deux praticiens.', duration: '60 min', price: 220 },
];
