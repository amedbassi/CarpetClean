import { NextResponse } from 'next/server';

/**
 * POST /api/ocr-receipt
 * Accepts multipart/form-data with a 'receipt' image file.
 * Sends it to OCR.space free API and returns:
 *   { rawText: string, entries: { name: string, rugCount: number }[] }
 *
 * The 'entries' are parsed from receipt lines like:
 *   "Ana Marko 2", "2: Ana Marko", "Ana Marko - 2 rugs", etc.
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('receipt') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No receipt file provided' }, { status: 400 });
        }

        // Build multipart request to OCR.space
        const ocrForm = new FormData();
        ocrForm.append('file', file);
        ocrForm.append('isOverlayRequired', 'false');
        ocrForm.append('language', 'eng');
        ocrForm.append('detectOrientation', 'true');
        ocrForm.append('scale', 'true');
        ocrForm.append('OCREngine', '2'); // More accurate engine

        const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';

        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: { apikey: apiKey },
            body: ocrForm,
        });

        if (!ocrResponse.ok) {
            return NextResponse.json({ error: 'OCR service error' }, { status: 502 });
        }

        const ocrData = await ocrResponse.json();

        if (ocrData.IsErroredOnProcessing) {
            return NextResponse.json({
                error: ocrData.ErrorMessage || 'OCR processing failed',
            }, { status: 422 });
        }

        const rawText: string =
            ocrData.ParsedResults?.[0]?.ParsedText || '';

        const entries = parseReceiptEntries(rawText);

        return NextResponse.json({ rawText, entries });
    } catch (err) {
        console.error('OCR route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * Terms that appear as capitalized words on receipts but are NOT personal names.
 * Checked case-insensitively against each word in the parsed name.
 */
const NAME_BLOCKLIST = new Set([
    'total', 'items', 'item', 'rugs', 'rug', 'pieces', 'piece', 'pcs', 'pc',
    'carpet', 'carpets', 'receipt', 'invoice', 'order', 'date', 'client',
    'customer', 'name', 'quantity', 'qty', 'count', 'number', 'no', 'nr',
    'subtotal', 'grand', 'amount', 'sum', 'tax', 'vat', 'discount', 'price',
    'list', 'description', 'details', 'notes', 'remark', 'remarks', 'ref',
    'signature', 'signed', 'approved', 'by', 'for', 'from', 'to', 'page',
    'pressing', 'partner', 'cleaning', 'laundry', 'service', 'services',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december',
]);

function looksLikePersonName(name: string): boolean {
    if (!name) return false;
    // Strip trailing punctuation from each word before checking blocklist
    const words = name.trim().split(/\s+/).map(w => w.replace(/[:,\.]$/, ''));

    // Must be at least 2 words (first + last name)
    if (words.length < 2) return false;

    for (const word of words) {
        const w = word.toLowerCase();
        // Reject if any word is in the blocklist
        if (NAME_BLOCKLIST.has(w)) return false;
        // Reject if word is all uppercase (e.g. acronym like "VAT", "NO")
        if (word === word.toUpperCase() && word.length > 2) return false;
        // Each word should start with a capital letter
        if (!/^[A-ZÀ-ÖØ-Ý]/.test(word)) return false;
    }
    return true;
}

/**
 * Parse OCR text into { name, rugCount } entries.
 *
 * Supports patterns:
 *   - "Client: Ana Marko — 2 Rugs"
 *   - "2 Ana Marko"
 */
function parseReceiptEntries(text: string): { name: string; rugCount: number }[] {
    const entries: { name: string; rugCount: number }[] = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Regex: capture either "Name COUNT" or "COUNT Name" patterns
    const patterns = [
        {
            // "Client: Ana Marko — 2 Rugs"
            regex: /^(?:Client|Name|Customer|Individual)?[\s\:\-–—]*([A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+(?:\s+[A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+){0,3})[\s\:\-–—\(]+(\d+)[\s\:\-–—\)]*(?:rugs?)?$/i,
            nameIdx: 1,
            countIdx: 2
        },
        {
            // "2 Ana Marko"
            regex: /^(?:Client|Name|Customer|Individual)?[\s\:\-–—]*(\d+)[\s\:\-–—\(]+([A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+(?:\s+[A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+){0,3})$/i,
            nameIdx: 2,
            countIdx: 1
        }
    ];

    for (const line of lines) {
        for (const p of patterns) {
            const match = line.match(p.regex);
            if (match) {
                const nameStr = match[p.nameIdx].trim();
                const countStr = match[p.countIdx];
                const countVal = parseInt(countStr, 10);

                if (countVal > 0 && countVal <= 200 && looksLikePersonName(nameStr)) {
                    entries.push({ name: nameStr, rugCount: countVal });
                }
                break;
            }
        }
    }

    return entries;
}

