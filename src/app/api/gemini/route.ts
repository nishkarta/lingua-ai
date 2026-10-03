import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateWritingWithGemini,
  generateReadingPassageWithGemini,
  chatSpeakingScenarioWithGemini,
  lookupWordWithGemini,
} from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, apiKey } = body;

    if (action === 'evaluate-writing') {
      const { prompt, submission, level } = body;
      if (!prompt || !submission) {
        return NextResponse.json({ error: 'Prompt and submission are required' }, { status: 400 });
      }
      const evaluation = await evaluateWritingWithGemini(prompt, submission, level || 'B2', apiKey);
      return NextResponse.json(evaluation);
    }

    if (action === 'generate-reading') {
      const { topic, level } = body;
      if (!topic) {
        return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
      }
      const passage = await generateReadingPassageWithGemini(topic, level || 'B2', apiKey);
      return NextResponse.json(passage);
    }

    if (action === 'conversation-turn') {
      const { scenario, history, userSpeech } = body;
      if (!scenario || !userSpeech) {
        return NextResponse.json({ error: 'Scenario and userSpeech are required' }, { status: 400 });
      }
      const reply = await chatSpeakingScenarioWithGemini(scenario, history || [], userSpeech, apiKey);
      return NextResponse.json(reply);
    }

    if (action === 'lookup-word') {
      const { word, contextSentence } = body;
      if (!word) {
        return NextResponse.json({ error: 'Word is required' }, { status: 400 });
      }
      const definition = await lookupWordWithGemini(word, contextSentence, apiKey);
      return NextResponse.json(definition);
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: unknown) {
    console.error('API /api/gemini Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
