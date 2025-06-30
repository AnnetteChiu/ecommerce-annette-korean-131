'use server';
/**
 * @fileOverview An AI agent for generating an admin report on product performance.
 *
 * - generateAdminReport - A function that analyzes product data and generates a performance report.
 * - AdminReportOutput - The return type for the generateAdminReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getProducts} from '@/lib/products';

const AdminReportOutputSchema = z.object({
  summary: z.string().describe('A 2-3 sentence overall summary of product performance based on impression data.'),
  topPerforming: z.array(z.object({ 
    productId: z.string(), 
    name: z.string(), 
    impressions: z.number(), 
    reason: z.string().describe('A brief explanation for why this product is performing well.') 
  })).length(3).describe('The top 3 performing products by impressions.'),
  underperforming: z.array(z.object({ 
    productId: z.string(), 
    name: z.string(), 
    impressions: z.number(), 
    reason: z.string().describe('A brief explanation for why this product might be underperforming.')
  })).length(3).describe('The 3 products with the lowest impressions.'),
  categoryPerformance: z.array(z.object({ 
    category: z.string(), 
    totalImpressions: z.number() 
  })).describe('An array summarizing total impressions for each product category.'),
  suggestions: z.array(z.string()).length(3).describe('Three actionable marketing or inventory suggestions based on the data.'),
});

export type AdminReportOutput = z.infer<typeof AdminReportOutputSchema>;

const ProductForPromptSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    impressions: z.number(),
});

const FlowInputSchema = z.object({
  products: z.array(ProductForPromptSchema),
});

export async function generateAdminReport(): Promise<AdminReportOutput> {
  const products = getProducts().map(({ id, name, category, impressions }) => ({ id, name, category, impressions }));
  
  // Let errors from the flow propagate up to the calling component.
  return await adminReportFlow({ products });
}

const reportPrompt = ai.definePrompt({
    name: 'adminReportPrompt',
    input: { schema: FlowInputSchema },
    output: { schema: AdminReportOutputSchema },
    system: "You are a business intelligence analyst for an e-commerce fashion store. Your response must be only a valid JSON object matching the provided schema, with no other text, explanation, or markdown formatting.",
    prompt: `Analyze the following product data, which includes product ID, name, category, and impression count.
Generate a concise business report.
Identify top and underperforming products. Sum up impressions by category.
Provide a brief summary and three actionable suggestions for marketing or inventory based on your analysis.

Product Data:
{{#each products}}
- ID: {{this.id}}, Name: {{this.name}}, Category: {{this.category}}, Impressions: {{this.impressions}}
{{/each}}`
});

const adminReportFlow = ai.defineFlow(
  {
    name: 'adminReportFlow',
    inputSchema: FlowInputSchema,
    outputSchema: AdminReportOutputSchema,
  },
  async (input) => {
    const { output } = await reportPrompt(input);
    return output!;
  }
);
