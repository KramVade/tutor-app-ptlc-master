/**
 * Message Moderation System
 * Combines AI-based moderation with custom rule-based checks
 * to flag inappropriate content in messages
 */

export interface ModerationResult {
  allowed: boolean;
  reasons: string[];
  confidence?: number;
  rawModerationResponse?: any;
  flaggedPatterns?: string[];
}

interface RuleCheck {
  category: string;
  patterns: RegExp[];
  description: string;
}

// Custom rule-based checks
const RULE_CHECKS: RuleCheck[] = [
  {
    category: "sexual-content",
    description: "Sexual content, grooming, or inappropriate advances",
    patterns: [
      /\b(sexy|hot|babe|cutie|beautiful|gorgeous)\b/gi,
      /\b(send\s*(me\s*)?(pic|picture|photo|image|selfie|nude))/gi,
      /\b(18\+|adult|nsfw|porn)/gi,
      /\b(boyfriend|girlfriend|dating|relationship)\b.*\?/gi,
      /\byou'?re\s*(so\s*)?(cute|hot|sexy|beautiful)/gi,
      /\b(meet\s*(me\s*)?alone|private\s*meeting)/gi,
      /\bdon'?t\s*tell\s*(anyone|parents|your\s*mom|your\s*dad)/gi,
      /\b(our|this)\s*secret/gi,
      /\bspecial\s*(friend|relationship)/gi,
      /\b(touch|kiss|hug)\s*(me|you)/gi,
    ],
  },
  {
    category: "threatening",
    description: "Threats, violence, or harmful content",
    patterns: [
      /\b(kill|hurt|harm|attack|beat|punch|hit)\s*(you|your|yourself)/gi,
      /\bi\s*will\s*(hurt|harm|kill|destroy)/gi,
      /\bi\s*hope\s*(you|something\s*bad)/gi,
      /\b(die|death|dead)\b/gi,
      /\bself[-\s]?harm/gi,
      /\bsuicide/gi,
      /\bcut\s*yourself/gi,
    ],
  },
  {
    category: "harassment",
    description: "Profanity, insults, bullying, or abusive language",
    patterns: [
      /\b(fuck|fucking|fucked|fucker|fck|f\*ck|fuk)\b/gi,
      /\b(shit|sht|sh\*t|crap)\b/gi,
      /\b(bitch|btch|b\*tch)\b/gi,
      /\b(asshole|a\*\*hole|ahole|ass)\b/gi,
      /\b(bastard|bstrd)\b/gi,
      /\b(damn|dmn|dammit)\b/gi,
      /\b(idiot|stupid|dumb|moron|retard|retarded)\b/gi,
      /\b(hate\s*you|despise\s*you)\b/gi,
      /\b(ugly|fat|loser|worthless|useless)\b/gi,
      /\byou\s*(suck|are\s*trash|are\s*garbage|are\s*terrible|are\s*awful)\b/gi,
      /\bshut\s*(up|the\s*fuck\s*up)/gi,
      /\bgo\s*to\s*hell/gi,
      /\b(wtf|wth|omfg|stfu)\b/gi,
      /\byour?\s*(kid|child|student)\s*is\s*(stupid|dumb|slow|retarded)/gi,
    ],
  },
  {
    category: "hate-speech",
    description: "Discrimination, racism, or hate speech",
    patterns: [
      /\byou\s*people\s*are/gi,
      /\ball\s*(of\s*)?you\s*(people|guys|women|men)\s*are/gi,
      /\bbecause\s*(of\s*)?(your|his|her)\s*(race|religion|gender|disability|condition)/gi,
      /\b(racist|sexist|homophobic|transphobic)\b/gi,
    ],
  },
  {
    category: "off-platform-payment",
    description: "Attempting to arrange payment outside the platform",
    patterns: [
      /\bpay\s*(me|us)?\s*(outside|off|directly|privately|via|through)/gi,
      /\bpayment\s*(outside|off|direct)/gi,
      /\b(gcash|paypal|venmo|zelle|cashapp|cash\s*app|paymaya|coins\.ph)/gi,
      /\bbank\s*(transfer|account|deposit)/gi,
      /\bwire\s*(transfer|money)/gi,
      /\bsend\s*(money|payment|cash)\s*(to|via|through)/gi,
      /\b(private|direct)\s*(deal|payment|transaction)/gi,
      /\bpay.*?(cash|hand|person)/gi,
      /\bavoid.*?(fee|platform|app|website)/gi,
      /\b(cheaper|better|easier).*?(outside|off|direct)/gi,
      /\bskip\s*(the\s*)?(website|platform|app|fee)/gi,
      /\blet'?s\s*settle\s*(this\s*)?(outside|privately|directly)/gi,
      /\bdon'?t\s*book\s*(here|on\s*the\s*platform)/gi,
      /\b09\d{9}\b/g,
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    ],
  },
  {
    category: "contact-exchange",
    description: "Attempting to exchange contact information or move off-platform",
    patterns: [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      /\b\d{4}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      /\b09\d{9}\b/g,
      /\+?\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      /\b(whatsapp|telegram|viber|signal|messenger|facebook|fb|instagram|ig|twitter|tiktok|discord)/gi,
      /\b(my|contact)\s*(number|email|phone|fb|facebook)/gi,
      /\btext\s*me\s*(at|on)/gi,
      /\bcall\s*me\s*(at|on)/gi,
      /\breach\s*me\s*(at|on|via)/gi,
      /\badd\s*me\s*on\s*(fb|facebook|messenger|whatsapp|telegram)/gi,
      /\bmessage\s*me\s*on\s*(fb|facebook|messenger|whatsapp|telegram)/gi,
      /\blet'?s\s*(talk|chat|communicate|switch)\s*(on|to|via)\s*(fb|facebook|messenger|whatsapp|telegram)/gi,
      /\bcan\s*we\s*(talk|chat|communicate)\s*(on|via|through)\s*(fb|facebook|messenger|whatsapp|telegram)/gi,
      /\bhere'?s\s*my\s*(number|email|fb|facebook|contact)/gi,
    ],
  },
  {
    category: "external-links",
    description: "Sharing external links or websites",
    patterns: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/gi,
      /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/gi,
      /\b(visit|check|go\s*to|click)\s*(my|our|this)?\s*(website|site|page|link)/gi,
      /\.(com|net|org|io|co|ph)\b/gi,
      /\bclick\s*(here|this|the\s*link)/gi,
    ],
  },
  {
    category: "spam",
    description: "Spam, scams, or suspicious advertising",
    patterns: [
      /\b(click\s*here|buy\s*now|limited\s*offer|act\s*now)/gi,
      /\b(earn|make)\s*\$?\d+\s*(per|a)\s*(day|hour|week)/gi,
      /\bwork\s*from\s*home/gi,
      /\b(guaranteed|100%)\s*(money|income|profit|free)/gi,
      /\bmulti[-\s]?level\s*marketing/gi,
      /\b(mlm|pyramid\s*scheme)/gi,
      /\b(free\s*prize|win\s*money|lottery)/gi,
      /\b(crypto|bitcoin|investment\s*opportunity)/gi,
      /\bphishing/gi,
    ],
  },
  {
    category: "grooming",
    description: "Grooming behavior or inappropriate boundary crossing",
    patterns: [
      /\bmeet\s*(me\s*)?(alone|private|secretly|in\s*private)/gi,
      /\bdon'?t\s*tell\s*(anyone|your\s*parents|the\s*admin|others)/gi,
      /\bkeep.*?(secret|between\s*us|private|quiet)/gi,
      /\b(our|this)\s*little\s*secret/gi,
      /\bspecial\s*(friend|relationship|bond)/gi,
      /\bjust\s*(between\s*)?(us|you\s*and\s*me)/gi,
      /\bwithout\s*(others|anyone\s*knowing)/gi,
      /\blet'?s\s*keep\s*this\s*(private|secret|between\s*us)/gi,
    ],
  },
  {
    category: "sensitive-info",
    description: "Sharing sensitive personal information",
    patterns: [
      /\b(home\s*address|full\s*address|street\s*address)/gi,
      /\b\d+\s+[A-Za-z\s]+\s+(street|st|avenue|ave|road|rd|drive|dr|blvd)/gi,
      /\b(ssn|social\s*security|passport|driver'?s\s*license|id\s*number)/gi,
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b(credit\s*card|debit\s*card|card\s*number)/gi,
      /\bmy\s*(child'?s|kid'?s|student'?s)\s*id/gi,
      /\bwe\s*live\s*(at|in)/gi,
    ],
  },
];

/**
 * Check message against custom rule-based patterns
 */
function checkCustomRules(message: string): {
  flagged: string[];
  patterns: string[];
} {
  const flagged: string[] = [];
  const patterns: string[] = [];

  for (const rule of RULE_CHECKS) {
    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      
      if (pattern.test(message)) {
        if (!flagged.includes(rule.category)) {
          flagged.push(rule.category);
        }
        patterns.push(pattern.source);
      }
    }
  }

  return { flagged, patterns };
}

/**
 * Call OpenAI Moderation API via our server-side API route
 */
async function callOpenAIModerationAPI(message: string): Promise<any> {
  try {
    const response = await fetch("/api/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.flagged === undefined) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("❌ Error calling moderation API:", error);
    return null;
  }
}

/**
 * Parse OpenAI moderation response
 */
function parseOpenAIResponse(result: any): string[] {
  if (!result || !result.flagged) {
    return [];
  }

  const flaggedCategories: string[] = [];
  const categories = result.categories || {};

  const categoryMap: Record<string, string> = {
    sexual: "sexual-content",
    "sexual/minors": "sexual-content",
    hate: "hate-speech",
    "hate/threatening": "hate-speech",
    harassment: "harassment",
    "harassment/threatening": "threatening",
    "self-harm": "self-harm",
    "self-harm/intent": "self-harm",
    "self-harm/instructions": "self-harm",
    violence: "threatening",
    "violence/graphic": "threatening",
  };

  for (const [category, isFlagged] of Object.entries(categories)) {
    if (isFlagged) {
      const mappedCategory = categoryMap[category] || category;
      if (!flaggedCategories.includes(mappedCategory)) {
        flaggedCategories.push(mappedCategory);
      }
    }
  }

  return flaggedCategories;
}

/**
 * Main moderation function
 */
export async function moderateMessage(
  message: string
): Promise<ModerationResult> {
  if (!message || message.trim().length === 0) {
    return {
      allowed: true,
      reasons: [],
    };
  }

  const reasons: string[] = [];
  let rawModerationResponse: any = null;

  // 1. Check custom rules first
  const { flagged: customFlags, patterns } = checkCustomRules(message);
  reasons.push(...customFlags);

  // 2. Call AI moderation API
  const aiResult = await callOpenAIModerationAPI(message);
  rawModerationResponse = aiResult;

  if (aiResult) {
    const aiFlags = parseOpenAIResponse(aiResult);
    reasons.push(...aiFlags);
  }

  // Remove duplicates
  const uniqueReasons = [...new Set(reasons)];

  // Calculate confidence
  let confidence: number | undefined;
  if (aiResult && aiResult.category_scores) {
    const scores = Object.values(aiResult.category_scores) as number[];
    confidence = Math.max(...scores);
  }

  return {
    allowed: uniqueReasons.length === 0,
    reasons: uniqueReasons,
    confidence,
    rawModerationResponse,
    flaggedPatterns: patterns.length > 0 ? patterns : undefined,
  };
}

/**
 * Batch moderate multiple messages
 */
export async function moderateMessages(
  messages: string[]
): Promise<ModerationResult[]> {
  return Promise.all(messages.map((msg) => moderateMessage(msg)));
}

/**
 * Get human-readable description for a flagged category
 */
export function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    "sexual-content": "Sexual content or inappropriate advances",
    "threatening": "Threats, violence, or harmful content",
    "harassment": "Profanity, insults, bullying, or abusive language",
    "hate-speech": "Discrimination, racism, or hate speech",
    "off-platform-payment": "Attempting to arrange payment outside the platform",
    "contact-exchange": "Attempting to exchange contact information or move off-platform",
    "external-links": "Sharing external links or websites",
    "spam": "Spam, scams, or suspicious advertising",
    "grooming": "Grooming behavior or inappropriate boundary crossing",
    "sensitive-info": "Sharing sensitive personal information",
    "violence": "Violent or graphic content",
    "self-harm": "Content related to self-harm",
  };

  return descriptions[category] || category;
}

/**
 * Check if a message should be auto-blocked (high severity)
 */
export function shouldAutoBlock(result: ModerationResult): boolean {
  const highSeverityCategories = [
    "sexual-content",
    "grooming",
    "threatening",
    "violence",
    "hate-speech",
    "harassment",
    "off-platform-payment",
    "contact-exchange",
    "sensitive-info",
  ];

  return result.reasons.some((reason) =>
    highSeverityCategories.includes(reason)
  );
}

/**
 * Check if a message should trigger a warning (medium severity)
 */
export function shouldWarn(result: ModerationResult): boolean {
  const mediumSeverityCategories = [
    "external-links",
    "spam",
  ];

  return (
    !shouldAutoBlock(result) &&
    result.reasons.some((reason) => mediumSeverityCategories.includes(reason))
  );
}
