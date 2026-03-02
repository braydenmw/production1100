/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — LAMBDA: Document Action Handler
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * AWS Lambda function invoked by Bedrock Agent to generate a complete document.
 * This is the core document generation action — called once per document type.
 *
 * Action Group: DocumentAction
 * Function:     bw-document-handler
 *
 * Deploy:
 *   Function name : bw-document-handler
 *   Runtime       : nodejs20.x
 *   Handler       : bw-document-handler.handler
 *   Timeout       : 300s   ← document generation can take 2-4 mins
 *   Memory        : 1024 MB
 *   Env vars      : TOGETHER_API_KEY, TOGETHER_MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import https from 'https';

const TOGETHER_URL   = 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.1-70B-Instruct-Turbo';

async function callTogether(
  userPrompt: string,
  systemPrompt: string,
  maxTokens = 4000
): Promise<string> {
  const key = process.env.TOGETHER_API_KEY || '';
  if (!key) throw new Error('TOGETHER_API_KEY not set in Lambda environment');

  const body = JSON.stringify({
    model: TOGETHER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.4,
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

// Document type → section definitions (simplified for Lambda)
// Full catalog is in DocumentTypeRouter on the frontend
const DOCUMENT_SECTIONS: Record<string, string[]> = {
  'strategic-investment-brief':     ['Executive Summary','Market Analysis','Investment Rationale','Risk Assessment','Financial Projections','Recommendations'],
  'partnership-proposal':           ['Cover','Executive Summary','Partnership Overview','Value Proposition','Implementation Plan','Commercial Terms','Risk Mitigation'],
  'country-risk-report':            ['Executive Summary','Political Landscape','Economic Environment','Regulatory Framework','Security Assessment','Recommendations'],
  'market-entry-strategy':          ['Overview','Market Assessment','Competitive Analysis','Entry Strategy','Financial Model','Go-to-Market Plan','Risk Register'],
  'government-funding-proposal':    ['Cover Letter','Project Summary','Needs Assessment','Project Design','Implementation Timeline','Budget','Monitoring & Evaluation'],
  'due-diligence-report':           ['Executive Summary','Entity Overview','Legal Assessment','Financial Analysis','Operational Review','Risk Summary','Conclusions'],
  'stakeholder-briefing':           ['Purpose','Key Messages','Background','Current Situation','Options','Recommended Course of Action','Next Steps'],
  'mou-framework':                  ['Parties','Recitals','Purpose','Scope of Cooperation','Roles & Responsibilities','Governance','Duration','Signatures'],
};

export async function handler(event: BedrockAgentEvent) {
  console.log('[bw-document-handler] Event:', JSON.stringify(event, null, 2));

  const params = [
    ...(event.parameters || []),
    ...(event.requestBody?.content?.['application/json']?.properties || []),
  ];
  const get = (name: string) => params.find(p => p.name === name)?.value || '';

  const typeId           = get('typeId')           || 'strategic-investment-brief';
  const organizationName = get('organizationName') || 'Unknown Organisation';
  const country          = get('country')          || '';
  const sector           = get('sector')           || 'General';
  const caseContext      = get('caseContext')       || `${organizationName} | ${country} | ${sector}`;
  const brainBlock       = get('brainBlock')        || '';
  const documentTitle    = get('documentTitle')     || typeId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const sections = DOCUMENT_SECTIONS[typeId] || [
    'Executive Summary','Background','Analysis','Recommendations','Conclusion'
  ];

  const system =
    'You are a senior BW Global Advisory document specialist. ' +
    'Write professional, evidence-based content suitable for government and executive audiences. ' +
    'Use formal tone. Be specific and analytical — not generic.';

  try {
    const sectionContents: string[] = [];

    for (const sectionTitle of sections) {
      const sectionPrompt =
        `Write the "${sectionTitle}" section for a ${documentTitle}.\n\n` +
        `Case Context:\n${caseContext}\n\n` +
        (brainBlock ? `Intelligence Context:\n${brainBlock.slice(0, 1000)}\n\n` : '') +
        `Requirements:\n` +
        `- 300-500 words\n` +
        `- Professional, executive-level tone\n` +
        `- Specific to ${organizationName} and ${country}\n` +
        `- Include concrete data points, risks, or recommendations\n` +
        `- Markdown formatted with sub-headings where appropriate\n\n` +
        `Write only the section content — no section title header needed.`;

      const content = await callTogether(sectionPrompt, system, 1500);
      sectionContents.push(`## ${sectionTitle}\n\n${content}`);
    }

    const fullMarkdown =
      `# ${documentTitle}\n\n` +
      `**Organisation:** ${organizationName}\n` +
      `**Country:** ${country}\n` +
      `**Sector:** ${sector}\n` +
      `**Date:** ${new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}\n` +
      `**Classification:** CONFIDENTIAL\n` +
      `**Prepared by:** BW Global Advisory — NEXUS Intelligence OS v4.1\n\n` +
      `---\n\n` +
      sectionContents.join('\n\n---\n\n');

    return buildResponse(event, {
      document: fullMarkdown,
      typeId,
      typeName: documentTitle,
      organizationName,
      country,
      sectionCount: sections.length,
      wordCount: fullMarkdown.split(/\s+/).length,
    });

  } catch (error) {
    console.error('[bw-document-handler] Error:', error);
    return buildResponse(event, {
      document: '',
      typeId,
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
