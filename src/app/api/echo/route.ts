import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Event-specific prompt templates
const MESSAGE_TEMPLATES: Record<string, { systemExtra: string; examples: string[] }> = {
    birthday: {
        systemExtra: `This is a BIRTHDAY message! Make it celebratory, joyful, and wish them a wonderful birthday. Include birthday-related emojis like 🎂🎉🎁🥳. Focus on celebrating their special day and how much they mean to the sender.`,
        examples: [
            "Happy Birthday! 🎂 Another year of being absolutely amazing. Wishing you the best day ever! 🎉",
            "It's your special day! 🥳 Hope it's filled with cake, love, and everything that makes you happy! 🎁",
        ]
    },
    love: {
        systemExtra: `This is a ROMANTIC/LOVE message! Make it heartfelt, romantic, and express deep affection. Perfect for Valentine's Day, anniversaries, or just because. Use romantic emojis like 💕❤️💑🌹. Focus on love, appreciation, and the special bond.`,
        examples: [
            "Every moment with you feels like magic. I'm so grateful you're in my life. 💕",
            "Just thinking about you and smiling. You make everything better. ❤️",
        ]
    },
    motivation: {
        systemExtra: `This is a DAILY MOTIVATION message! Be inspiring, uplifting, and encouraging. Help them start their day with positivity. Use empowering emojis like ⚡💪🌟✨. Focus on their strength, potential, and capability.`,
        examples: [
            "Rise and shine! Today's a brand new chance to be amazing. You've got this! 💪",
            "Remember: you're capable of incredible things. Go crush it today! ⚡",
        ]
    },
    checkin: {
        systemExtra: `This is a simple CHECK-IN message! Light, casual, just reaching out to see how they're doing. No specific occasion. Use friendly emojis like 👋😊💭. Focus on genuine connection and showing you care.`,
        examples: [
            "Hey! Just wanted to check in and see how you're doing. Thinking of you! 😊",
            "Miss you! How's everything going? Would love to catch up soon. 💭",
        ]
    },
    holiday: {
        systemExtra: `This is a SPECIAL HOLIDAY message! Make it festive, warm, and appropriate for the specific occasion. Use relevant emojis. Focus on sharing good wishes and celebrating the spirit of the holiday.`,
        examples: [
            "Happy [Holiday]! 🎄 Wishing you joy, warmth, and lots of happiness today! ✨",
            "Sending you big holiday hugs! 🤗 Hope you have a wonderful [Holiday] filled with love! 💖",
        ]
    }
};

export async function POST(req: Request) {
    try {
        const { contactName, relationship, vibe, holiday, messageType = 'checkin', recentMessages = [] } = await req.json();

        // Basic sanitization
        const safeName = contactName?.replace(/[<>]/g, '') || 'Friend';
        const template = MESSAGE_TEMPLATES[messageType] || MESSAGE_TEMPLATES.checkin;

        if (!process.env.GROQ_API_KEY) {
            // Return a random example from the template
            return NextResponse.json({
                echo: template.examples[Math.floor(Math.random() * template.examples.length)]
                    .replace(/you/gi, safeName)
            });
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
Your goal is to help users maintain deep connections with loved ones.

${template.systemExtra}

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
${holiday ? `- Today is ${holiday}. Incorporate this naturally.` : ''}${avoidanceClause}`;

        const typeLabel = messageType === 'birthday' ? 'birthday' :
            messageType === 'love' ? 'romantic love' :
                messageType === 'motivation' ? 'motivational' : 'check-in';

        const userPrompt = `Write a ${vibe}, ${typeLabel} message to my ${relationship}, ${safeName}.${holiday ? ` Today is ${holiday}.` : ''}`;

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.95,
            max_tokens: 150,
        });

        const echo = response.choices[0].message.content;
        return NextResponse.json({ echo });
    } catch {
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
