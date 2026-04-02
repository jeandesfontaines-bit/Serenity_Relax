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

export const SERVICES: Service[] = [
  { id: '1', name: 'Massage aux Bambous - Stimulation Musculaire Profonde 60 min', description: 'Technique utilisant des bâtons de bambou pour travailler les tensions en profondeur.', duration: '60 min', price: 110 },
  { id: '2', name: 'Draineur Lymphatique - Séance ciblée 60 min', description: 'Soin fluide pour améliorer la circulation et éliminer les toxines.', duration: '60 min', price: 110 },
  { id: '3', name: 'Aromathérapie - Séance ciblée 60 min', description: 'Massage intégrant des huiles essentielles personnalisées pour l\'équilibre.', duration: '60 min', price: 110 },
  { id: '4', name: 'Réflexologie Plantaire Séance ciblée - 30 min', description: 'Technique ciblée basée sur la stimulation des points réflexes des pieds.', duration: '30 min', price: 60 },
  { id: '5', name: 'Massage Sportif / Deep Tissue - Séance ciblée 60 min', description: 'Conçu pour les sportifs ou personnes actives, aide à dénouer les muscles.', duration: '60 min', price: 110 },
  { id: '6', name: 'Massage Thérapeutique - Séance ciblée 60 min', description: 'Massage ciblé (technique suédoise) pour soulager les tensions musculaires.', duration: '60 min', price: 110 },
  { id: '7', name: 'Massage Deep Relax - Relaxation Profonde 60 min', description: 'Technique lente et profonde pour une détente totale du corps.', duration: '60 min', price: 120 },
  { id: '8', name: 'Massage Thaï aux Huiles Chaudes - Étirements & Pressions Profondes 60 min', description: 'Technique dynamique combinant pressions profondes et étirements.', duration: '60 min', price: 120 },
];
