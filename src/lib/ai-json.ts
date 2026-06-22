/**
 * Parses JSON content from the raw model response.
 * Tries multiple strategies: fenced code block, raw JSON.parse, and
 * extracting the first `{...}` object from mixed markdown/text.
 */
export function parseJsonFromModelText(text: string): any {
  // Strategy 1: Extract from ```json ... ``` fenced code block
  const fenceMatch = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/.exec(text);
  if (fenceMatch) {
    const content = fenceMatch[1].trim();
    try {
      return JSON.parse(content);
    } catch {
      try {
        const cleaned = content.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch { /* fall through */ }
    }
  }

  // Strategy 2: Try parsing the raw text directly
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const cleaned = trimmed.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(cleaned);
    } catch { /* fall through */ }
  }

  // Strategy 3: Find all combinations of opening '{' and closing '}' and try to parse the substrings.
  // Sort them by length descending to prioritize the main JSON block over smaller fragments.
  const braceIndices: number[] = [];
  let idx = text.indexOf("{");
  while (idx !== -1) {
    braceIndices.push(idx);
    idx = text.indexOf("{", idx + 1);
  }

  const closeIndices: number[] = [];
  let cIdx = text.lastIndexOf("}");
  while (cIdx !== -1) {
    closeIndices.push(cIdx);
    if (cIdx === 0) break;
    cIdx = text.lastIndexOf("}", cIdx - 1);
  }

  const candidates: string[] = [];
  for (const start of braceIndices) {
    for (const end of closeIndices) {
      if (end > start) {
        candidates.push(text.substring(start, end + 1));
      }
    }
  }

  // Sort by length descending
  candidates.sort((a, b) => b.length - a.length);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(cleaned);
      } catch { /* fall through */ }
    }
  }

  throw new Error(
    `Could not extract valid JSON from AI response. Response starts with: "${text.substring(0, 120)}..."`
  );
}
