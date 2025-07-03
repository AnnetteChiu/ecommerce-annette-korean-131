'use server';
/**
 * @fileOverview An AI agent for generating a sales report analysis.
 *
 * - generateAdminReport - A function that generates an insightful summary of sales data.
 * - AdminReportInput - The input type for the generateAdminReport function.
 * - AdminReportOutput - The return type for the generateAdminReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const MonthlyTrendSchema = z.object({
  month: z.string(),
  sales: z.number(),
  revenue: z.string(),
});

const TopRegionSchema = z.object({
  region: z.string(),
  sales: z.number(),
  percentage: z.string(),
});

const AdminReportInputSchema = z.object({
  productName: z.string(),
  totalSales: z.number(),
  revenue: z.string(),
  averageRating: z.number(),
  totalReviews: z.number(),
  returnRate: z.string(),
  monthlyTrend: z.array(MonthlyTrendSchema),
  topRegions: z.array(TopRegionSchema),
});
export type AdminReportInput = z.infer<typeof AdminReportInputSchema>;

const AdminReportOutputSchema = z.object({
  report: z.string().describe('The formatted, insightful business report as a plain text string. Use newlines for paragraphs and asterisks for bullet points.'),
});
export type AdminReportOutput = z.infer<typeof AdminReportOutputSchema>;

export async function generateAdminReport(input: AdminReportInput): Promise<AdminReportOutput> {
  return generateAdminReportFlow(input);
}

const RefinedAdminReportInputSchema = z.object({
    jsonData: z.string().describe("The sales data as a JSON string."),
});

const reportPrompt = ai.definePrompt({
    name: 'adminReportPrompt',
    input: { schema: RefinedAdminReportInputSchema },
    output: { schema: AdminReportOutputSchema },
    system: "You are a senior business analyst for an e-commerce company. Your response must be ONLY a valid JSON object matching the provided schema. The 'report' field should be a plain text string, using newlines for structure and asterisks for bullet points. Do not use markdown formatting like '#' headers.",
    prompt: `Analyze the following JSON sales data and generate a concise, insightful report for management.

**Instructions:**
1.  **Executive Summary:** Start with a brief, one-paragraph summary of the product's overall performance.
2.  **Key Insights:** In bullet points, highlight the most important takeaways from the data. Mention revenue, sales volume, and customer feedback (ratings/reviews).
3.  **Trend Analysis:** Analyze the \`monthlyTrend\` data. Is there a positive, negative, or flat trend? Point out any significant peaks or dips.
4.  **Regional Performance:** Comment on the \`topRegions\` data. Where is the product most popular? Is there a heavy concentration in one area?
5.  **Actionable Recommendations:** Based on your analysis, suggest 1-2 concrete, data-driven actions the business could take.

**JSON Data to Analyze:**
{{{jsonData}}}
`,
    config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
        ],
      },
});


const generateAdminReportFlow = ai.defineFlow(
  {
    name: 'generateAdminReportFlow',
    inputSchema: AdminReportInputSchema,
    outputSchema: AdminReportOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await reportPrompt({ jsonData: JSON.stringify(input, null, 2) });
      if (!output?.report) {
          throw new Error('Failed to generate an admin report.');
      }
      return output;
    } catch (err) {
      console.error('Error in generateAdminReportFlow:', err);
      if (err instanceof Error && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error('API_KEY_INVALID');
      }
      throw new Error("Could not generate a report at this time. Please try again.");
    }
  }
);
