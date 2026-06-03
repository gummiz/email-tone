import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { contact, toneProfile, goal } = await request.json();

    if (!contact || !toneProfile || !goal) {
      return NextResponse.json(
        { error: 'contact, toneProfile, and goal are required' },
        { status: 400 }
      );
    }

    const { formality, greetingStyle, closingStyle, avgLength, keyPatterns } = toneProfile;

    const prompt = `You are helping compose a professional email. Write an email that matches the sender's established communication style with this specific contact.

COMMUNICATION STYLE WITH ${contact.name}:
- Formality/Style: ${formality}
- Greeting: ${greetingStyle}
- Closing: ${closingStyle}
- Length: ${avgLength}
- Key patterns: ${Array.isArray(keyPatterns) ? keyPatterns.join(', ') : keyPatterns}

EMAIL GOAL: ${goal}
RECIPIENT: ${contact.name} (${contact.email})

Write ONLY the email subject and body. Format your response as:
SUBJECT: <subject line>
BODY:
<email body>

Match the style exactly — use the same greeting, closing, length, and communication patterns. Do not include explanations or notes outside the email itself.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    const subjectMatch = text.match(/SUBJECT:\s*(.+)/);
    const bodyMatch = text.match(/BODY:\s*([\s\S]+)/);

    const subject = subjectMatch ? subjectMatch[1].trim() : `Re: ${goal}`;
    const body = bodyMatch ? bodyMatch[1].trim() : text;

    return NextResponse.json({ subject, body });
  } catch (error) {
    console.error('Compose API error:', error);
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
}
