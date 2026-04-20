import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function simplifyServiceName(name: string) {
  if (!name) return 'Session';
  const n = name.toLowerCase();
  if (n.includes('réflexologie plantaire')) return 'Réflexologie Plantaire';
  if (n.includes('bambous')) return 'Massages aux Bambous';
  return name.replace('Séance ciblée', '').trim().split(' - ')[0];
}
