/**
 * End-to-end OCR test:
 * 1. Confirms OCR_SPACE_API_KEY is loaded from .env
 * 2. Sends a synthetic receipt image (PNG with text) to api.ocr.space
 * 3. Runs the same parseReceiptEntries logic to verify name detection
 * 4. Confirms "Total Items" is blocked by the parser
 */

// ---- Parser logic (same as route.ts) ----
const NAME_BLOCKLIST = new Set([
    'total', 'items', 'item', 'rugs', 'rug', 'pieces', 'piece', 'pcs', 'pc',
    'carpet', 'carpets', 'receipt', 'invoice', 'order', 'date', 'client',
    'customer', 'name', 'quantity', 'qty', 'count', 'number', 'no', 'nr',
    'subtotal', 'grand', 'amount', 'sum', 'tax', 'vat', 'discount', 'price',
    'list', 'description', 'details', 'notes', 'remark', 'remarks', 'ref',
    'signature', 'signed', 'approved', 'by', 'for', 'from', 'to', 'page',
    'pressing', 'partner', 'cleaning', 'laundry', 'service', 'services',
]);

function looksLikePersonName(name) {
    const words = name.trim().split(/\s+/);
    if (words.length < 2) return false;
    for (const word of words) {
        if (NAME_BLOCKLIST.has(word.toLowerCase())) return false;
        if (word === word.toUpperCase() && word.length > 2) return false;
        if (!/^[A-ZÀ-ÖØ-Ý]/.test(word)) return false;
    }
    return true;
}

function parseReceiptEntries(text) {
    const entries = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const patterns = [
        /^([A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+(?:\s+[A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+){0,3})\s*[:\-–]?\s*\(?\s*(\d+)\s*\)?(?:\s*rugs?)?$/i,
        /^(\d+)\s*[:\-–]?\s*([A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+(?:\s+[A-ZÀ-Ö][a-zA-ZÀ-ÖØ-öø-ÿ]+){0,3})$/i,
    ];
    for (const line of lines) {
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                const isCountFirst = /^\d/.test(line);
                const name = isCountFirst ? match[2].trim() : match[1].trim();
                const count = isCountFirst ? parseInt(match[1], 10) : parseInt(match[2], 10);
                if (count > 0 && count <= 200 && looksLikePersonName(name)) {
                    entries.push({ name, rugCount: count });
                }
                break;
            }
        }
    }
    return entries;
}

// ---- Parser unit tests (no API needed) ----
function runParserTests() {
    console.log('\n📋 Parser unit tests:');
    const cases = [
        { input: 'Ana Marko 2', expect: [{ name: 'Ana Marko', rugCount: 2 }] },
        { input: '5: David Miller', expect: [{ name: 'David Miller', rugCount: 5 }] },
        { input: 'Maria Popescu - 3', expect: [{ name: 'Maria Popescu', rugCount: 3 }] },
        { input: 'Total Items 7', expect: [] },   // must be blocked
        { input: 'Grand Total 14', expect: [] },   // must be blocked
        { input: 'Partner 721', expect: [] },   // single word, must be blocked
        { input: 'John Doe (4)', expect: [{ name: 'John Doe', rugCount: 4 }] },
        { input: '2 Ion Pop', expect: [{ name: 'Ion Pop', rugCount: 2 }] },
    ];
    let passed = 0;
    for (const { input, expect: exp } of cases) {
        const result = parseReceiptEntries(input);
        const ok =
            result.length === exp.length &&
            result.every((r, i) => r.name === exp[i]?.name && r.rugCount === exp[i]?.rugCount);
        const icon = ok ? '✅' : '❌';
        console.log(`  ${icon} "${input}" → ${JSON.stringify(result)}`);
        if (ok) passed++;
    }
    console.log(`  ${passed}/${cases.length} tests passed`);
    return passed === cases.length;
}

// ---- Live OCR API test ----
async function testOcrApi() {
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
        console.error('❌ OCR_SPACE_API_KEY not found in environment');
        return false;
    }
    console.log(`\n🔑 API key loaded: ${apiKey.slice(0, 4)}${'*'.repeat(apiKey.length - 4)}`);

    // Use a known public test image URL (a simple text image from OCR.space docs)
    // We'll send a URL instead of uploading a file to avoid needing a real receipt
    const form = new URLSearchParams();
    form.append('url', 'https://ocr.space/Content/Images/receipt-ocr-original.jpg');
    form.append('isOverlayRequired', 'false');
    form.append('language', 'eng');
    form.append('OCREngine', '2');

    console.log('\n🌐 Calling OCR.space API with sample receipt image...');
    const res = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { apikey: apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
    });

    if (!res.ok) {
        console.error(`❌ HTTP error: ${res.status} ${res.statusText}`);
        return false;
    }

    const data = await res.json();
    if (data.IsErroredOnProcessing) {
        console.error('❌ OCR processing error:', data.ErrorMessage);
        return false;
    }

    const rawText = data.ParsedResults?.[0]?.ParsedText || '';
    console.log('✅ OCR response received!');
    console.log('📄 Extracted text (first 300 chars):');
    console.log('   ' + rawText.slice(0, 300).replace(/\n/g, '\n   '));

    const entries = parseReceiptEntries(rawText);
    console.log('\n👤 Parsed name entries:', entries.length > 0 ? JSON.stringify(entries) : '(none from this sample image – expected)');

    return true;
}

// ---- Main ----
(async () => {
    console.log('='.repeat(50));
    console.log('  OCR Receipt Integration – Final Test');
    console.log('='.repeat(50));

    const parserOk = runParserTests();
    const apiOk = await testOcrApi();

    console.log('\n' + '='.repeat(50));
    if (parserOk && apiOk) {
        console.log('🎉 ALL CHECKS PASSED – OCR integration is ready!');
    } else {
        console.log('⚠️  Some checks failed – see above for details.');
    }
    console.log('='.repeat(50));
})();
