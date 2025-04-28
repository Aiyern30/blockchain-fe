"use server";

import { z } from "zod";

const collectionSchema = z.object({
  name: z.string().min(3).max(50),
  symbol: z.string().min(1).max(10),
  description: z.string().min(10).max(1000),
  image: z.string().min(1),
  externalLink: z.string().url().optional().or(z.literal("")),
});

export async function createCollection(
  name: string,
  symbol: string,
  description: string,
  image: string,
  externalLink: string
) {
  // Validate the input data
  const validatedData = collectionSchema.parse({
    name,
    symbol,
    description,
    image,
    externalLink,
  });

  // In a real application, you would call your blockchain function here
  // For now, we'll simulate a delay and return a mock response
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock response - in a real app, this would be the transaction result
  return {
    success: true,
    collectionAddress: "0x" + Math.random().toString(16).slice(2, 42),
    name: validatedData.name,
    symbol: validatedData.symbol,
  };
}
