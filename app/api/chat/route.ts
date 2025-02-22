import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI chatbot for an NFT marketplace." },
        { role: "user", content: message },
      ],
    });

    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}
