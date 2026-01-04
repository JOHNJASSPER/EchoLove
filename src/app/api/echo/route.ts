import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { contactName, relationship, vibe, holiday, recentMessages = [] } = await req.json();

        // Basic sanitization
        const safeName = contactName?.replace(/[<>]/g, '') || 'Friend';

        if (!process.env.GROQ_API_KEY) {
            const FALLBACKS = [
                `Hey ${safeName}! Just thinking of you. Hope everything is going great! 💕`,
                `Miss you ${safeName}! Sending you a virtual hug. 🤗`,
                `Hope you're having an awesome day, ${safeName}! ✨`,
                `Just wanted to say hi and check in on you, ${safeName}. ❤️`
            ];
            return NextResponse.json({ echo: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)] });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Build avoidance list from recent messages
        const avoidanceClause = recentMessages.length > 0
            ? `\n\nCRITICAL - DO NOT use any of these phrases or similar openings (these were recently sent):
${recentMessages.map((m: string, i: number) => `${i + 1}. "${m.substring(0, 50)}..."`).join('\n')}
Generate something COMPLETELY FRESH and different. Use a unique opening.`
            : '';

        const systemPrompt = `You are EchoLove, a warm and empathetic relationship assistant. 
Your goal is to help the user maintain deep connections with loved ones.
Write a text message that feels like a "warm hug in text form".

Tone based on vibe:
- chill: casual, low-pressure, easy-going
- sweet: highly affectionate, heartwarming, loving
- playful: witty, fun, light-hearted, can use emojis
- deep: meaningful, sincere, reflective

Rules:
- Keep it SMS length (1-3 sentences max)
- NEVER start two messages the same way - be creative with openings
- Sound human, not robotic
- Output ONLY the message, no quotes or explanation
${holiday ? `- IMPORTANT: Today is ${holiday}. Incorporate this naturally into the message with appropriate emotion.` : ''}${avoidanceClause}`;

        const userPrompt = `Write a ${vibe} message to my ${relationship}, ${safeName}.${holiday ? ` Today is ${holiday}.` : ''}`;

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.95, // Increased for more variety
            max_tokens: 150,
        });

        const echo = response.choices[0].message.content;
        return NextResponse.json({ echo });
    } catch (error: unknown) {
        // Log generic error for production safety
        console.error('Groq Generation Failed');
        const FALLBACKS = [
            "Sending you love and good vibes today! 💕",
            "Just wanted to send a little sunshine your way. ☀️",
            "Thinking of you! Hope your day is magical. ✨",
            "Hey! Just a reminder that you're awesome. 💖"
        ];
        return NextResponse.json(
            { echo: FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)] },
            { status: 200 }
        );
    }
}
