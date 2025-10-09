const { pdfToImages } = require('./pdf-to-images');
const { extractImportantFields } = require('./ai.service');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text || '';
  }
  if (mimeType.includes('word') || filePath.endsWith('.docx')) {
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value || '';
  }
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

async function extractProfileWithAI(files) {
  let combinedText = '';
  for (const f of files) {
    const t = await extractTextFromFile(f.path, f.mimetype);
    if (t && t.trim().length) combinedText += '\n' + t;
  }

  // if text found → normal flow
  if (combinedText.trim().length > 50) {
    return await extractImportantFields({ text: combinedText });
  }

  // else vision flow for scanned PDFs / images
  const allImages = [];
  for (const f of files) {
    if (f.mimetype === 'application/pdf') {
      console.log('Vision mode: converting full PDF to images...');
      const imgs = await pdfToImages(f.path);
      allImages.push(...imgs);
    } else if (f.mimetype.startsWith('image/')) {
      const base64 = fs.readFileSync(f.path).toString('base64');
      allImages.push(`data:${f.mimetype};base64,${base64}`);
    }
  }

  if (!allImages.length) return {};

  console.log(`Vision mode: sending ${allImages.length} images to AI…`);
  const profile = await extractImportantFields({ text: '', images: allImages });
  return profile;
}

module.exports = { extractProfileWithAI, extractTextFromFile };
