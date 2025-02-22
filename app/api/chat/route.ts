import { NextResponse } from "next/server";
import OpenAI from "openai";

interface OpenAIError extends Error {
  status?: number;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let model = "gpt-3.5-turbo"; 

    try {
      const response = await callOpenAI(openai, message, model);
      return NextResponse.json({ response });
    } catch (error: unknown) {
      const openAIError = error as OpenAIError;

      if (openAIError.status === 404) {
        console.error("Model not found. Falling back to gpt-3.5-turbo.");
        model = "gpt-3.5-turbo";
        return NextResponse.json({
          error: "Model not available, switched to a different model.",
        }, { status: 404 });
      } else if (openAIError.status === 429) {
        return NextResponse.json({
          error: "Rate limit exceeded. Please wait and try again.",
        }, { status: 429 });
      } else {
        console.error("OpenAI API error:", openAIError);
        return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
      }
    }
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function callOpenAI(openai: OpenAI, message: string, model: string) {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are an AI chatbot for an NFT marketplace." },
      { role: "user", content: message },
    ],
  });

  return response.choices[0].message.content;
}
