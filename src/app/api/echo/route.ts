import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { contactName, relationship, vibe } = await req.json();

        // Basic sanitization
        const safeName = contactName?.replace(/[<>]/g, '') || 'Friend';

        if (!process.env.GROQ_API_KEY) {
            // Fallback to mock if no API key
            return NextResponse.json({
                echo: `Hey ${safeName}! Just thinking of you. Hope everything is going great! 💕`
            });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are EchoLove, a warm and empathetic relationship assistant. 
          Your goal is to help the user maintain deep connections with loved ones.
          Write a text message that feels like a "warm hug in text form".
          
          Tone based on vibe:
          - chill: casual, low-pressure, easy-going
          - sweet: highly affectionate, heartwarming, loving
          - playful: witty, fun, light-hearted, can use emojis
          - deep: meaningful, sincere, reflective
          
          Rules:
          - Keep it SMS length (1-3 sentences max)
          - Never start two messages the same way
          - Sound human, not robotic
          - Output ONLY the message, no quotes or explanation`,
                },
                {
                    role: 'user',
                    content: `Write a ${vibe} message to my ${relationship}, ${safeName}.`,
                },
            ],
            temperature: 0.9,
            max_tokens: 150,
        });

        const echo = response.choices[0].message.content;
        return NextResponse.json({ echo });
    } catch (error: unknown) {
        // Log generic error for production safety
        console.error('Groq Generation Failed');
        return NextResponse.json(
            { echo: "Sending you love and good vibes today! 💕" },
            { status: 200 }
        );
    }
}
