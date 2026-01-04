import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter (Map<IP, {count, startTime}>)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    // Clean up old entries
    if (rateLimitMap.size > 1000) rateLimitMap.clear();

    if (!record) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return false;
    }

    if (now - record.startTime > RATE_LIMIT_WINDOW) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return false;
    }

    if (record.count >= MAX_REQUESTS) {
        return true;
    }

    record.count++;
    return false;
}

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
        // 1. Rate Limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { contactName, relationship, vibe, holiday, messageType = 'checkin', recentMessages = [] } = await req.json();

        // 2. Sanitization
        // Remove characters that could be used for injection/formatting attacks
        const safeName = (contactName || 'Friend').replace(/[<>"{}]/g, '').trim().substring(0, 50);
        const safeRelationship = (relationship || 'Contact').replace(/[<>"{}]/g, '').trim().substring(0, 50);

        // Ensure recent messages are strings and sanitized
        const safeRecentMessages = (Array.isArray(recentMessages) ? recentMessages : [])
            .filter(m => typeof m === 'string')
            .map(m => m.replace(/[<>]/g, '').substring(0, 100)); // Truncate to avoid context overflow

        const template = MESSAGE_TEMPLATES[messageType] || MESSAGE_TEMPLATES.checkin;

        // Secure Random Helper
        const getSecureRandomInt = (max: number) => {
            const array = new Uint32Array(1);
            crypto.getRandomValues(array);
            return array[0] % max;
        };

        if (!process.env.GROQ_API_KEY) {
            // Return a random example from the template using secure random
            const randomIndex = getSecureRandomInt(template.examples.length);
            return NextResponse.json({
                echo: template.examples[randomIndex].replace(/you/gi, safeName)
            });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        // Build avoidance list from sanitized recent messages
        const avoidanceClause = safeRecentMessages.length > 0
            ? `\n\nCRITICAL - DO NOT use any of these phrases or similar openings (these were recently sent):
${safeRecentMessages.map((m: string, i: number) => `${i + 1}. "${m}..."`).join('\n')}
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

        const userPrompt = `Write a ${vibe}, ${typeLabel} message to my ${safeRelationship}, ${safeName}.${holiday ? ` Today is ${holiday}.` : ''}`;

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

        // Secure random fallback
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const randomIndex = array[0] % FALLBACKS.length;

        return NextResponse.json(
            { echo: FALLBACKS[randomIndex] },
            { status: 200 }
        );
    }
}
