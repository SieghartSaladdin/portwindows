import { NextResponse } from 'next/server';

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
      history.forEach((msg: any) => {
        if (msg.role === 'user') {
          customPrompt += `Frieren: "${msg.content}"\n`;
        } else {
          customPrompt += `${charName}: "${msg.content}"\n`;
        }
      });
      customPrompt += `\n`;
    }

    customPrompt += `Frieren says: "${message}"\n${charName}:`;

    // Call local Ollama API
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma4:31b-cloud',
        prompt: customPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama service returned status ${response.status}`);
    }

    const data = await response.json();
    const fullText = data.response || '';

    return NextResponse.json({ text: fullText });
  } catch (error: any) {
    console.error('Ollama API route error:', error);
    
    // Provide a mocked in-character fallback response if Ollama is not running
    // so the application doesn't crash and the user has a graceful experience.
    return NextResponse.json({
      text: "Thinking...\nOllama is not running locally or the gemma4:31b-cloud model is not available.\n...done thinking.\n\nFrieren-sama, please make sure Ollama is running on your system.",
      fallback: true
    });
  }
}
