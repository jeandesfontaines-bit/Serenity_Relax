'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized aftercare tips
 * and wellness advice for a client based on their booked massage service and client notes.
 *
 * - generateAiPostTreatmentGuidance - A function that handles the AI post-treatment guidance generation process.
 * - AiPostTreatmentGuidanceInput - The input type for the generateAiPostTreatmentGuidance function.
 * - AiPostTreatmentGuidanceOutput - The return type for the generateAiPostTreatmentGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPostTreatmentGuidanceInputSchema = z.object({
  bookedService: z.string().describe('The name of the massage service booked by the client.'),
  clientNotes: z.string().optional().describe('Any relevant client-specific notes from the session, such as areas of focus, client feedback, or specific conditions.'),
});
export type AiPostTreatmentGuidanceInput = z.infer<typeof AiPostTreatmentGuidanceInputSchema>;

const AiPostTreatmentGuidanceOutputSchema = z.object({
  aftercareAdvice: z.string().describe('Personalized aftercare tips and wellness advice for the client.'),
});
export type AiPostTreatmentGuidanceOutput = z.infer<typeof AiPostTreatmentGuidanceOutputSchema>;

export async function generateAiPostTreatmentGuidance(
  input: AiPostTreatmentGuidanceInput
): Promise<AiPostTreatmentGuidanceOutput> {
  return aiPostTreatmentGuidanceFlow(input);
}

const aiPostTreatmentGuidancePrompt = ai.definePrompt({
  name: 'aiPostTreatmentGuidancePrompt',
  input: {schema: AiPostTreatmentGuidanceInputSchema},
  output: {schema: AiPostTreatmentGuidanceOutputSchema},
  prompt: `You are an expert massage therapist and wellness advisor. Your task is to provide personalized aftercare tips and wellness advice for a client, based on their recent massage session.

**Service Booked:** {{{bookedService}}}

{{#if clientNotes}}
**Client Notes from Session:** {{{clientNotes}}}
{{/if}}

Please generate practical, clear, and encouraging aftercare tips and wellness advice. Focus on recommendations that complement the booked service and address any specific needs or conditions mentioned in the client notes. The advice should be easy to understand and implement at home.

Structure your response as direct, well-formatted text suitable for a "Bon à savoir!" section in a client portal or email. Do not include any conversational preamble or markdown headers beyond simple bullet points or paragraphs if needed for readability.`,
});

const aiPostTreatmentGuidanceFlow = ai.defineFlow(
  {
    name: 'aiPostTreatmentGuidanceFlow',
    inputSchema: AiPostTreatmentGuidanceInputSchema,
    outputSchema: AiPostTreatmentGuidanceOutputSchema,
  },
  async input => {
    const {output} = await aiPostTreatmentGuidancePrompt(input);
    return output!;
  }
);
