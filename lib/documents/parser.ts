import pdfParse from 'pdf-parse-fork';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export interface ParsedDocument {
  text: string;
  metadata?: {
    pages?: number;
    author?: string;
    title?: string;
    [key: string]: any;
  };
}

/**
 * Parse PDF document and extract text
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      metadata: {
        pages: data.numpages,
        title: data.info?.Title,
        author: data.info?.Author,
        creationDate: data.info?.CreationDate,
      },
    };
  } catch (error) {
    console.error('[parsePDF] Error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse DOCX document and extract text
 */
export async function parseDOCX(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      metadata: {
        warnings: result.messages,
      },
    };
  } catch (error) {
    console.error('[parseDOCX] Error:', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse XLSX/XLS spreadsheet and extract text
 */
export async function parseXLSX(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = '';

    // Extract text from all sheets
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      text += `\n\n=== Sheet: ${sheetName} ===\n\n`;

      // Convert sheet to CSV format for easier text extraction
      const csvText = XLSX.utils.sheet_to_csv(sheet);
      text += csvText;
    });

    return {
      text: text.trim(),
      metadata: {
        sheets: workbook.SheetNames,
        sheetCount: workbook.SheetNames.length,
      },
    };
  } catch (error) {
    console.error('[parseXLSX] Error:', error);
    throw new Error(`Failed to parse XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse document based on MIME type
 */
export async function parseDocument(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
  console.log(`[parseDocument] Parsing document of type: ${mimeType}`);

  switch (mimeType) {
    case 'application/pdf':
      return parsePDF(buffer);

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return parseDOCX(buffer);

    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return parseXLSX(buffer);

    default:
      throw new Error(`Unsupported document type: ${mimeType}`);
  }
}

/**
 * Validate file size and type
 */
export function validateDocument(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
  ];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please upload PDF, DOCX, XLSX, or image files.' };
  }

  return { valid: true };
}

/**
 * Get file type category from MIME type
 */
export function getFileTypeCategory(mimeType: string): 'pdf' | 'docx' | 'xlsx' | 'image' {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) return 'docx';
  if (mimeType.includes('spreadsheetml') || mimeType.includes('ms-excel')) return 'xlsx';
  if (mimeType.startsWith('image/')) return 'image';
  return 'pdf'; // fallback
}
