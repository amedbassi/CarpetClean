
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
    if (!name) return false;
    // Strip trailing punctuation from each word before checking blocklist
    const words = name.trim().split(/\s+/).map(w => w.replace(/[:,\.]$/, ''));

    if (words.length < 2) {
        // console.log(`      Reject: ${name} (Too short)`);
        return false;
    }

    for (const word of words) {
        const w = word.toLowerCase();
        if (NAME_BLOCKLIST.has(w)) {
            // console.log(`      Reject: ${name} (Blocklisted word: ${w})`);
            return false;
        }
        if (word === word.toUpperCase() && word.length > 2) {
            // console.log(`      Reject: ${name} (All caps: ${word})`);
            return false;
        }
        if (!/^[A-ZÀ-ÖØ-Ý]/.test(word)) {
            // console.log(`      Reject: ${name} (No leading capital: ${word})`);
            return false;
        }
    }
    return true;
}

function parseReceiptEntries(text) {
    const entries = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Let's use simpler regexes and explicit indexes
    const patterns = [
        {
            // "Client: Ana Marko 2"
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
        console.log(`Processing line: "${line}"`);
        let matched = false;
        for (const p of patterns) {
            const match = line.match(p.regex);
            if (match) {
                const nameStr = match[p.nameIdx];
                const countStr = match[p.countIdx];
                const countVal = parseInt(countStr, 10);

                console.log(`  Matched! Name: "${nameStr}", Count: "${countStr}"`);

                if (countVal > 0 && countVal <= 200 && looksLikePersonName(nameStr)) {
                    entries.push({ name: nameStr.trim(), rugCount: countVal });
                    console.log(`  Added entry.`);
                } else {
                    console.log(`  Invalid name or count.`);
                }
                matched = true;
                break;
            }
        }
        if (!matched) console.log("  No match.");
    }
    return entries;
}

// Test cases
const testText = `
ATELIER DE NETTOYAGE GENÈVE
Receipt #8829 — Date: 22.05.2024
Client: Ana Marko — 2 Rugs
Client: David Miller - 5 Rugs
Total Items: 7
`;

console.log("Parsing test text...");
const results = parseReceiptEntries(testText);
console.log("\nFinal Results:");
console.log(JSON.stringify(results, null, 2));

const expected = [
    { name: "Ana Marko", rugCount: 2 },
    { name: "David Miller", rugCount: 5 }
];

if (JSON.stringify(results) === JSON.stringify(expected)) {
    console.log("\n✅ Success! Detected both names.");
} else {
    console.log("\n❌ Failure. Expected detection of Ana and David.");
}
