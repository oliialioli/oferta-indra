// Converts an uploaded offer letter to plain text for labelParser.js.
// Only .docx and .pdf are supported — mammoth (the .docx parser) cannot
// read the legacy binary .doc format, and there's no reliable pure-JS
// parser for it. detectFileType checks real file signatures, not the
// filename extension, since the upload form's `accept` restriction alone
// can't be trusted server-side.

const mammoth = require('mammoth');

function detectFileType(buffer) {
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString('hex') === '504b0304') return 'docx';
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  return null;
}

async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractPdfText(buffer) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => item.str).join(' '));
  }
  return pages.join('\n');
}

async function extractText(buffer) {
  const fileType = detectFileType(buffer);
  if (fileType === 'docx') return { fileType, text: await extractDocxText(buffer) };
  if (fileType === 'pdf') return { fileType, text: await extractPdfText(buffer) };
  return { fileType: null, text: null };
}

module.exports = { detectFileType, extractDocxText, extractPdfText, extractText };
