# Sexual Content Moderation System

## Overview

This document describes the enhanced sexual content moderation system implemented to protect users (especially minors) from inappropriate sexual content, grooming, and harassment in the tutoring platform's messaging system.

## Detection Categories

The system now detects **10 comprehensive categories** of sexual and inappropriate content:

### 1. Direct Sexual Requests
Messages that openly ask for sexual acts, photos, or explicit content.

**Examples:**
- "Send me nudes."
- "Can you send me a sexy picture?"
- "Show me your body / breasts / private parts."
- "Do you have any naked photos?"
- "Send something hot / steamy / adult."
- "I want to see you without clothes."
- "Can you send me a private video?"
- "I'm horny, send me pics."
- "Do you want to do something dirty with me?"
- "Let's sext."

### 2. Sexual Comments or Descriptions
Not requesting anything, but describing sexual content.

**Examples:**
- "You look so sexy in your profile picture."
- "You have a nice body."
- "You're so hot, I can't focus on tutoring you."
- "I'm thinking about you in a sexual way."
- "I had a dirty dream about you."
- "Your kid's tutor is really sexy, haha."

### 3. Sexual Harassment / Innuendos
Indirect sexual implications, flirtation, or coded language.

**Examples:**
- "Want to have some fun later?" (sexual tone)
- "You're cute… too cute to be just a student/parent."
- "We can meet alone, just the two of us."
- "You must have guys/girls chasing you at night."
- "I can give you 'extra lessons' ;)"
- "I'm sure you look good without your uniform."
- "Are you lonely tonight?"
- "If you play nice, I'll treat you real good."

### 4. Grooming or Sexual-Boundary Violations
Dangerous behavior especially if the receiver is a minor.

**Examples:**
- "Don't tell your parents about this conversation."
- "This is our little secret."
- "I can help you with school, but you need to be nice to me."
- "I like talking to you more than kids your age."
- "You're very mature for your age."
- "Can you show me what you're wearing?"
- "Let's video call… just us."
- "You don't need to tell anyone if I say something personal."

### 5. Requesting Private, Inappropriate Meetups
Sexual or potentially sexual invitations.

**Examples:**
- "Let's meet in private."
- "Can we see each other at night? Alone?"
- "Don't tell anyone, but I want to meet you."
- "Come to my place; nobody will know."
- "I want to hug/kiss you when we meet."
- "We can have some fun after class."

### 6. Sexual Jokes / "Joke but Not a Joke"
Often passed off as humor but still inappropriate.

**Examples:**
- "Just kidding… unless you want to ;)"
- "You'd look good in my bed."
- "You're my type, haha."
- "Tutor-student romance? Just joking 😉"
- "Your mom/dad is hot, can I get their number? Lol."

### 7. Sexual Compliments Masked as "Flattery"
Still inappropriate in a tutoring environment.

**Examples:**
- "You're too beautiful for a student."
- "You look like a model, not a parent."
- "I can't stop thinking about how cute you are."
- "You have such a nice figure."
- "You're the most attractive person I talk to."

### 8. Boundary-Crossing Personal Questions
Testing limits towards sexual topics.

**Examples:**
- "Do you have a boyfriend/girlfriend?"
- "Are you a virgin?"
- "Are you dating anyone older?"
- "Have you ever kissed someone?"
- "What turns you on?"
- "What are you wearing right now?"

### 9. Sexualized Role-Play or Fantasies
Very alarming in a tutoring system.

**Examples:**
- "Imagine we're alone in a room…"
- "What if I kiss you during tutoring?"
- "I dreamt about tutoring but you were naked."
- "Let's pretend we're dating."

### 10. Inappropriate Comments About Appearance
When the message focuses on sexualizing the person.

**Examples:**
- "Why do you dress like that? It's sexy."
- "Your lips look kissable."
- "You should wear tighter clothes."
- "You have a nice chest."
- "I bet you look amazing in lingerie."

## Technical Implementation

### Pattern Matching
The system uses **100+ regex patterns** to detect variations of inappropriate content, including:
- Misspellings and variations
- Coded language and innuendos
- Emoji usage in sexual context
- Multi-word phrases with context

### Dual-Layer Protection
1. **Custom Rule-Based Detection**: Fast, pattern-based matching for known inappropriate content
2. **AI-Based Moderation**: OpenAI Moderation API for context-aware detection

### Severity Levels

**High Severity (Auto-Block):**
- Sexual content
- Grooming behavior
- Threatening messages
- Harassment
- Off-platform payment attempts
- Contact information exchange
- Sensitive personal information

**Medium Severity (Flag for Review):**
- External links
- Spam content

## Usage

### Basic Message Moderation

```typescript
import { moderateMessage } from '@/lib/moderation/message-moderator';

const result = await moderateMessage("Your message here");

if (!result.allowed) {
  console.log("Message blocked:", result.reasons);
}
```

### Integration with Messaging System

```typescript
// Before sending a message
const moderation = await moderateMessage(messageText);

if (moderation.allowed) {
  // Send the message
  await sendMessage(senderId, recipientId, messageText);
} else if (shouldAutoBlock(moderation)) {
  // Block and notify user
  return {
    error: "Your message was blocked due to inappropriate content.",
    reasons: moderation.reasons
  };
}
```

### Admin Dashboard Integration

The moderation system automatically flags messages for admin review. Admins can:
- View all flagged messages
- See which patterns were matched
- Review confidence scores
- Take action (warn, suspend, ban users)

## Testing

Run the comprehensive test suite:

```typescript
import { example7_sexualContentTests } from '@/lib/moderation/examples';

// Test all 10 categories with 70+ examples
await example7_sexualContentTests();
```

## Privacy & Security

- Messages are moderated in real-time before being stored
- Flagged messages are logged for admin review
- User privacy is maintained (no message content shared externally except with OpenAI API)
- All moderation actions are auditable

## False Positives

The system is designed to be strict to protect minors. Some legitimate messages may be flagged:

**Examples of potential false positives:**
- "My daughter is beautiful and smart" (compliment about own child)
- "The tutor is hot on the topic of math" (using "hot" to mean "knowledgeable")

**Mitigation:**
- Admins can review and approve flagged messages
- Users can appeal blocked messages
- System learns from admin decisions over time

## Reporting & Analytics

The admin dashboard provides:
- Total messages moderated
- Flagged message count by category
- Most common violation types
- User violation history
- Trend analysis over time

## Compliance

This system helps ensure compliance with:
- Child Online Privacy Protection Act (COPPA)
- General Data Protection Regulation (GDPR)
- Platform safety guidelines
- Educational platform standards

## Future Enhancements

Planned improvements:
1. Machine learning model trained on platform-specific data
2. Context-aware detection (considering conversation history)
3. Multi-language support
4. Image/video content moderation
5. Real-time user behavior analysis
6. Automated user education (warnings with explanations)

## Support

For questions or issues with the moderation system:
- Check the admin moderation dashboard
- Review flagged messages manually
- Adjust patterns in `lib/moderation/message-moderator.ts`
- Contact system administrators

---

**Last Updated:** December 4, 2024
**Version:** 2.0
**Maintained By:** Platform Safety Team
