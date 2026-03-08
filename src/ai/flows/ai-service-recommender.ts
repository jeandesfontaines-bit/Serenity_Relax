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
  prompt: `You are an expert massage therapist and a highly empathetic AI assistant. Your goal is to recommend the most suitable massage therapy service from the provided catalog to a client, based on their detailed description of their current physical and mental state, needs, and preferences. Provide a clear and concise reasoning for your recommendation.

### Client's Description:
{{{clientDescription}}}

### Available Services Catalog:
{{#each serviceCatalog}}
- Name: {{{this.name}}}
  Description: {{{this.description}}}
  Duration: {{{this.duration}}}
  Price: {{{this.price}}}
{{/each}}

Based on the client's description and the available services, recommend the single most suitable service and explain your reasoning.`,
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
