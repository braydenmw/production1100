import { callAIGateway } from './UnifiedAIGateway';

export async function solveAndAct(problem: string, context: any, params: any, options: any) {
  // Try backend first
  try {
    const res = await fetch('/api/autonomous/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem, context, params, options })
    });
    if (res.ok) {
      return res.json();
    }
  } catch {
    console.warn('[AutonomousClient] Backend unavailable, falling back to multi-brain AI');
  }

  // Multi-brain AI via Unified Gateway (Together → Groq → Server fallback)
  try {
    const prompt = `You are an autonomous strategic AI agent. Analyze the following problem and generate actionable solutions.

Problem: ${problem}

Context:
- Region: ${context?.region || 'Global'}
- Industry: ${context?.industry || 'General'}
- Deal Size: ${context?.dealSize || 'Not specified'}
- Strategic Intent: ${context?.strategicIntent || 'Growth'}

Generate 3-5 specific, actionable solutions. Return ONLY valid JSON in this exact format:
{
  "solutions": [
    { "action": "Brief action title", "reasoning": "Why this is recommended", "confidence": 85 }
  ],
  "summary": "Brief overall summary"
}`;

    const result = await callAIGateway(prompt, undefined, {
      taskType: 'reason',
      caller: 'autonomousClient/solveAndAct',
    });
    const cleaned = result.text.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        solutions: parsed.solutions || [],
        summary: parsed.summary || 'AI-generated autonomous analysis complete'
      };
    }
  } catch (aiError) {
    console.warn('[AutonomousClient] Multi-brain AI failed:', aiError);
  }

  // Graceful degradation - indicate AI unavailability
  return {
    solutions: [
      { action: 'Configure AI provider API keys', reasoning: 'Set server-side provider keys (for example TOGETHER_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY) for full autonomous capability', confidence: 0 }
    ],
    summary: 'AI providers unavailable - configure API keys for autonomous analysis'
  };
}

export default { solveAndAct };
