export const THERAPIST_EMAILS = [
  'jean.desfontaines@gmail.com',
  'joaoalbertodacosta@gmail.com',
] as const;

export function isTherapistEmail(email?: string | null) {
  return !!email && THERAPIST_EMAILS.includes(email.trim().toLowerCase() as typeof THERAPIST_EMAILS[number]);
}
