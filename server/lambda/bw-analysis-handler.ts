/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — LAMBDA: Analysis Action Handler
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * AWS Lambda function invoked by Bedrock Agent to run brain analysis engines.
 * Mirrors BrainIntegrationService.enrich() for the Lambda context.
 *
 * Action Group: AnalysisAction
 * Function:     bw-analysis-handler
 *
 * Deploy:
 *   Function name : bw-analysis-handler
 *   Runtime       : nodejs20.x
 *   Handler       : bw-analysis-handler.handler
 *   Timeout       : 120s
 *   Memory        : 1024 MB
 *   Env vars      : TOGETHER_API_KEY, TOGETHER_MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import https from 'https';

const TOGETHER_URL   = 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.1-70B-Instruct-Turbo';

async function callTogether(userPrompt: string, systemPrompt: string): Promise<string> {
  const key = process.env.TOGETHER_API_KEY || '';
  if (!key) throw new Error('TOGETHER_API_KEY not set in Lambda environment');

  const body = JSON.stringify({
    model: TOGETHER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    max_tokens: 3000,
    temperature: 0.3,
  });

  return new Promise((resolve, reject) => {
    const url = new URL(TOGETHER_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data).choices?.[0]?.message?.content || ''); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

interface BedrockAgentEvent {
  messageVersion: string;
  agent: { name: string; id: string; aliasId: string; version: string };
  inputText: string;
  sessionId: string;
  actionGroup: string;
  apiPath: string;
  httpMethod: string;
  parameters?: Array<{ name: string; type: string; value: string }>;
  requestBody?: {
    content: {
      'application/json': {
        properties: Array<{ name: string; type: string; value: string }>;
      };
    };
  };
}

export async function handler(event: BedrockAgentEvent) {
  console.log('[bw-analysis-handler] Event:', JSON.stringify(event, null, 2));

  const params = [
    ...(event.parameters || []),
    ...(event.requestBody?.content?.['application/json']?.properties || []),
  ];
  const get = (name: string) => params.find(p => p.name === name)?.value || '';

  const organizationName  = get('organizationName') || 'Unknown Organisation';
  const country           = get('country')           || '';
  const organizationType  = get('organizationType')  || 'Private Sector';
  const sector            = get('sector')            || 'General';
  const objectives        = get('objectives')        || '';

  try {
    const system =
      'You are the BW NEXUS Brain Engine — a multi-dimensional strategic intelligence system. ' +
      'Run all 8 analysis engines and return structured JSON output. Be precise and data-driven.';

    const prompt =
      `Run full brain analysis for this case:\n\n` +
      `Organization: ${organizationName}\n` +
      `Country: ${country}\n` +
      `Type: ${organizationType}\n` +
      `Sector: ${sector}\n` +
      `Objectives: ${objectives}\n\n` +
      `Return a JSON object with these keys:\n` +
      `{\n` +
      `  "spiScore": <0-100>,\n` +
      `  "readinessScore": <0-100>,\n` +
      `  "situationAnalysis": "<2-3 sentences>",\n` +
      `  "keyOpportunities": ["<opp1>","<opp2>","<opp3>"],\n` +
      `  "keyRisks": ["<risk1>","<risk2>","<risk3>"],\n` +
      `  "strategicRecommendations": ["<rec1>","<rec2>","<rec3>"],\n` +
      `  "marketDynamics": "<paragraph>",\n` +
      `  "regulatoryEnvironment": "<paragraph>",\n` +
      `  "partnershipViability": "<High|Medium|Low> — <reason>",\n` +
      `  "promptBlock": "<full narrative intelligence summary for document generation>"\n` +
      `}\n\n` +
      `Return ONLY the JSON object. No markdown. No explanation.`;

    const rawAnalysis = await callTogether(prompt, system);

    // Parse JSON response
    let analysis: Record<string, unknown> = {};
    try {
      const cleaned = rawAnalysis.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, wrap in structure
      analysis = {
        spiScore: 65,
        readinessScore: 60,
        promptBlock: rawAnalysis,
        situationAnalysis: rawAnalysis.slice(0, 300),
      };
    }

    return buildResponse(event, {
      brainContext: JSON.stringify(analysis),
      spiScore: analysis.spiScore ?? 65,
      readinessScore: analysis.readinessScore ?? 60,
      organizationName,
      country,
    });

  } catch (error) {
    console.error('[bw-analysis-handler] Error:', error);
    return buildResponse(event, {
      brainContext: '{}',
      spiScore: 0,
      readinessScore: 0,
      organizationName,
      country,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function buildResponse(event: BedrockAgentEvent, body: object) {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      httpMethod: event.httpMethod,
      httpStatusCode: 200,
      responseBody: {
        'application/json': { body: JSON.stringify(body) },
      },
    },
  };
}
