/**
 * DOCX EXPORTER
 * Converts AI-generated markdown content into a professional .docx file
 * using the `docx` library that is already installed in this project.
 *
 * Supports:
 * - Cover page with metadata
 * - Heading levels (H1 / H2 / H3)
 * - Paragraphs and bullet lists
 * - Tables (pipe syntax)
 * - Bold / italic inline formatting
 * - Header / footer with report ID and client name
 * - Page breaks between major sections
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertMillimetersToTwip,
  PageOrientation,
  Header,
  Footer,
  SectionType,
} from 'docx';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DocxDocumentMeta {
  title: string;
  subtitle?: string;
  preparedFor: string;
  preparedBy: string;
  date: string;
  reportId: string;
  classification: string;
  jurisdiction?: string;
  strategicReadiness?: number;
  evidenceCredibility?: number;
  perceptionRealityGap?: number;
  topRegionalOpportunities?: Array<{ place: string; score: number; reason?: string[] }>;
  engagementDraftHints?: {
    governmentLetterFocus?: string[];
    partnerLetterFocus?: string[];
    investorBriefFocus?: string[];
  };
}

// ── Inline formatting parser ──────────────────────────────────────────────────

function parseInline(text: string): TextRun[] {
  // Handles **bold**, *italic*, ***bold-italic***
  const runs: TextRun[] = [];
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+))/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], bold: true }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5] }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text })];
}

// ── Markdown → docx block converter ─────────────────────────────────────────

type Block = Paragraph | Table;

function parseMarkdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines that produce no content
    if (!trimmed) { i++; continue; }

    // H1
    if (/^# /.test(trimmed)) {
      blocks.push(new Paragraph({
        text: trimmed.replace(/^# /, ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
      }));
      i++; continue;
    }

    // H2
    if (/^## /.test(trimmed)) {
      blocks.push(new Paragraph({
        text: trimmed.replace(/^## /, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      }));
      i++; continue;
    }

    // H3
    if (/^### /.test(trimmed)) {
      blocks.push(new Paragraph({
        text: trimmed.replace(/^### /, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 60 },
      }));
      i++; continue;
    }

    // Horizontal rule — page-break-style separator
    if (/^---+$/.test(trimmed)) {
      blocks.push(new Paragraph({ text: '', pageBreakBefore: true }));
      i++; continue;
    }

    // Bullet list item
    if (/^[-*•]\s/.test(trimmed)) {
      blocks.push(new Paragraph({
        children: parseInline(trimmed.replace(/^[-*•]\s+/, '')),
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
      }));
      i++; continue;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(trimmed)) {
      blocks.push(new Paragraph({
        children: parseInline(trimmed.replace(/^\d+\.\s+/, '')),
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 40, after: 40 },
      }));
      i++; continue;
    }

    // Table (pipe syntax)
    if (/^\|/.test(trimmed)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const table = parsePipeTable(tableLines);
      if (table) blocks.push(table);
      continue;
    }

    // Regular paragraph
    if (trimmed.length > 0) {
      blocks.push(new Paragraph({
        children: parseInline(trimmed),
        spacing: { before: 80, after: 80 },
      }));
    }

    i++;
  }

  return blocks;
}

function parsePipeTable(lines: string[]): Table | null {
  const dataLines = lines.filter(l => !/^\s*\|[-:| ]+\|\s*$/.test(l));
  if (dataLines.length === 0) return null;

  const parseRow = (line: string): string[] =>
    line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

  const [headerLine, ...bodyLines] = dataLines;
  const headers = parseRow(headerLine);
  const colCount = headers.length;
  const colWidth = Math.floor(9000 / colCount); // total ~9000 twips for a normal page width

  const headerRow = new TableRow({
    children: headers.map(h => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true })],
        alignment: AlignmentType.LEFT,
      })],
      width: { size: colWidth, type: WidthType.DXA },
    })),
    tableHeader: true,
  });

  const bodyRows = bodyLines.map(line => {
    const cells = parseRow(line);
    return new TableRow({
      children: Array.from({ length: colCount }, (_, ci) =>
        new TableCell({
          children: [new Paragraph({
            children: parseInline(cells[ci] ?? ''),
          })],
          width: { size: colWidth, type: WidthType.DXA },
        })
      ),
    });
  });

  return new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      left:   { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      right:  { style: BorderStyle.SINGLE, size: 1, color: 'AAAAAA' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });
}

// ── Cover page ───────────────────────────────────────────────────────────────

function buildCoverPage(meta: DocxDocumentMeta): Paragraph[] {
  return [
    new Paragraph({ text: '', spacing: { before: 0, after: 800 } }),
    new Paragraph({
      children: [new TextRun({ text: meta.classification, bold: true, size: 20, color: 'CC0000' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: meta.title, bold: true, size: 52, color: '1a365d' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    }),
    ...(meta.subtitle ? [new Paragraph({
      children: [new TextRun({ text: meta.subtitle, size: 32, color: '2c5282' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
    })] : []),
    new Paragraph({ text: '', spacing: { before: 400, after: 0 } }),
    new Paragraph({
      children: [new TextRun({ text: `Prepared for: `, bold: true, size: 22 }), new TextRun({ text: meta.preparedFor, size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Prepared by: `, bold: true, size: 22 }), new TextRun({ text: meta.preparedBy, size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Date: `, bold: true, size: 22 }), new TextRun({ text: meta.date, size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Reference: `, bold: true, size: 20, color: '666666' }), new TextRun({ text: meta.reportId, size: 20, color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `CONFIDENTIAL — Not for distribution without prior written authorisation. Prepared exclusively for the named recipient.`, size: 16, color: '888888', italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 0 },
    }),
    // Force page break after cover
    new Paragraph({ text: '', pageBreakBefore: false, run: { break: 1 } as never }),
  ];
}

function buildStrategicIntelligenceAppendix(meta: DocxDocumentMeta): Paragraph[] {
  const hasStrategicSignals =
    typeof meta.strategicReadiness === 'number'
    || typeof meta.evidenceCredibility === 'number'
    || typeof meta.perceptionRealityGap === 'number'
    || (meta.topRegionalOpportunities?.length ?? 0) > 0
    || (meta.engagementDraftHints?.governmentLetterFocus?.length ?? 0) > 0
    || (meta.engagementDraftHints?.partnerLetterFocus?.length ?? 0) > 0
    || (meta.engagementDraftHints?.investorBriefFocus?.length ?? 0) > 0;

  if (!hasStrategicSignals) return [];

  const lines: Paragraph[] = [
    new Paragraph({ text: 'Strategic Intelligence Appendix', heading: HeadingLevel.HEADING_1, spacing: { before: 220, after: 120 } }),
  ];

  if (typeof meta.strategicReadiness === 'number' || typeof meta.evidenceCredibility === 'number' || typeof meta.perceptionRealityGap === 'number') {
    lines.push(new Paragraph({ text: 'Core Strategic Scores', heading: HeadingLevel.HEADING_2, spacing: { before: 140, after: 80 } }));
    if (typeof meta.strategicReadiness === 'number') {
      lines.push(new Paragraph({ children: parseInline(`- Strategic readiness: **${meta.strategicReadiness}%**`), bullet: { level: 0 } }));
    }
    if (typeof meta.evidenceCredibility === 'number') {
      lines.push(new Paragraph({ children: parseInline(`- Evidence credibility: **${meta.evidenceCredibility}%**`), bullet: { level: 0 } }));
    }
    if (typeof meta.perceptionRealityGap === 'number') {
      lines.push(new Paragraph({ children: parseInline(`- Perception vs reality gap: **${meta.perceptionRealityGap}**`), bullet: { level: 0 } }));
    }
  }

  if ((meta.topRegionalOpportunities?.length ?? 0) > 0) {
    lines.push(new Paragraph({ text: 'Top Overlooked Regional Opportunities', heading: HeadingLevel.HEADING_2, spacing: { before: 140, after: 80 } }));
    meta.topRegionalOpportunities!.slice(0, 5).forEach((opportunity, index) => {
      lines.push(new Paragraph({
        children: parseInline(`${index + 1}. **${opportunity.place}** — Opportunity score: **${opportunity.score}**`),
        spacing: { before: 60, after: 40 }
      }));
      (opportunity.reason || []).slice(0, 3).forEach((reason) => {
        lines.push(new Paragraph({ children: parseInline(`- ${reason}`), bullet: { level: 0 } }));
      });
    });
  }

  const addFocusGroup = (title: string, items?: string[]) => {
    if (!items || items.length === 0) return;
    lines.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_3, spacing: { before: 120, after: 50 } }));
    items.slice(0, 5).forEach((item) => {
      lines.push(new Paragraph({ children: parseInline(`- ${item}`), bullet: { level: 0 } }));
    });
  };

  if (meta.engagementDraftHints) {
    lines.push(new Paragraph({ text: 'Engagement Conversion Focus', heading: HeadingLevel.HEADING_2, spacing: { before: 140, after: 80 } }));
    addFocusGroup('Government Letter Focus', meta.engagementDraftHints.governmentLetterFocus);
    addFocusGroup('Partner Letter Focus', meta.engagementDraftHints.partnerLetterFocus);
    addFocusGroup('Investor Brief Focus', meta.engagementDraftHints.investorBriefFocus);
  }

  lines.push(new Paragraph({ text: '', spacing: { before: 80, after: 80 } }));
  return lines;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Converts markdown content + metadata into a .docx Blob.
 * Resolves to a Blob that can be downloaded directly in-browser.
 */
export async function exportToDocx(
  markdown: string,
  meta: DocxDocumentMeta
): Promise<Blob> {
  const contentBlocks = parseMarkdownToBlocks(markdown);
  const strategicAppendix = buildStrategicIntelligenceAppendix(meta);

  const headerPara = new Paragraph({
    children: [
      new TextRun({ text: `${meta.title} — ${meta.preparedFor}`, size: 16, color: '666666' }),
    ],
    alignment: AlignmentType.RIGHT,
  });

  const footerPara = new Paragraph({
    children: [
      new TextRun({ text: `${meta.classification} | ${meta.reportId} | ${meta.preparedBy}`, size: 16, color: '888888' }),
    ],
    alignment: AlignmentType.CENTER,
  });

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: 'decimal' as never,
          text: '%1.',
          alignment: AlignmentType.LEFT,
        }],
      }],
    },
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
          paragraph: { spacing: { line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { bold: true, size: 36, color: '1a365d', font: 'Calibri' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { bold: true, size: 28, color: '2c5282', font: 'Calibri' },
          paragraph: { spacing: { before: 200, after: 80 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          run: { bold: true, size: 24, color: '4a5568', font: 'Calibri' },
          paragraph: { spacing: { before: 160, after: 60 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: {
              top: convertMillimetersToTwip(25),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(30),
              right: convertMillimetersToTwip(25),
            },
            size: { orientation: PageOrientation.PORTRAIT },
          },
        },
        headers: { default: new Header({ children: [headerPara] }) },
        footers: { default: new Footer({ children: [footerPara] }) },
        children: [
          ...buildCoverPage(meta),
          ...strategicAppendix,
          ...contentBlocks,
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

/**
 * Triggers a browser download of the DOCX file.
 */
export async function downloadAsDocx(
  markdown: string,
  meta: DocxDocumentMeta,
  filename?: string
): Promise<void> {
  const blob = await exportToDocx(markdown, meta);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `${meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
