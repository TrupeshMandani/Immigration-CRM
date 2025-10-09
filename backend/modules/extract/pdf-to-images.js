const pdf2img = require('pdf-img-convert');

async function pdfToImages(pdfPath) {
  // converts *all* pages to images; no hard limit
  const images = await pdf2img.convert(pdfPath, { density: 150, format: 'png' });
  // return base64 data URLs for GPT vision input
  return images.map(buf => `data:image/png;base64,${buf.toString('base64')}`);
}

module.exports = { pdfToImages };
