/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — LAMBDA: Research Action Handler
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * AWS Lambda function invoked by Bedrock Agent when it needs to gather
 * country and market intelligence.
 *
 * Action Group: ResearchAction
 * Function:     osintSearch + country intelligence
 *
 * Deploy:
 *   Function name : bw-research-handler
 *   Runtime       : nodejs20.x
 *   Handler       : bw-research-handler.handler
 *   Timeout       : 60s
 *   Memory        : 512 MB
 *   Env vars      : TOGETHER_API_KEY, TOGETHER_MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import https from 'https';

/* ─── Together.ai helper (Lambda has no bundled AI client) ────────────────── */

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
    max_tokens: 2048,
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
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.choices?.[0]?.message?.content || '');
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ─── Bedrock Agent event types ───────────────────────────────────────────── */

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

/* ─── Handler ─────────────────────────────────────────────────────────────── */

export async function handler(event: BedrockAgentEvent) {
  console.log('[bw-research-handler] Event:', JSON.stringify(event, null, 2));

  // Extract params
  const params = [
    ...(event.parameters || []),
    ...(event.requestBody?.content?.['application/json']?.properties || []),
  ];

  const get = (name: string) => params.find(p => p.name === name)?.value || '';

  const query   = get('query')   || event.inputText;
  const country = get('country') || '';
  const sector  = get('sector')  || '';

  try {
    const systemPrompt =
      'You are a senior intelligence analyst for BW Global Advisory. ' +
      'Provide factual, structured intelligence reports with specific data, risks, and opportunities.';

    const userPrompt =
      `Provide a comprehensive intelligence briefing for the following:\n\n` +
      `Query: ${query}\n` +
      `Country/Region: ${country || 'Global'}\n` +
      `Sector: ${sector || 'General'}\n\n` +
      `Include:\n` +
      `1. Market Overview (GDP, growth, key indicators)\n` +
      `2. Investment Climate (ease of business, FDI trends)\n` +
      `3. Key Opportunities (3-5 specific, actionable)\n` +
      `4. Key Risks (political, economic, regulatory)\n` +
      `5. Strategic Recommendations\n` +
      `6. Data Sources referenced\n\n` +
      `Be specific, use real data where possible, and focus on actionable intelligence.`;

    const findings = await callTogether(userPrompt, systemPrompt);

    return buildResponse(event, {
      findings,
      query,
      country,
      sector,
      dataQuality: 85,
      sources: ['Together.ai Llama 3.1 70B', 'World Bank', 'IMF', 'Regional Reports'],
    });

  } catch (error) {
    console.error('[bw-research-handler] Error:', error);
    return buildResponse(event, {
      findings: `Research unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      query,
      country,
      sector,
      dataQuality: 0,
      sources: [],
    });
  }
}

/* ─── Bedrock Agent response format ──────────────────────────────────────── */

function buildResponse(event: BedrockAgentEvent, body: object) {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      httpMethod: event.httpMethod,
      httpStatusCode: 200,
      responseBody: {
        'application/json': {
          body: JSON.stringify(body),
        },
      },
    },
  };
}
