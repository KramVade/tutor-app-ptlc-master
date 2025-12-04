# Message Moderation System - Implementation Guide

## Overview

This guide explains how to implement and use the message moderation system in your PTLC Digital Coach platform.

## Quick Start

### 1. Setup OpenAI API Key

Add to your `.env.local`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Basic Usage

```typescript
import { moderateMessage } from '@/lib/moderation/message-moderator';

// Before sending a message
const result = await moderateMessage(messageText);

if (!result.allowed) {
  // Block or flag the message
  console.log("Flagged for:", result.reasons);
}
```

## Integration Points

### 1. Chat/Messaging System

Update `firebase/messages.ts` to moderate messages before sending:

```typescript
import { moderateMessage, shouldAutoBlock } from '@/lib/moderation/message-moderator';

export async function sendMessage(
  senderId: string,
  recipientId: string,
  text: string
) {
  // Moderate the message
  const moderation = await moderateMessage(text);
  
  // Block high-severity content
  if (shouldAutoBlock(moderation)) {
    throw new Error(
      `Message blocked: ${moderation.reasons.join(", ")}`
    );
  }
  
  // Save message with moderation flags
  const messageData = {
    senderId,
    recipientId,
    text,
    timestamp: new Date().toISOString(),
    flagged: !moderation.allowed,
    moderationReasons: moderation.reasons,
    moderationConfidence: moderation.confidence,
  };
  
  const docRef = await addDoc(collection(db, 'messages'), messageData);
  
  // Notify admins if flagged
  if (!moderation.allowed) {
    await createModerationAlert(senderId, text, moderation);
  }
  
  return docRef.id;
}
```

### 2. Chat Interface Component

Update `components/messaging/chat-interface.tsx`:

```typescript
import { moderateMessage, shouldAutoBlock, getCategoryDescription } from '@/lib/moderation/message-moderator';

const handleSendMessage = async () => {
  if (!newMessage.trim()) return;
  
  try {
    // Moderate before sending
    const moderation = await moderateMessage(newMessage);
    
    if (shouldAutoBlock(moderation)) {
      // Show error to user
      showToast({
        type: "error",
        title: "Message Blocked",
        message: `Your message contains inappropriate content: ${
          moderation.reasons.map(getCategoryDescription).join(", ")
        }`,
      });
      return;
    }
    
    // Send the message
    await sendMessage(user.id, conversationId, newMessage);
    setNewMessage("");
    
    // Show warning if flagged
    if (!moderation.allowed) {
      showToast({
        type: "warning",
        title: "Message Flagged",
        message: "Your message has been sent but flagged for review.",
      });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    showToast({
      type: "error",
      title: "Error",
      message: "Failed to send message",
    });
  }
};
```

### 3. Admin Moderation Dashboard

Update `app/admin/moderation/page.tsx` to show flagged messages:

```typescript
import { getCategoryDescription } from '@/lib/moderation/message-moderator';

export default function ModerationPage() {
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  
  useEffect(() => {
    loadFlaggedMessages();
  }, []);
  
  const loadFlaggedMessages = async () => {
    const { getFlaggedMessages } = await import("@/firebase/messages");
    const messages = await getFlaggedMessages();
    setFlaggedMessages(messages);
  };
  
  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Message Moderation</h1>
        
        <div className="space-y-4">
          {flaggedMessages.map((msg) => (
            <AirbnbCard key={msg.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{msg.senderName}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold">{msg.recipientName}</span>
                  </div>
                  
                  <p className="text-sm mb-2">{msg.text}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {msg.moderationReasons?.map((reason) => (
                      <span
                        key={reason}
                        className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full"
                      >
                        {getCategoryDescription(reason)}
                      </span>
                    ))}
                  </div>
                  
                  {msg.moderationConfidence && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Confidence: {(msg.moderationConfidence * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <AirbnbButton
                    size="sm"
                    variant="outline"
                    onClick={() => approveMessage(msg.id)}
                  >
                    Approve
                  </AirbnbButton>
                  <AirbnbButton
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMessage(msg.id)}
                  >
                    Delete
                  </AirbnbButton>
                </div>
              </div>
            </AirbnbCard>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
```

## Flagged Categories

> **🆕 ENHANCED SEXUAL CONTENT DETECTION**: The system now includes 100+ patterns across 10 comprehensive categories to detect sexual content, grooming, and harassment. See [SEXUAL_CONTENT_MODERATION.md](./SEXUAL_CONTENT_MODERATION.md) for full details.

### High Severity (Auto-Block)
- **Sexual Content**: Sexual or sexually suggestive content (100+ patterns)
  - Direct sexual requests (nudes, explicit photos)
  - Sexual comments and descriptions
  - Sexual harassment and innuendos
  - Sexualized role-play or fantasies
  - Inappropriate comments about appearance
- **Grooming**: Inappropriate contact with minors
  - Secrecy requests ("don't tell your parents")
  - Boundary violations ("you're mature for your age")
  - Private meetup requests
- **Threatening**: Threatening or violent language
- **Violence**: Violent or graphic content
- **Hate Speech**: Hate speech or discriminatory language
- **Harassment**: Profanity, insults, bullying, or abusive language
- **Off-Platform Payment**: Attempting to arrange payment outside the platform
- **Contact Exchange**: Sharing personal contact information
- **Sensitive Info**: Sharing sensitive personal information

### Medium Severity (Flag for Review)
- **External Links**: Sharing external websites
- **Spam**: Spam or suspicious advertising

### Quick Reference
For a quick reference guide on what gets blocked and admin actions, see [MODERATION_QUICK_REFERENCE.md](./MODERATION_QUICK_REFERENCE.md)

## Detection Examples

### Sexual Content (NEW - Enhanced Detection)
```
❌ "Send me nudes"
❌ "You look so sexy in your profile picture"
❌ "Want to have some fun later?"
❌ "You're too cute to be just a student"
❌ "I had a dirty dream about you"
❌ "Just kidding... unless you want to ;)"
❌ "What are you wearing right now?"
❌ "Imagine we're alone in a room..."
❌ "Your lips look kissable"
❌ "I bet you look amazing in lingerie"
✅ "Thank you for the great tutoring session!"
✅ "My daughter really enjoyed the lesson"
```

### Grooming & Boundary Violations
```
❌ "Don't tell your parents about this conversation"
❌ "This is our little secret"
❌ "You're very mature for your age"
❌ "Can you show me what you're wearing?"
❌ "Let's video call... just us"
❌ "Let's meet in private"
❌ "Come to my place; nobody will know"
❌ "I want to hug you when we meet"
✅ "I look forward to our tutoring session"
✅ "See you at the scheduled time"
```

### Off-Platform Payment
```
❌ "Can you pay me via GCash instead?"
❌ "Let's do the payment outside the app"
❌ "I prefer PayPal directly"
❌ "Send money to my bank account"
✅ "I accept payment through the platform"
```

### Contact Exchange
```
❌ "Call me at 555-123-4567"
❌ "My email is john@example.com"
❌ "Text me on WhatsApp"
❌ "Reach me at this number"
✅ "Let's continue chatting here"
```

### External Links
```
❌ "Visit my website at example.com"
❌ "Check out https://mysite.com"
❌ "Go to www.tutoring.com"
✅ "I have 5 years of experience"
```

### Harassment & Threats
```
❌ "You're an idiot and I hate you"
❌ "Your kid is stupid"
❌ "I'll hurt you if you don't comply"
❌ "You're worthless and ugly"
✅ "I respectfully disagree"
✅ "Let's discuss this professionally"
```

## Testing

### Test Messages

```typescript
// Test the moderation system
const testMessages = [
  // Should pass
  "Hello! When are you available for a session?",
  "My child needs help with mathematics.",
  "Thank you for the great tutoring session!",
  
  // Should be flagged
  "Can you pay me via GCash?",
  "Here's my phone number: 555-1234",
  "Let's do the deal privately",
  "You're an idiot!",
  "Visit my website for more info",
];

for (const message of testMessages) {
  const result = await moderateMessage(message);
  console.log(`"${message}"`);
  console.log(`Allowed: ${result.allowed}`);
  console.log(`Reasons: ${result.reasons.join(", ")}`);
  console.log("---");
}
```

## Performance Optimization

### 1. Cache Results
```typescript
const moderationCache = new Map<string, ModerationResult>();

async function moderateMessageCached(text: string) {
  if (moderationCache.has(text)) {
    return moderationCache.get(text)!;
  }
  
  const result = await moderateMessage(text);
  moderationCache.set(text, result);
  return result;
}
```

### 2. Debounce Real-time Checks
```typescript
import { debounce } from 'lodash';

const debouncedModerate = debounce(async (text: string) => {
  const result = await moderateMessage(text);
  // Show warning in UI if flagged
  if (!result.allowed) {
    showWarning(result.reasons);
  }
}, 500);

// In your input handler
onChange={(e) => {
  setMessage(e.target.value);
  debouncedModerate(e.target.value);
}}
```

### 3. Background Processing
```typescript
// For non-critical messages, moderate asynchronously
async function sendMessageAsync(text: string) {
  // Send immediately
  const messageId = await sendMessage(text);
  
  // Moderate in background
  moderateMessage(text).then((result) => {
    if (!result.allowed) {
      // Flag the message retroactively
      updateMessage(messageId, { flagged: true, reasons: result.reasons });
      notifyAdmins(messageId);
    }
  });
}
```

## Firestore Rules

Update `firestore.rules` to prevent sending flagged messages:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      // Only allow creating messages that aren't flagged
      allow create: if request.auth != null 
        && request.resource.data.senderId == request.auth.uid
        && (!request.resource.data.keys().hasAny(['flagged']) 
            || request.resource.data.flagged == false);
      
      // Allow reading own messages
      allow read: if request.auth != null 
        && (resource.data.senderId == request.auth.uid 
            || resource.data.recipientId == request.auth.uid);
      
      // Admins can update flagged status
      allow update: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Monitoring & Analytics

Track moderation metrics:

```typescript
// Track moderation stats
interface ModerationStats {
  totalMessages: number;
  flaggedMessages: number;
  blockedMessages: number;
  topCategories: Record<string, number>;
  falsePositives: number;
}

async function getModerationStats(startDate: Date, endDate: Date) {
  const messages = await getMessagesBetween(startDate, endDate);
  
  const stats: ModerationStats = {
    totalMessages: messages.length,
    flaggedMessages: messages.filter(m => m.flagged).length,
    blockedMessages: messages.filter(m => m.blocked).length,
    topCategories: {},
    falsePositives: messages.filter(m => m.falsePositive).length,
  };
  
  // Count categories
  messages.forEach(msg => {
    msg.moderationReasons?.forEach(reason => {
      stats.topCategories[reason] = (stats.topCategories[reason] || 0) + 1;
    });
  });
  
  return stats;
}
```

## Troubleshooting

### OpenAI API Not Working
- Check your API key is correct
- Verify you have credits in your OpenAI account
- System will fall back to custom rules only if API fails

### Too Many False Positives
- Adjust confidence thresholds in `shouldAutoBlock()`
- Add exceptions for common phrases
- Implement user reputation system

### Performance Issues
- Enable caching for repeated messages
- Use background processing for non-critical checks
- Consider rate limiting moderation API calls

## Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Integrate with messaging system
3. ✅ Add admin moderation dashboard
4. ⬜ Implement user appeals system
5. ⬜ Add reputation scoring
6. ⬜ Set up monitoring and alerts
7. ⬜ Train custom ML model (optional)

## Support

For issues or questions:
- Check the examples in `lib/moderation/examples.ts`
- Review the README in `lib/moderation/README.md`
- Test with the provided test messages
