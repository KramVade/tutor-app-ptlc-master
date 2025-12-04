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
      // 1. Direct sexual requests
      /\bsend\s*(me\s*)?(nudes?|naked\s*(pic|picture|photo|image)s?)/gi,
      /\bsend\s*(me\s*)?(a\s*)?(sexy|hot|steamy|adult)\s*(pic|picture|photo|image|video)/gi,
      /\bshow\s*(me\s*)?(your\s*)?(body|breasts?|chest|private\s*parts?|ass|butt|dick|penis|vagina)/gi,
      /\bdo\s*you\s*have\s*(any\s*)?(naked|nude|sexy|hot)\s*(pic|picture|photo|image)s?/gi,
      /\bsend\s*something\s*(hot|steamy|adult|sexy|spicy)/gi,
      /\b(i\s*want\s*to\s*see|show\s*me)\s*(you\s*)?(without\s*clothes?|naked|nude)/gi,
      /\bsend\s*(me\s*)?(a\s*)?private\s*(video|pic|picture|photo)/gi,
      /\bi'?m\s*horny/gi,
      /\bdo\s*you\s*want\s*to\s*do\s*something\s*(dirty|naughty|sexual)/gi,
      /\blet'?s\s*sext/gi,
      /\bsend\s*(me\s*)?pics?\s*(of\s*)?(you|yourself)/gi,
      
      // 2. Sexual comments or descriptions
      /\byou\s*look\s*(so\s*)?(sexy|hot|gorgeous)\s*(in\s*(your\s*)?profile|in\s*that)/gi,
      /\byou\s*have\s*(a\s*)?(nice|great|amazing|sexy|hot)\s*(body|figure|curves?|ass|butt|chest|breasts?)/gi,
      /\byou'?re\s*(so\s*)?(sexy|hot|gorgeous|beautiful)\s*,?\s*i\s*can'?t\s*(focus|concentrate|think)/gi,
      /\bi'?m\s*thinking\s*(about\s*)?you\s*(in\s*a\s*)?(sexual|dirty|naughty)\s*way/gi,
      /\bi\s*had\s*(a\s*)?(dirty|sexual|wet)\s*dream\s*(about\s*)?you/gi,
      /\byour\s*(kid'?s?|child'?s?|student'?s?)\s*tutor\s*is\s*(really\s*)?(sexy|hot)/gi,
      /\byou'?re\s*(too\s*)?(sexy|hot|attractive|beautiful)\s*(to\s*be|for)/gi,
      
      // 3. Sexual harassment / innuendos
      /\bwant\s*to\s*have\s*(some\s*)?fun\s*(later|tonight|with\s*me)?/gi,
      /\byou'?re\s*(cute|sexy|hot).*?too\s*(cute|sexy|hot)\s*to\s*be\s*just\s*(a\s*)?(student|parent|tutor)/gi,
      /\bwe\s*can\s*meet\s*alone\s*,?\s*just\s*(the\s*)?two\s*of\s*us/gi,
      /\byou\s*must\s*have\s*(guys?|girls?|people)\s*chasing\s*you/gi,
      /\bi\s*can\s*give\s*you\s*['""]?extra\s*lessons?['""]?\s*;?\)/gi,
      /\bi'?m\s*sure\s*you\s*look\s*good\s*(without|in)\s*(your\s*)?(uniform|clothes?)/gi,
      /\bare\s*you\s*lonely\s*(tonight|now)?/gi,
      /\bif\s*you\s*play\s*nice\s*,?\s*i'?ll\s*treat\s*you/gi,
      /\byou'?re\s*(so\s*)?(fine|sexy|hot|cute)/gi,
      /\bwanna\s*(have\s*)?(fun|play)/gi,
      
      // 4. Grooming or sexual-boundary violations
      /\bdon'?t\s*tell\s*(your\s*)?(parents?|mom|dad|anyone)\s*(about\s*)?(this|our)/gi,
      /\bthis\s*is\s*(our\s*)?little\s*secret/gi,
      /\bi\s*can\s*help\s*you.*?but\s*you\s*need\s*to\s*be\s*nice\s*to\s*me/gi,
      /\bi\s*like\s*talking\s*to\s*you\s*more\s*than\s*(kids?|people)\s*(your\s*)?age/gi,
      /\byou'?re\s*(very\s*)?mature\s*for\s*(your\s*)?age/gi,
      /\bcan\s*you\s*show\s*me\s*what\s*you'?re\s*wearing/gi,
      /\blet'?s\s*video\s*call.*?just\s*us/gi,
      /\byou\s*don'?t\s*need\s*to\s*tell\s*anyone\s*if\s*i\s*say\s*something\s*personal/gi,
      /\bkeep\s*this\s*(between\s*us|secret|private|quiet)/gi,
      
      // 5. Requesting private, inappropriate meetups
      /\blet'?s\s*meet\s*(in\s*)?private/gi,
      /\bcan\s*we\s*see\s*each\s*other\s*(at\s*night|alone)/gi,
      /\bdon'?t\s*tell\s*anyone.*?i\s*want\s*to\s*meet\s*you/gi,
      /\bcome\s*to\s*my\s*place.*?nobody\s*will\s*know/gi,
      /\bi\s*want\s*to\s*(hug|kiss|touch)\s*you\s*when\s*we\s*meet/gi,
      /\bwe\s*can\s*have\s*(some\s*)?fun\s*after\s*class/gi,
      /\bmeet\s*(me\s*)?(alone|secretly|in\s*private)/gi,
      
      // 6. Sexual jokes / "joke but not a joke"
      /\bjust\s*kidding.*?unless\s*(you\s*want|;?\))/gi,
      /\byou'?d\s*look\s*good\s*in\s*my\s*bed/gi,
      /\byou'?re\s*my\s*type\s*,?\s*(haha|lol|😂)/gi,
      /\btutor[-\s]?student\s*romance.*?(just\s*)?joking/gi,
      /\byour\s*(mom|dad|parent)\s*is\s*hot\s*,?\s*can\s*i\s*get\s*their\s*number/gi,
      
      // 7. Sexual compliments masked as "flattery"
      /\byou'?re\s*too\s*(beautiful|gorgeous|sexy|hot)\s*for\s*(a\s*)?(student|parent|tutor)/gi,
      /\byou\s*look\s*like\s*(a\s*)?(model|goddess|angel)/gi,
      /\bi\s*can'?t\s*stop\s*thinking\s*(about\s*)?(how\s*)?(cute|sexy|hot|beautiful)\s*you\s*are/gi,
      /\byou\s*have\s*(such\s*a\s*)?(nice|great|amazing)\s*(figure|body|curves?)/gi,
      /\byou'?re\s*the\s*most\s*(attractive|beautiful|sexy|hot)\s*person\s*i\s*talk\s*to/gi,
      
      // 8. Boundary-crossing personal questions
      /\bdo\s*you\s*have\s*(a\s*)?(boyfriend|girlfriend|partner)/gi,
      /\bare\s*you\s*(a\s*)?virgin/gi,
      /\bare\s*you\s*dating\s*(anyone|someone)\s*(older|younger)?/gi,
      /\bhave\s*you\s*ever\s*kissed\s*someone/gi,
      /\bwhat\s*turns\s*you\s*on/gi,
      /\bwhat\s*are\s*you\s*wearing\s*(right\s*)?now/gi,
      /\bdo\s*you\s*like\s*(older|younger)\s*(guys?|girls?|men|women)/gi,
      
      // 9. Sexualized role-play or fantasies
      /\bimagine\s*(we'?re|if\s*we'?re)\s*alone\s*in\s*(a\s*)?room/gi,
      /\bwhat\s*if\s*i\s*kiss\s*you\s*during\s*tutoring/gi,
      /\bi\s*dreamt?\s*(about\s*)?tutoring.*?you\s*were\s*naked/gi,
      /\blet'?s\s*pretend\s*we'?re\s*dating/gi,
      /\bimagine\s*(if\s*)?we\s*were\s*(dating|together|alone)/gi,
      
      // 10. Inappropriate comments about appearance
      /\bwhy\s*do\s*you\s*dress\s*like\s*that.*?it'?s\s*sexy/gi,
      /\byour\s*lips\s*look\s*(kissable|sexy|hot)/gi,
      /\byou\s*should\s*wear\s*(tighter|sexier|less)\s*clothes?/gi,
      /\byou\s*have\s*(a\s*)?(nice|great)\s*(chest|breasts?|ass|butt)/gi,
      /\bi\s*bet\s*you\s*look\s*amazing\s*in\s*(lingerie|underwear|bikini)/gi,
      /\byour\s*(body|figure|curves?)\s*(is|are)\s*(so\s*)?(sexy|hot|amazing)/gi,
      
      // General sexual content
      /\b(18\+|adult|nsfw|porn|xxx)/gi,
      /\b(horny|aroused|turned\s*on)/gi,
      /\b(masturbat|jerk\s*off|cum|orgasm)/gi,
      /\b(dick|cock|penis|pussy|vagina|tits|boobs)\s*(pic|picture|photo)?/gi,
      /\bsex(y|ual)?\s*(chat|talk|video|call)/gi,
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
      // 1. Direct suggestion to pay outside platform
      /\bcan\s*i\s*pay\s*(you\s*)?(directly|outside|off|privately)/gi,
      /\bis\s*it\s*okay\s*if\s*we\s*do\s*payment\s*outside/gi,
      /\blet'?s\s*(just\s*)?settle\s*(the\s*)?payment\s*(privately|outside|directly|off)/gi,
      /\bi\s*want\s*to\s*pay\s*off\s*(the\s*)?(platform|app|website|system)/gi,
      /\bcan\s*we\s*skip\s*(the\s*)?(system|platform|app)\s*fee/gi,
      /\bi'?d\s*rather\s*pay\s*(you\s*)?(personally|directly)/gi,
      /\bcan\s*we\s*make\s*(a\s*)?direct\s*deal/gi,
      /\blet'?s\s*avoid\s*(the\s*)?(booking|platform|system)\s*fee/gi,
      /\bcan\s*you\s*give.*?lower\s*price.*?off[-\s]?platform/gi,
      /\bpay\s*(me|us|you)?\s*(outside|off|directly|privately)/gi,
      /\bpayment\s*(outside|off|direct|private)/gi,
      /\bhandle\s*(this|payment|it)\s*(ourselves|privately|directly)/gi,
      
      // 2. Requests for GCash, bank transfer, or other wallets
      /\bwhat'?s\s*your\s*(gcash|paymaya|paypal|bank)\s*(number|account)/gi,
      /\bcan\s*i\s*send.*?(via|through|to)\s*(gcash|paymaya|paypal|bank)/gi,
      /\bdo\s*you\s*accept\s*(bank\s*transfer|gcash|paymaya|paypal|venmo|cashapp)/gi,
      /\bgive\s*me\s*your\s*(bank\s*account|gcash|paymaya|paypal)/gi,
      /\bi'?ll\s*pay\s*(via|through)\s*(gcash|paymaya|paypal|bank|venmo|cashapp)/gi,
      /\bdo\s*you\s*take\s*(gcash|paymaya|coins\.ph|paypal|venmo)/gi,
      /\b(gcash|paypal|venmo|zelle|cashapp|cash\s*app|paymaya|coins\.ph)\s*(number|account|transfer)/gi,
      /\bbank\s*(transfer|account|deposit|details)/gi,
      /\bwire\s*(transfer|money)/gi,
      /\bsend\s*(money|payment|cash)\s*(to|via|through)/gi,
      
      // 3. Sending payment information (high risk)
      /\bhere'?s\s*my\s*(gcash|bank|paymaya|paypal)\s*(number|account)/gi,
      /\bhere'?s\s*the\s*(bank\s*account|gcash)\s*number/gi,
      /\bsend\s*(the\s*)?payment\s*(request\s*)?to\s*(this|my)/gi,
      /\bmessage\s*me\s*directly\s*for\s*payment/gi,
      /\byou\s*can\s*pay\s*me\s*(through|via)\s*my\s*(gcash|bank|paymaya)/gi,
      /\bjust\s*transfer\s*to\s*my\s*(bpi|bdo|gcash|paymaya)/gi,
      /\bhere'?s\s*my\s*(bank|payment)\s*details/gi,
      /\b09\d{9}\b/g, // Philippine mobile numbers
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Account numbers
      
      // 4. Arranging in-person cash payments
      /\bi\s*can\s*pay\s*(you\s*)?cash\s*when\s*we\s*meet/gi,
      /\bi'?ll\s*(just\s*)?hand\s*you\s*(the\s*)?money/gi,
      /\blet'?s\s*meet.*?so\s*i\s*can\s*pay\s*in\s*person/gi,
      /\bcan\s*i\s*drop\s*by.*?to\s*give.*?payment\s*in\s*cash/gi,
      /\bcash\s*is\s*easier.*?no\s*need\s*to\s*book/gi,
      /\bpay.*?(cash|hand|in\s*person)/gi,
      /\bmeet.*?(cash|payment|money)/gi,
      
      // 5. Trying to avoid platform fees
      /\bit'?s\s*cheaper\s*if\s*we\s*don'?t\s*book\s*through/gi,
      /\bif\s*i\s*pay.*?directly.*?cost\s*less/gi,
      /\blet'?s\s*avoid\s*(the\s*)?(service|platform|booking|system)\s*fee/gi,
      /\bcan\s*we\s*bypass\s*(the\s*)?(system|platform|app|website)\s*fee/gi,
      /\bis\s*there\s*(a\s*)?way\s*to\s*skip.*?fee/gi,
      /\bi\s*want\s*(a\s*)?discount\s*if\s*we.*?privately/gi,
      /\bavoid.*?(fee|platform|app|website|system)/gi,
      /\b(cheaper|better|easier).*?(outside|off|direct|private)/gi,
      /\bskip\s*(the\s*)?(website|platform|app|fee|system)/gi,
      
      // 6. Negotiating direct deals
      /\blet'?s\s*make\s*(our\s*own|a\s*separate)\s*payment\s*arrangement/gi,
      /\bi'?ll\s*give\s*you.*?if\s*we\s*deal\s*privately/gi,
      /\bi\s*can\s*offer.*?if\s*we\s*skip\s*(the\s*)?(app|platform)/gi,
      /\bi'?ll\s*hire\s*you\s*long[-\s]?term\s*if\s*we.*?outside/gi,
      /\bcan\s*we\s*make\s*(a\s*)?separate\s*agreement/gi,
      /\b(private|direct)\s*(deal|payment|transaction|arrangement)/gi,
      /\bour\s*own\s*(deal|arrangement|agreement)/gi,
      
      // 7. Moving conversations off-platform for payment
      /\bmessage\s*me\s*on\s*(facebook|messenger|fb|viber|whatsapp).*?payment/gi,
      /\blet'?s\s*discuss\s*payment\s*on\s*(messenger|fb|viber|whatsapp)/gi,
      /\bcan\s*you\s*give\s*me\s*your\s*number.*?send\s*(gcash|payment)/gi,
      /\badd\s*me\s*on\s*(fb|facebook).*?payment/gi,
      /\bi'?ll\s*(dm|message)\s*you.*?payment/gi,
      /\bcontact\s*me\s*(outside|privately).*?(payment|money|cash)/gi,
      
      // 8. Checking tutor's willingness for direct payment
      /\bdo\s*you\s*allow\s*direct\s*payment/gi,
      /\bdo\s*tutors\s*accept\s*outside\s*payment/gi,
      /\bis\s*it\s*okay\s*if\s*i\s*don'?t\s*book.*?here/gi,
      /\bhow\s*do\s*i\s*pay\s*you\s*personally/gi,
      /\bcan\s*i\s*hire\s*you\s*privately/gi,
      /\bdo\s*you\s*accept.*?outside.*?(platform|app|system)/gi,
      
      // 9. Tutor initiating improper payment (serious)
      /\bbook\s*through.*?expensive.*?pay\s*me\s*via/gi,
      /\blet'?s\s*do\s*it\s*privately\s*so\s*we.*?avoid.*?fee/gi,
      /\bjust\s*send.*?payment\s*directly\s*to\s*me/gi,
      /\bwe\s*don'?t\s*need\s*to\s*use.*?platform.*?payment/gi,
      /\byou\s*can\s*pay\s*me\s*cash\s*if/gi,
      /\bi\s*accept.*?(gcash|bank|paymaya|cash).*?directly/gi,
      
      // 10. Hidden or soft implied attempts
      /\bis\s*there\s*(a\s*)?way\s*to\s*make\s*it\s*cheaper/gi,
      /\bdoes.*?app\s*always\s*need.*?for\s*paying/gi,
      /\bcan\s*we\s*arrange\s*something\s*between\s*us/gi,
      /\bcan\s*we\s*handle\s*payment.*?off\s*record/gi,
      /\bis\s*there\s*another\s*way\s*to\s*pay/gi,
      /\bdo\s*you\s*accept\s*other\s*forms\s*of\s*payment/gi,
      /\bwithout\s*using.*?(platform|app|website|system)/gi,
      
      // 11. Discount offers for private deals
      /\bif\s*i\s*pay\s*directly.*?lower.*?price/gi,
      /\bi\s*can\s*give\s*you\s*more.*?if\s*we\s*skip/gi,
      /\bprivate\s*sessions\s*are\s*cheaper/gi,
      /\bdo\s*you\s*have.*?outside\s*rate/gi,
      /\bdiscount.*?if.*?(direct|private|outside|off)/gi,
      
      // 12. Combo indicators (contact + payment)
      /\bnumber.*?(gcash|payment|money|cash|bank)/gi,
      /\b(facebook|messenger|fb|whatsapp|viber).*?(gcash|payment|money|bank)/gi,
      /\b(gcash|payment|bank).*?(facebook|messenger|fb|number)/gi,
      
      // General patterns
      /\bdon'?t\s*book\s*(here|on\s*the\s*platform|through\s*the\s*app)/gi,
      /\boff[-\s]?(platform|app|system|website)\s*(payment|deal|transaction)/gi,
      /\bprivate.*?(payment|deal|transaction|arrangement)/gi,
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
