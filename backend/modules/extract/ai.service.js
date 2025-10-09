const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Helper: build one user message with text + (optionally) images.
 * For now we pass the concatenated text. In Step 7 we’ll add images for scanned PDFs.
 */
function buildUserContent({ text, images = [] }) {
    const content = [];
    if (text && text.trim().length) {
      // new SDK expects 'input_text'
      content.push({ type: 'input_text', text });
    }
    for (const img of images) {
      // vision inputs still use 'input_image'
      content.push({ type: 'input_image', image_url: img });
    }
    return content;
  }
  

/**
 * Ask the model to produce STRICT JSON of important fields.
 * It will work even if the keys vary (UCI, Application Number, etc.)
 */
async function extractImportantFields({ text, images = [] }) {
  const system = `You are a document intake assistant.
Return ONLY a single JSON object with key:value pairs of IMPORTANT fields you detect.
- Do NOT include explanations.
- Use short, human-readable keys (e.g., Name, DateOfBirth, UCI, ApplicationNumber, PassportNumber, Program, College, Country, etc.).
- Keep dates in ISO if possible (YYYY-MM-DD).
- If unsure, omit the key.`;

  const userContent = buildUserContent({ text, images });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    input: [
      { role: 'system', content: system },
      { role: 'user', content: userContent }
    ]
  });

  // Try to parse JSON safely
  let json;
  try {
    const raw = response.output_text || '';
    json = JSON.parse(raw);
  } catch (e) {
    // Fallback: try to find JSON substring
    const raw = (response.output_text || '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end >= start) {
      try { json = JSON.parse(raw.slice(start, end + 1)); } catch (_) { json = {}; }
    } else {
      json = {};
    }
  }
  // Ensure object
  if (!json || typeof json !== 'object' || Array.isArray(json)) json = {};
  return json;
}

module.exports = { extractImportantFields };
