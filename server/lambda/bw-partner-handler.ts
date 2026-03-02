/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — LAMBDA: Partner Action Handler
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * AWS Lambda function invoked by Bedrock Agent for strategic partner identification.
 * Mirrors PartnerIntelligenceEngine for the Lambda context.
 *
 * Action Group: PartnerAction
 * Function:     bw-partner-handler
 *
 * Deploy:
 *   Function name : bw-partner-handler
 *   Runtime       : nodejs20.x
 *   Handler       : bw-partner-handler.handler
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
    temperature: 0.4,
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
  const partnerType      = get('partnerType')       || 'strategic';

  try {
    const system =
      'You are a strategic partnership analyst for BW Global Advisory. ' +
      'Identify real, named organisations as potential partners — not generic categories. ' +
      'Consider government bodies, multilaterals, private sector leaders, and development banks.';

    const prompt =
      `Identify strategic partners for:\n\n` +
      `Organisation: ${organizationName}\n` +
      `Country/Region: ${country}\n` +
      `Sector: ${sector}\n` +
      `Partnership Type Sought: ${partnerType}\n\n` +
      `Return a JSON object:\n` +
      `{\n` +
      `  "partnerCount": <number of partners identified>,\n` +
      `  "partners": [\n` +
      `    {\n` +
      `      "name": "<organisation name>",\n` +
      `      "type": "<Government|Multilateral|Private|Development Bank|NGO>",\n` +
      `      "country": "<country>",\n` +
      `      "relevanceScore": <0-100>,\n` +
      `      "partnershipRationale": "<why this partner>",\n` +
      `      "engagementApproach": "<how to approach>",\n` +
      `      "keyContact": "<team/department if known, or 'Research Required'>",\n` +
      `      "timeline": "<estimated engagement timeline>"\n` +
      `    }\n` +
      `  ],\n` +
      `  "priorityPartner": "<name of highest-priority partner>",\n` +
      `  "ecosystemSummary": "<2-3 sentences on the partnership landscape>"\n` +
      `}\n\nIdentify 5-8 real, named organisations. Return ONLY valid JSON.`;

    const rawPartners = await callTogether(prompt, system);

    let partnerData: Record<string, unknown> = {};
    try {
      const cleaned = rawPartners.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      partnerData = JSON.parse(cleaned);
    } catch {
      partnerData = { ecosystemSummary: rawPartners, partnerCount: 0, partners: [] };
    }

    return buildResponse(event, {
      partners: JSON.stringify(partnerData),
      organizationName,
      country,
      sector,
      partnerCount: partnerData.partnerCount ?? 0,
      priorityPartner: partnerData.priorityPartner ?? '',
    });

  } catch (error) {
    return buildResponse(event, {
      partners: '{}',
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
