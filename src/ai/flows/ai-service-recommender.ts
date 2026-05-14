'use server';
/**
 * @fileOverview An AI agent that recommends suitable massage therapy services based on a client's state or needs.
 *
 * - recommendMassageService - A function that handles the massage service recommendation process.
 * - AiServiceRecommenderInput - The input type for the recommendMassageService function.
 * - AiServiceRecommenderOutput - The return type for the recommendMassageService function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ServiceItemSchema = z.object({
  name: z.string().describe('The name of the massage service.'),
  description: z.string().describe('A detailed description of the service.'),
  duration: z.string().describe('The duration of the service (e.g., "60 min").'),
  price: z.string().describe('The price of the service (e.g., "CHF 120").'),
});

const AiServiceRecommenderInputSchema = z.object({
  clientDescription: z
    .string()
    .describe(
      'A detailed description of the client\u2019s current physical and mental state, or specific needs and preferences.'
    ),
  serviceCatalog: z
    .array(ServiceItemSchema)
    .describe('A list of available massage therapy services with their names, descriptions, durations, and prices.'),
});
export type AiServiceRecommenderInput = z.infer<typeof AiServiceRecommenderInputSchema>;

const AiServiceRecommenderOutputSchema = z.object({
  recommendedServiceName: z
    .string()
    .describe('The name of the most suitable massage service from the provided catalog.'),
  reasoning: z
    .string()
    .describe('A detailed explanation of why this service was recommended based on the client\u2019s description.'),
});
export type AiServiceRecommenderOutput = z.infer<typeof AiServiceRecommenderOutputSchema>;

export async function recommendMassageService(
  input: AiServiceRecommenderInput
): Promise<AiServiceRecommenderOutput> {
  return aiServiceRecommenderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiServiceRecommenderPrompt',
  input: {schema: AiServiceRecommenderInputSchema},
  output: {schema: AiServiceRecommenderOutputSchema},
  prompt: `Tu es un massothérapeute expert et un assistant IA très empathique.

Ta mission:
- recommander un seul soin, le plus adapté, à partir du catalogue fourni
- répondre uniquement en français
- ne jamais répondre en anglais
- garder exactement le nom du soin tel qu'il apparaît dans le catalogue
- fournir une explication courte, claire, naturelle et rassurante

Contraintes de sortie:
- \`recommendedServiceName\` doit être exactement un nom présent dans le catalogue
- \`reasoning\` doit être rédigé uniquement en français
- \`reasoning\` doit faire 2 à 4 phrases maximum
- \`reasoning\` peut mentionner les besoins du client, l'intensité du soin, son intention, ou sa durée si utile

### Description du client:
{{{clientDescription}}}

### Catalogue des soins disponibles:
{{#each serviceCatalog}}
- Nom: {{{this.name}}}
  Description: {{{this.description}}}
  Durée: {{{this.duration}}}
  Prix: {{{this.price}}}
{{/each}}

À partir de la description du client et du catalogue, recommande le soin le plus adapté et explique brièvement pourquoi en français.`,
});

const aiServiceRecommenderFlow = ai.defineFlow(
  {
    name: 'aiServiceRecommenderFlow',
    inputSchema: AiServiceRecommenderInputSchema,
    outputSchema: AiServiceRecommenderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
