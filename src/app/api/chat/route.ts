import { NextResponse } from 'next/server';
import { graph } from '@/lib/agents/main_agent/graph';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';

export async function POST(request: Request) {
  try {
    const { message, history, partner } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Map history to LangChain message formats
    const langChainMessages: BaseMessage[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.role === 'user') {
          langChainMessages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          langChainMessages.push(new AIMessage(msg.content));
        }
      });
    }

    // Add current user message
    langChainMessages.push(new HumanMessage(message));

    // Execute LangGraph
    const inputs = {
      messages: langChainMessages,
      partner: partner || 'robot',
    };

    const finalState = await graph.invoke(inputs);

    if (partner === 'robot') {
      return NextResponse.json({
        text: finalState.output,
        action: finalState.action
      });
    }

    return NextResponse.json({ text: finalState.output });
  } catch (error: any) {
    console.error('LangGraph API route error:', error);
    
    const provider = process.env.LLM_PROVIDER || 'openrouter';
    const baseUrl = process.env.LLM_API_BASE_URL || 'https://openrouter.ai/api/v1';
    const errorDetail = provider === 'ollama'
      ? `Ollama API request failed. Please check if your Ollama instance is running at ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'} and the model "${process.env.OLLAMA_MODEL || 'gemma2'}" is pulled.`
      : `LLM API request failed at endpoint: ${baseUrl}. Please make sure your LLM_API_KEY or OPENROUTER_API_KEY is configured in your env.`;

    return NextResponse.json({
      text: `Thinking...\n${errorDetail}\n...done thinking.\n\nFrieren-sama, please check the agent's graph execution logs.`,
      fallback: true
    });
  }
}
