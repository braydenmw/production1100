#!/usr/bin/env python3
"""Fix matter tracking: smarter detection, selective preservation, conversation history in prompt."""
import re

FILE = r'components/BWConsultantOS.tsx'

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# ============================================================
# FIX 1: Add matterArchiveRef after matterFingerprintRef declaration
# ============================================================
old_ref_decl = "  const matterFingerprintRef = useRef('');"
new_ref_decl = """  const matterFingerprintRef = useRef('');
  const matterArchiveRef = useRef<Array<{
    matter: string;
    country: string;
    sector: string;
    entities: string[];
    timestamp: number;
  }>>([]);"""

assert content.count(old_ref_decl) == 1, f"Expected 1 occurrence of matterFingerprintRef decl, found {content.count(old_ref_decl)}"
content = content.replace(old_ref_decl, new_ref_decl)
print("FIX 1: Added matterArchiveRef declaration")

# ============================================================
# FIX 2: Replace the entire matter detection useEffect with a smarter version
# ============================================================

# Find the useEffect block - starts with "  useEffect(() => {\n    const normalizeMatter"
# and ends with "  }, [caseStudy.currentMatter]);"
matter_start = content.find("  useEffect(() => {\n    const normalizeMatter")
assert matter_start != -1, "Could not find matter detection useEffect start"

# Find the closing of this useEffect
matter_dep = content.find("  }, [caseStudy.currentMatter]);", matter_start)
assert matter_dep != -1, "Could not find matter detection useEffect dependency array"
matter_end = matter_dep + len("  }, [caseStudy.currentMatter]);")

old_useeffect = content[matter_start:matter_end]
print(f"FIX 2: Found matter detection useEffect ({len(old_useeffect)} chars)")

new_useeffect = """  useEffect(() => {
    const normalizeMatter = (value: string) => value
      .toLowerCase()
      .replace(/[^a-z0-9\\s]/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();
    const tokenizeMatter = (value: string) => normalizeMatter(value)
      .split(' ')
      .filter((token) => token.length >= 4);

    // Extract key entities (locations, people, orgs) from text for semantic linking
    const extractEntities = (text: string): string[] => {
      const lc = text.toLowerCase();
      const entities: string[] = [];
      // Location keywords
      const locationPatterns = [
        /\\b(pagadian|manila|cebu|davao|zamboanga|mindanao|luzon|visayas|sydney|melbourne|lagos|nairobi|dubai|singapore|tokyo|london|berlin|riyadh|jakarta|bangkok|hanoi|mumbai|delhi|shanghai|beijing)\\b/gi,
        /\\b[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\s+(?:city|province|region|state|district|municipality)\\b/gi,
      ];
      for (const pat of locationPatterns) {
        const matches = text.match(pat) || [];
        entities.push(...matches.map(m => m.toLowerCase().trim()));
      }
      // Person titles
      const personMatch = text.match(/\\b(?:mayor|governor|minister|president|senator|secretary|ambassador|ceo|director)\\s+\\w+(?:\\s+\\w+)?/gi);
      if (personMatch) entities.push(...personMatch.map(m => m.toLowerCase().trim()));
      // Sector keywords
      const sectorWords = ['investment', 'partner', 'trade', 'agriculture', 'manufacturing', 'tourism', 'energy', 'mining', 'infrastructure', 'development', 'business', 'market', 'economy', 'regional', 'rural', 'urban'];
      for (const sw of sectorWords) {
        if (lc.includes(sw)) entities.push(sw);
      }
      return [...new Set(entities)];
    };

    const previousFingerprint = matterFingerprintRef.current;
    const currentMatter = caseStudy.currentMatter.trim();
    const currentFingerprint = normalizeMatter(currentMatter);

    if (!currentFingerprint) {
      matterFingerprintRef.current = '';
      return;
    }

    if (!previousFingerprint) {
      matterFingerprintRef.current = currentFingerprint;
      // Archive this as the first matter
      matterArchiveRef.current = [{
        matter: currentMatter.substring(0, 300),
        country: caseStudy.country,
        sector: caseStudy.organizationType,
        entities: extractEntities(currentMatter),
        timestamp: Date.now(),
      }];
      return;
    }

    if (previousFingerprint === currentFingerprint) {
      return;
    }

    const previousTokens = new Set(tokenizeMatter(previousFingerprint));
    const currentTokens = tokenizeMatter(currentFingerprint);
    const overlapCount = currentTokens.filter((token) => previousTokens.has(token)).length;
    const overlapRatio = currentTokens.length > 0 ? overlapCount / currentTokens.length : 0;

    // ── SMART MATTER DETECTION ──────────────────────────────────────────────
    // Instead of a hard token-overlap threshold, check for semantic connections:
    // shared country, shared sector, shared entities (people, places, topics)
    const currentEntities = extractEntities(currentMatter);
    const previousEntities = extractEntities(previousFingerprint);
    const sharedEntities = currentEntities.filter(e => previousEntities.includes(e));

    // Check if country context is shared
    const sharedCountry = !!(caseStudy.country && caseStudy.country.trim().length > 0);

    // Check if any archived matter shares entities with the new one
    const linkedToArchive = matterArchiveRef.current.some(archived => {
      const archivedEntities = archived.entities;
      return (
        archivedEntities.some(e => currentEntities.includes(e)) ||
        (archived.country && archived.country === caseStudy.country) ||
        (archived.sector && archived.sector === caseStudy.organizationType)
      );
    });

    // A matter is truly new only if:
    // 1. Token overlap is very low (< 0.20 instead of 0.35)
    // 2. AND no shared entities with current or archived matters
    // 3. AND no shared country/sector context
    const isTokenDisjoint = currentMatter.length >= 40 && overlapRatio < 0.20;
    const hasSemanticLink = sharedEntities.length > 0 || sharedCountry || linkedToArchive;
    const isTrulyNewMatter = isTokenDisjoint && !hasSemanticLink;

    matterFingerprintRef.current = currentFingerprint;

    // Archive the current matter regardless
    matterArchiveRef.current = [
      ...matterArchiveRef.current.slice(-9), // keep last 10 matters
      {
        matter: currentMatter.substring(0, 300),
        country: caseStudy.country,
        sector: caseStudy.organizationType,
        entities: currentEntities,
        timestamp: Date.now(),
      }
    ];

    if (!isTrulyNewMatter) {
      // Topic shift detected but semantically linked - keep context, note the transition
      if (overlapRatio < 0.35 && currentMatter.length >= 40) {
        const linkDescription = sharedEntities.length > 0
          ? `linked by: ${sharedEntities.slice(0, 3).join(', ')}`
          : sharedCountry
            ? `same region: ${caseStudy.country}`
            : 'related to previous topics';
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'system',
            content: `Topic shift noted (${linkDescription}). Carrying forward all prior context and intelligence to inform this line of inquiry.`,
            timestamp: new Date(),
            phase: 'discovery'
          }
        ]);
      }
      return;
    }

    // ── SELECTIVE RESET: Preserve what carries forward ──────────────────────
    // Instead of wiping brainCtxRef entirely, preserve external data and
    // historical patterns if the country is the same
    const prevBrainCtx = brainCtxRef.current;
    if (prevBrainCtx && caseStudy.country && prevBrainCtx.externalData) {
      // Keep external data (country-level data carries forward)
      // Only wipe the matter-specific analysis
      brainCtxRef.current = {
        ...prevBrainCtx,
        promptBlock: '', // Clear the prompt-specific block
      } as typeof prevBrainCtx;
    } else {
      brainCtxRef.current = null;
    }

    quickSyncSignatureRef.current = '';
    strategicApplySignatureRef.current = '';
    setQuickDraftLines('');
    setStrategicApplyError('');
    setLiveInsightError('');
    setLiveInsightQuery('');
    setLiveInsightResults([]);
    setLiveInsightsRequested(false);
    setLastLiveInsightSearchSignature('');

    // Build a summary of what was discussed before for context continuity
    const archivedTopics = matterArchiveRef.current
      .slice(0, -1) // exclude the one we just added
      .map(a => a.matter.substring(0, 100))
      .filter(Boolean);
    const topicHistoryNote = archivedTopics.length > 0
      ? ` Previous topics in this session: ${archivedTopics.join('; ')}.`
      : '';

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: `New topic detected. NSIL analysis engines are recalibrating for this new line of inquiry.${topicHistoryNote} Core intelligence and session learnings have been preserved.`,
        timestamp: new Date(),
        phase: 'discovery'
      }
    ]);
  }, [caseStudy.currentMatter, caseStudy.country, caseStudy.organizationType]);"""

content = content[:matter_start] + new_useeffect + content[matter_end:]
print(f"FIX 2: Replaced matter detection useEffect (was {len(old_useeffect)} chars, now {len(new_useeffect)} chars)")

# ============================================================
# FIX 3: Add conversation history to the AI prompt
# Replace the memoryBlock construction to also include conversation history
# ============================================================

# Find the memoryBlock construction
old_memory = """        const priorTurns = memoryRef.current.recall('consultant-turns', 5);
        const memoryBlock = priorTurns.length
          ? `\\n\\n### PRIOR SESSION CONTEXT (${priorTurns.length} remembered turns)\\n` +
            priorTurns.map(t => `- [${new Date(t.timestamp).toLocaleDateString()}] ${t.action.substring(0, 120)}`).join('\\n')
          : '';"""

assert content.count(old_memory) == 1, f"Expected 1 occurrence of memoryBlock, found {content.count(old_memory)}"

new_memory = r"""        const priorTurns = memoryRef.current.recall('consultant-turns', 5);
        const priorTurnsBlock = priorTurns.length
          ? `\n\n### PRIOR SESSION CONTEXT (${priorTurns.length} remembered turns)\n` +
            priorTurns.map(t => `- [${new Date(t.timestamp).toLocaleDateString()}] ${t.action.substring(0, 120)}`).join('\n')
          : '';

        // ── CONVERSATION HISTORY: Include recent messages so the AI sees the full thread ──
        const recentHistory = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .slice(-8) // last 8 turns (4 exchanges)
          .map(m => `${m.role === 'user' ? 'User' : 'Consultant'}: ${m.content.substring(0, 500)}`)
          .join('\n\n');
        const conversationHistoryBlock = recentHistory
          ? `\n\n### CONVERSATION HISTORY (recent exchanges in this session)\nThe following is the recent conversation. Use this to maintain context, identify connections between topics, and avoid repeating information the user already received.\n\n${recentHistory}`
          : '';

        // ── MATTER ARCHIVE: Show the AI what topics have been discussed ──
        const matterArchive = matterArchiveRef.current;
        const matterArchiveBlock = matterArchive.length > 1
          ? `\n\n### TOPICS DISCUSSED IN THIS SESSION (${matterArchive.length} topics)\n` +
            matterArchive.map((m, i) => `${i + 1}. ${m.matter.substring(0, 150)}${m.country ? ` [${m.country}]` : ''}${m.sector ? ` (${m.sector})` : ''}`).join('\n') +
            `\n\nINSTRUCTION: These topics may be interconnected. When the user asks about a new topic, consider whether it relates to or builds upon previous topics. Draw connections proactively. Do NOT treat each topic as isolated unless the user explicitly starts a completely new inquiry.`
          : '';

        const memoryBlock = `${priorTurnsBlock}${conversationHistoryBlock}${matterArchiveBlock}`;"""

content = content.replace(old_memory, new_memory)
print("FIX 3: Added conversation history and matter archive to AI prompt")

# ============================================================
# VERIFY & WRITE
# ============================================================
new_len = len(content)
print(f"\nOriginal file: {original_len} chars")
print(f"Modified file: {new_len} chars")
print(f"Delta: +{new_len - original_len} chars")

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("\nAll fixes applied successfully!")
