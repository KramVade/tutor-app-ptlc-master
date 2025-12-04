# Message Moderation System

> **🆕 ENHANCED v2.0**: Now includes comprehensive sexual content detection with 100+ patterns across 10 categories to protect users, especially minors, from inappropriate content, grooming, and harassment.

A comprehensive message-flagging system that combines AI-based moderation (OpenAI) with custom rule-based checks to detect inappropriate content in messages.

## Features

### Flagged Categories

1. **Sexual Content** - Sexual or sexually suggestive content (100+ patterns)
   - Direct sexual requests (nudes, explicit photos)
   - Sexual comments and descriptions
   - Sexual harassment and innuendos
   - Sexualized role-play or fantasies
   - Inappropriate comments about appearance
2. **Grooming** - Inappropriate contact with minors
   - Secrecy requests ("don't tell your parents")
   - Boundary violations ("you're mature for your age")
   - Private meetup requests
3. **Harassment** - Harmful, threatening, or abusive language
4. **Hate Speech** - Hate speech or bullying
5. **Off-Platform Payment** - Messages encouraging payment outside the platform
6. **Contact Exchange** - Attempting to share personal contact information
7. **External Links** - Sharing external websites or links
8. **Spam** - Spam or suspicious advertising
9. **Threatening** - Threats, violence, or harmful content
10. **Sensitive Info** - Sharing sensitive personal information

### Enhanced Detection (v2.0)

The system now includes **100+ sophisticated patterns** specifically designed to detect:
- Direct sexual requests and explicit content
- Grooming behavior and boundary violations
- Sexual harassment and innuendos
- Inappropriate compliments and comments
- Boundary-crossing personal questions
- Sexualized role-play and fantasies
- And much more...

See [SEXUAL_CONTENT_MODERATION.md](../../SEXUAL_CONTENT_MODERATION.md) for full details.

### Detection Methods

- **AI Moderation**: OpenAI Moderation API for detecting harmful content
- **Custom Rules**: Regex-based pattern matching for platform-specific violations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Import and Use

```typescript
import { moderateMessage } from '@/lib/moderation/message-moderator';

const result = await moderateMessage("Your message here");

if (!result.allowed) {
  console.log("Message flagged:", result.reasons);
}
```

## API Reference

### `moderateMessage(message: string): Promise<ModerationResult>`

Main function to moderate a single message.

**Returns:**
```typescript
{
  allowed: boolean;           // true if message is safe
  reasons: string[];          // Array of flagged categories
  confidence?: number;        // AI confidence score (0-1)
  rawModerationResponse?: any; // Raw OpenAI response
  flaggedPatterns?: string[]; // Regex patterns that matched
}
```

**Example:**
```typescript
const result = await moderateMessage("Can you pay me via GCash?");
// {
//   allowed: false,
//   reasons: ["off-platform-payment"],
//   flaggedPatterns: [...]
// }
```

### `moderateMessages(messages: string[]): Promise<ModerationResult[]>`

Batch moderate multiple messages.

**Example:**
```typescript
const results = await moderateMessages([
  "Hello!",
  "Pay me directly",
  "Call me at 555-1234"
]);
```

### `shouldAutoBlock(result: ModerationResult): boolean`

Check if a message should be automatically blocked (high severity).

**Example:**
```typescript
if (shouldAutoBlock(result)) {
  // Block message, don't send
  return { error: "Message blocked" };
}
```

### `shouldWarn(result: ModerationResult): boolean`

Check if a message should trigger a warning (medium severity).

**Example:**
```typescript
if (shouldWarn(result)) {
  // Send message but flag for review
  await flagForAdminReview(message);
}
```

### `getCategoryDescription(category: string): string`

Get human-readable description for a flagged category.

**Example:**
```typescript
const desc = getCategoryDescription("off-platform-payment");
// "Attempting to arrange payment outside the platform"
```

## Usage Examples

### Example 1: Basic Message Validation

```typescript
async function sendMessage(text: string) {
  const moderation = await moderateMessage(text);
  
  if (moderation.allowed) {
    // Send the message
    await saveMessage(text);
    return { success: true };
  } else {
    // Reject the message
    return {
      success: false,
      error: "Message contains inappropriate content",
      reasons: moderation.reasons
    };
  }
}
```

### Example 2: Three-Tier Moderation

```typescript
async function handleMessage(text: string) {
  const moderation = await moderateMessage(text);
  
  if (moderation.allowed) {
    // ✅ Safe - send normally
    return await sendMessage(text);
  } else if (shouldAutoBlock(moderation)) {
    // 🚫 High severity - block completely
    return {
      blocked: true,
      reason: "Message blocked due to inappropriate content"
    };
  } else if (shouldWarn(moderation)) {
    // ⚠️ Medium severity - send but flag for review
    await sendMessage(text);
    await createModerationAlert(text, moderation);
    return {
      sent: true,
      flagged: true,
      warning: "Message flagged for review"
    };
  }
}
```

### Example 3: Real-time Chat Integration

```typescript
// In your chat component
async function onSendMessage(text: string) {
  const moderation = await moderateMessage(text);
  
  if (!moderation.allowed) {
    // Show error to user
    showError(
      `Message not allowed: ${moderation.reasons.map(getCategoryDescription).join(", ")}`
    );
    return;
  }
  
  // Send message
  await sendChatMessage(text);
}
```

### Example 4: Admin Moderation Dashboard

```typescript
async function getFlaggedMessages() {
  const messages = await db.messages.where({ flagged: true }).get();
  
  const moderatedMessages = await Promise.all(
    messages.map(async (msg) => {
      const moderation = await moderateMessage(msg.text);
      return {
        ...msg,
        moderation,
        descriptions: moderation.reasons.map(getCategoryDescription)
      };
    })
  );
  
  return moderatedMessages;
}
```

## Custom Rules

The system includes regex-based rules for detecting:

### Off-Platform Payment
- "pay me outside/directly"
- "GCash", "PayPal", "Venmo", "bank transfer"
- "private deal", "avoid fees"

### Contact Exchange
- Phone numbers (various formats)
- Email addresses
- "WhatsApp", "Telegram", "call me at"

### External Links
- URLs (http/https)
- Website mentions
- Domain extensions (.com, .net, etc.)

### Spam
- "Click here", "buy now", "limited offer"
- "Earn $X per day"
- MLM/pyramid schemes

### Grooming
- "meet me alone/privately"
- "don't tell your parents"
- "keep it secret"

## Recommended Additional Checks

Here are additional checks you can implement:

### 1. **Rate Limiting**
```typescript
// Detect users sending too many messages too quickly
function checkRateLimit(userId: string): boolean {
  const recentMessages = getRecentMessages(userId, 60); // last 60 seconds
  return recentMessages.length > 10; // max 10 messages per minute
}
```

### 2. **Repeated Content Detection**
```typescript
// Flag users sending the same message repeatedly
function checkDuplicateMessages(userId: string, text: string): boolean {
  const recent = getRecentMessages(userId, 300); // last 5 minutes
  const duplicates = recent.filter(msg => msg.text === text);
  return duplicates.length > 3;
}
```

### 3. **Cryptocurrency Detection**
```typescript
// Detect cryptocurrency-related scams
const cryptoPatterns = [
  /bitcoin|btc|ethereum|eth|crypto/gi,
  /wallet\s*address/gi,
  /invest.*?(crypto|coin)/gi
];
```

### 4. **Age Verification Bypass**
```typescript
// Detect attempts to bypass age verification
const ageBypassPatterns = [
  /i'?m\s*(actually|really)\s*\d+/gi,
  /lie.*?age/gi,
  /fake.*?(age|birthday)/gi
];
```

### 5. **Location Sharing**
```typescript
// Detect sharing of physical addresses
const addressPatterns = [
  /\d+\s+[A-Za-z\s]+\s+(street|st|avenue|ave|road|rd|drive|dr)/gi,
  /meet\s*at\s*[A-Z]/gi
];
```

### 6. **Image/File Requests**
```typescript
// Detect inappropriate image/file requests
const imageRequestPatterns = [
  /send.*?(pic|picture|photo|image)/gi,
  /show.*?(yourself|face|body)/gi,
  /video\s*call/gi
];
```

### 7. **Urgency/Pressure Tactics**
```typescript
// Detect pressure tactics
const pressurePatterns = [
  /(urgent|hurry|quick|now|immediately)/gi,
  /limited\s*time/gi,
  /offer\s*expires/gi
];
```

### 8. **Language Detection**
```typescript
// Detect non-English messages (if English-only platform)
function detectLanguage(text: string): string {
  // Use a language detection library
  // Return language code
}
```

### 9. **Profanity Filter**
```typescript
// Add custom profanity list
const profanityList = ["word1", "word2", ...];

function containsProfanity(text: string): boolean {
  return profanityList.some(word => 
    new RegExp(`\\b${word}\\b`, 'gi').test(text)
  );
}
```

### 10. **Context-Aware Moderation**
```typescript
// Consider conversation history
async function moderateWithContext(
  message: string,
  conversationHistory: string[]
): Promise<ModerationResult> {
  // Analyze patterns across multiple messages
  const fullContext = conversationHistory.join(" ") + " " + message;
  return await moderateMessage(fullContext);
}
```

### 11. **User Reputation Score**
```typescript
// Track user behavior over time
interface UserReputation {
  userId: string;
  flaggedMessages: number;
  totalMessages: number;
  score: number; // 0-100
}

function adjustModerationThreshold(
  result: ModerationResult,
  reputation: UserReputation
): ModerationResult {
  // Be stricter with low-reputation users
  if (reputation.score < 50 && result.confidence > 0.3) {
    return { ...result, allowed: false };
  }
  return result;
}
```

### 12. **Time-Based Patterns**
```typescript
// Detect suspicious messaging patterns
function detectSuspiciousPattern(userId: string): boolean {
  const messages = getUserMessages(userId);
  
  // Check for messages only at odd hours
  const lateNightMessages = messages.filter(msg => {
    const hour = new Date(msg.timestamp).getHours();
    return hour >= 23 || hour <= 5;
  });
  
  return lateNightMessages.length / messages.length > 0.8;
}
```

## Integration with Firebase

```typescript
// firebase/messages.ts
import { moderateMessage, shouldAutoBlock } from '@/lib/moderation/message-moderator';

export async function sendMessage(
  senderId: string,
  recipientId: string,
  text: string
) {
  // Moderate before sending
  const moderation = await moderateMessage(text);
  
  if (shouldAutoBlock(moderation)) {
    throw new Error("Message blocked: inappropriate content");
  }
  
  // Save to Firestore
  const messageData = {
    senderId,
    recipientId,
    text,
    timestamp: new Date().toISOString(),
    flagged: !moderation.allowed,
    moderationReasons: moderation.reasons,
    moderationConfidence: moderation.confidence
  };
  
  await addDoc(collection(db, 'messages'), messageData);
  
  // If flagged, notify admins
  if (!moderation.allowed) {
    await notifyAdmins(messageData, moderation);
  }
  
  return messageData;
}
```

## Testing

```typescript
// Run the examples
import { runAllExamples } from '@/lib/moderation/examples';

runAllExamples().catch(console.error);
```

## Performance Considerations

- **Caching**: Cache moderation results for identical messages
- **Async Processing**: Run AI moderation asynchronously for non-critical messages
- **Fallback**: If OpenAI API is down, rely on custom rules only
- **Rate Limiting**: Implement rate limiting on the moderation API calls

## Privacy & Compliance

- Messages are only sent to OpenAI for moderation (not stored by OpenAI)
- Consider GDPR/privacy laws when storing moderation data
- Provide users with transparency about content moderation
- Allow appeals for false positives

## License

MIT
