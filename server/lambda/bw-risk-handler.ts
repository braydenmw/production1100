/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — LAMBDA: Risk Action Handler
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * AWS Lambda function invoked by Bedrock Agent for adversarial risk assessment.
 * Mirrors AdversarialReasoningService for the Lambda context.
 *
 * Action Group: RiskAction
 * Function:     bw-risk-handler
 *
 * Deploy:
 *   Function name : bw-risk-handler
 *   Runtime       : nodejs20.x
 *   Handler       : bw-risk-handler.handler
 *   Timeout       : 60s
 *   Memory        : 512 MB
 *   Env vars      : TOGETHER_API_KEY, TOGETHER_MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import https from 'https';

const TOGETHER_URL   = 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.1-70B-Instruct-Turbo';

async function callTogether(userPrompt: string, systemPrompt: string): Promise<string> {
  const key = process.env.TOGETHER_API_KEY || '';
  if (!key) throw new Error('TOGETHER_API_KEY not set');

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
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
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
    content: { 'application/json': { properties: Array<{ name: string; type: string; value: string }> } };
  };
}

export async function handler(event: BedrockAgentEvent) {
  const params = [
    ...(event.parameters || []),
    ...(event.requestBody?.content?.['application/json']?.properties || []),
  ];
  const get = (name: string) => params.find(p => p.name === name)?.value || '';

  const organizationName = get('organizationName') || 'Unknown Organisation';
  const country          = get('country')           || '';
  const sector           = get('sector')            || 'General';
  const dealType         = get('dealType')          || 'strategic partnership';

  try {
    const system =
      'You are an adversarial risk analyst for BW Global Advisory. ' +
      'Identify real, specific risks — not generic platitudes. ' +
      'Think like a red team: what could go wrong?';

    const prompt =
      `Conduct an adversarial risk assessment for:\n\n` +
      `Organisation: ${organizationName}\n` +
      `Country: ${country}\n` +
      `Sector: ${sector}\n` +
      `Deal/Engagement Type: ${dealType}\n\n` +
      `Return a JSON object with:\n` +
      `{\n` +
      `  "overallRiskScore": <0-100, where 100=maximum risk>,\n` +
      `  "riskRating": "<Low|Medium|High|Critical>",\n` +
      `  "politicalRisks": [{"risk":"<text>","likelihood":"<Low|Med|High>","impact":"<Low|Med|High>","mitigation":"<text>"}],\n` +
      `  "economicRisks": [{"risk":"<text>","likelihood":"<Low|Med|High>","impact":"<Low|Med|High>","mitigation":"<text>"}],\n` +
      `  "regulatoryRisks": [{"risk":"<text>","likelihood":"<Low|Med|High>","impact":"<Low|Med|High>","mitigation":"<text>"}],\n` +
      `  "reputationalRisks": [{"risk":"<text>","likelihood":"<Low|Med|High>","impact":"<Low|Med|High>","mitigation":"<text>"}],\n` +
      `  "keyMitigations": ["<action1>","<action2>","<action3>"],\n` +
      `  "dealBreakers": ["<blocker1>","<blocker2>"],\n` +
      `  "summary": "<2-3 sentence risk summary>"\n` +
      `}\n\nReturn ONLY valid JSON.`;

    const rawRisk = await callTogether(prompt, system);

    let riskData: Record<string, unknown> = {};
    try {
      const cleaned = rawRisk.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      riskData = JSON.parse(cleaned);
    } catch {
      riskData = { summary: rawRisk, overallRiskScore: 50, riskRating: 'Medium' };
    }

    return buildResponse(event, {
      risks: JSON.stringify(riskData),
      organizationName,
      country,
      sector,
      riskRating: riskData.riskRating ?? 'Medium',
      overallRiskScore: riskData.overallRiskScore ?? 50,
    });

  } catch (error) {
    return buildResponse(event, {
      risks: '{}',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function buildResponse(event: BedrockAgentEvent, body: object) {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup: event.actionGroup, apiPath: event.apiPath, httpMethod: event.httpMethod,
      httpStatusCode: 200,
      responseBody: { 'application/json': { body: JSON.stringify(body) } },
    },
  };
}
