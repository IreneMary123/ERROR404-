/* ============================================
   CivicVoice — Content Moderation Module
   Client-side profanity filter with leet-speak support
   Supports English + Malayalam vulgar content
   ============================================ */

// English blocked words
const BLOCKED_WORDS_EN = [
    "fuck", "shit", "ass", "bitch", "bastard", "damn", "dick", "cock",
    "pussy", "cunt", "whore", "slut", "nigger", "nigga", "faggot", "fag",
    "retard", "retarded", "motherfucker", "asshole", "bullshit", "dumbass",
    "dipshit", "jackass", "piss", "crap", "twat", "wanker", "douche",
    "scumbag", "prick", "bollocks", "arse", "arsehole", "shithead",
    "fuckface", "fuckhead", "dickhead", "shitty", "fucked", "fucking",
    "fucker", "bitchy", "slutty", "goddam", "goddamn", "goddamnit",
    "stfu", "gtfo", "wtf", "lmfao"
];

// Malayalam vulgar/abusive words (in Malayalam script + transliterated romanized forms)
const BLOCKED_WORDS_ML = [
    // Malayalam script
    "തായോളി", "മൈരേ", "മൈര്", "പൂറ്", "പൂറി", "കുണ്ണ", "കുണ്ടി",
    "തെണ്ടി", "ചുണ്ണി", "ഓളി", "ഊമ്പ്", "ഊമ്പി", "മോനേ മൈരേ",
    "നായിന്റെ മോൻ", "നായിന്റെ മോനേ", "പന്നി", "നാറി",
    "കോപ്പ്", "വേശ്യ", "കള്ളി", "പട്ടി", "പുല്ല്",
    "ചെറ്റ", "മണ്ടൻ", "വിഡ്ഢി", "കഴുവേറി", "കഴുത",
    "കുണ്ടൻ", "മലയാളം", "ഒരു കുണ്ണയും", "മൈരൻ",
    "സ്ക്രൂ", "മൂഞ്ചി",

    // Romanized / Manglish (commonly typed Malayalam slang)
    "thayoli", "thayooli", "thaiyoli", "thaayoli", "myr",
    "maire", "myre", "myru", "myran", "mairun",
    "poori", "pooru", "poorr", "poooru",
    "kunna", "kundi", "kundan",
    "thendi", "theendi", "thenndi",
    "ooli", "oolee", "ooli mone",
    "oombi", "oombu", "oombeda",
    "nayinte mon", "nayinte mone", "naayin mon",
    "panni", "pannee",
    "naari", "naati",
    "koppu", "kopp",
    "veshya", "veshye",
    "kalli", "kallan",
    "patti", "pattimon",
    "pullu", "pull",
    "chetta", "chettha",
    "mandan", "mandanmaar",
    "viddi", "viddhi",
    "kazhuveri", "kazhuth",
    "mooosa", "moonji",
    "poole", "pooleh",
    "thallayoli", "ammayoli",
    "kandaroli", "kulamilla",
    "theetta", "theettam",
    "andi", "andimone",
    "myranmare", "poorimon",
    "da patti", "kunthi",
    "sunni", "sunnee",
    "kotham", "kothichi",
    "layam illa", "poyi pani",
    "veruthe onnum alla",
    "chapri", "chaprikal"
];

// Combine all blocked words
const BLOCKED_WORDS = [...BLOCKED_WORDS_EN, ...BLOCKED_WORDS_ML];

// Leet-speak character substitutions (for English)
const LEET_MAP = {
    '@': 'a', '4': 'a', '^': 'a',
    '8': 'b',
    '(': 'c', '<': 'c',
    '3': 'e',
    '6': 'g', '9': 'g',
    '#': 'h',
    '1': 'i', '!': 'i', '|': 'i',
    '0': 'o',
    '$': 's', '5': 's',
    '7': 't', '+': 't',
    'v': 'u',
    '2': 'z',
};

/**
 * Normalize text for English: lowercase + replace leet-speak characters
 */
function normalizeEnglish(text) {
    let normalized = text.toLowerCase();
    let result = '';
    for (const char of normalized) {
        result += LEET_MAP[char] || char;
    }
    // Remove non-alphanumeric separators (e.g., "f.u.c.k")
    result = result.replace(/[^a-z0-9\s]/g, '');
    return result;
}

/**
 * Check if text contains inappropriate content
 * @param {string} text - The text to check
 * @returns {{ flagged: boolean, reason: string }}
 */
export function checkContent(text) {
    if (!text || typeof text !== 'string') {
        return { flagged: false, reason: '' };
    }

    const lowerText = text.toLowerCase();

    // Check Malayalam script words directly (no normalization needed)
    for (const word of BLOCKED_WORDS_ML) {
        if (lowerText.includes(word.toLowerCase())) {
            return {
                flagged: true,
                reason: `Your message contains inappropriate language. Please rephrase and try again.`
            };
        }
    }

    // Check English words with leet-speak normalization
    const normalizedEn = normalizeEnglish(text);

    for (const word of BLOCKED_WORDS_EN) {
        // Word boundary check
        const regex = new RegExp(`(^|\\s)${word}(s|es|ed|ing|er)?($|\\s)`, 'i');
        if (regex.test(normalizedEn)) {
            return {
                flagged: true,
                reason: `Your message contains inappropriate language. Please rephrase and try again.`
            };
        }

        // Concatenated check (e.g., "fuckthis")
        if (normalizedEn.replace(/\s/g, '').includes(word)) {
            return {
                flagged: true,
                reason: `Your message contains inappropriate language. Please rephrase and try again.`
            };
        }
    }

    // Check romanized Malayalam (Manglish) — these won't have leet-speak
    for (const word of BLOCKED_WORDS_ML) {
        // Only check romanized (ASCII) words here
        if (/^[a-z\s]+$/i.test(word)) {
            const regex = new RegExp(`(^|\\s)${word.toLowerCase()}($|\\s)`, 'i');
            if (regex.test(lowerText)) {
                return {
                    flagged: true,
                    reason: `Your message contains inappropriate language. Please rephrase and try again.`
                };
            }
        }
    }

    return { flagged: false, reason: '' };
}

/**
 * Check if text is inappropriate (simple boolean)
 * @param {string} text
 * @returns {boolean}
 */
export function isInappropriate(text) {
    return checkContent(text).flagged;
}

/**
 * Check multiple text fields at once
 * @param  {...string} texts - Multiple text strings to check
 * @returns {{ flagged: boolean, reason: string }}
 */
export function checkMultiple(...texts) {
    for (const text of texts) {
        const result = checkContent(text);
        if (result.flagged) return result;
    }
    return { flagged: false, reason: '' };
}
