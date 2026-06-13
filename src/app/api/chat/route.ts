import { NextResponse } from 'next/server';

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const { message, history, partner } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const isStark = partner === 'stark';
    const charName = isStark ? 'Stark' : 'Fern';

    // Construct context-aware prompt with chronological dialogue history
    let customPrompt = "";
    if (isStark) {
      customPrompt = `You are Stark, a character from Frieren: Beyond Journey's End. Frieren-sama is speaking to you. Respond in character (Stark is a warrior, easily frightened/cowardly but brave and determined when it counts, respectful, a bit naive/clueless, and calls Frieren "Frieren-sama" or "Frieren"). Keep your response short (1-2 sentences) so it fits in a speech bubble. Don't include any extra text (like "Stark:" or "Here is the response:") other than Stark's dialogue.\n\n`;
    } else {
      customPrompt = `You are Fern, a character from Frieren: Beyond Journey's End. Frieren-sama is speaking to you. Respond in character (Fern is quiet, polite, a bit pouty/irritated but deeply caring, and uses formal language like "Frieren-sama" or "Frieren"). Keep your response short (1-2 sentences) so it fits in a speech bubble. Don't include any extra text (like "Fern:" or "Here is the response:") other than Fern's dialogue.\n\n`;
    }

    if (history && Array.isArray(history) && history.length > 0) {
      customPrompt += `Here is the conversation history:\n`;
      history.forEach((msg: ChatMessage) => {
        if (msg.role === 'user') {
          customPrompt += `Frieren: "${msg.content}"\n`;
        } else {
          customPrompt += `${charName}: "${msg.content}"\n`;
        }
      });
      customPrompt += `\n`;
    }

    customPrompt += `Frieren says: "${message}"\n${charName}:`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
        'HTTP-Referer': 'https://github.com/google-gemini',
        'X-Title': 'PortWindows',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [
          {
            role: 'user',
            content: customPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned status ${response.status}`);
    }

    const data = await response.json();
    const fullText = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ text: fullText });
  } catch (error) {
    console.error('OpenRouter API route error:', error);
    
    // Provide a mocked in-character fallback response if OpenRouter fails
    // so the application doesn't crash and the user has a graceful experience.
    return NextResponse.json({
      text: "Thinking...\nOpenRouter API request failed. Please make sure your OPENROUTER_API_KEY is configured in your .env.local file.\n...done thinking.\n\nFrieren-sama, please make sure your OpenRouter API key is set.",
      fallback: true
    });
  }
}
