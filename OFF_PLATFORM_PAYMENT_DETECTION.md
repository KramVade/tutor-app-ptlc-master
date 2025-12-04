# Off-Platform Payment Detection System

## Overview

This document describes the comprehensive off-platform payment detection system designed to prevent users from circumventing the platform's payment system, which is critical for:
- Platform revenue protection
- Transaction security and dispute resolution
- User safety and fraud prevention
- Compliance with payment processing regulations

## Detection Categories

The system detects **11 comprehensive categories** of off-platform payment attempts with **100+ patterns**:

### 1. Direct Suggestion to Pay Outside Platform

Messages that explicitly suggest bypassing the platform payment system.

**Examples:**
- "Can I pay you directly?"
- "Is it okay if we do payment outside the website?"
- "Let's just settle the payment privately."
- "I want to pay off the platform."
- "Can we skip the system fee and handle this ourselves?"
- "I'd rather pay you personally, not through the app."
- "Can we make a direct deal?"
- "Let's avoid the booking fee by doing it privately."
- "Can you give me a lower price if I pay off-platform?"

### 2. Requests for GCash, Bank Transfer, or Other Wallets

Asking for payment method details outside the platform.

**Examples:**
- "What's your GCash number?"
- "Can I send the payment via GCash instead?"
- "Do you accept bank transfer?"
- "What is your PayMaya account?"
- "Can I send money to your number?"
- "Give me your bank account so I can transfer the payment."
- "I'll pay through PayPal instead of using the system."
- "Do you take Coins.ph?"

**Detected Payment Methods:**
- GCash
- PayMaya
- PayPal
- Venmo
- Zelle
- CashApp
- Coins.ph
- Bank transfers
- Wire transfers

### 3. Sending Payment Information (HIGH RISK)

Sharing actual payment account numbers or details.

**Examples:**
- "Here's my GCash number: 09123456789."
- "Here's the bank account number."
- "Send the payment request to this PayPal email."
- "Message me directly for payment."
- "You can pay me through my GCash: 09987654321."
- "Just transfer to my BPI account instead."
- "Here's my bank details."

**⚠️ CRITICAL:** These should trigger immediate account suspension and admin review.

### 4. Arranging In-Person Cash Payments

Attempting to arrange cash payments during meetups.

**Examples:**
- "I can pay you cash when we meet."
- "I'll just hand you the money during the session."
- "Let's meet somewhere so I can pay in person."
- "Can I drop by your place to give the payment in cash?"
- "Cash is easier—no need to book here."

### 5. Trying to Avoid Platform Fees

Explicitly mentioning avoiding or bypassing fees.

**Examples:**
- "It's cheaper if we don't book through the app."
- "If I pay you directly, does it cost less?"
- "Let's avoid the service fee."
- "Can we bypass the system so I don't need to pay extra?"
- "Is there a way to skip the website fee?"
- "I want a discount if we handle payment privately."

### 6. Negotiating Direct Deals

Proposing private payment arrangements.

**Examples:**
- "Let's make our own payment arrangement."
- "I'll give you ₱500 if we deal privately."
- "I can offer a better rate if we skip the app."
- "I'll hire you long-term if we do it outside the platform."
- "Can we make a separate agreement?"

### 7. Moving Conversations Off-Platform for Payment

Combining contact exchange with payment intent.

**Examples:**
- "Message me on Facebook so we can talk about payment."
- "Let's discuss payment on Messenger."
- "Can you give me your number so I can send GCash?"
- "Add me on FB, I'll send the payment details there."
- "I'll DM you the payment info."

**⚠️ HIGH RISK:** Combining contact exchange + payment discussion is a strong indicator.

### 8. Checking Tutor's Willingness for Direct Payment

Testing if the tutor accepts off-platform payments.

**Examples:**
- "Do you allow direct payment?"
- "Do tutors accept outside payments?"
- "Is it okay if I don't book the session here?"
- "How do I pay you personally?"
- "Can I hire you privately?"

### 9. Tutor Initiating Improper Payment (SERIOUS MISCONDUCT)

Tutors suggesting off-platform payments.

**Examples:**
- "Book through the app is expensive; you can pay me via GCash."
- "Let's do it privately so we both avoid the fee."
- "Just send the payment directly to me."
- "We don't need to use the platform for payment."
- "You can pay me cash if that's easier."

**⚠️ CRITICAL:** Tutors initiating this should face immediate suspension.

### 10. Hidden or Soft Implied Attempts

Subtle or indirect suggestions to bypass the platform.

**Examples:**
- "Is there a way to make it cheaper?"
- "Does the app always need to be used for paying?"
- "Can we arrange something between us?"
- "Can we handle payments off record?"
- "Is there another way to pay?"
- "Do you accept other forms of payment?"

### 11. Discount Offers for Private Deals

Offering better rates for off-platform transactions.

**Examples:**
- "If I pay directly, can you lower the price?"
- "I can give you more per hour if we skip the app."
- "Private sessions are cheaper, right?"
- "Do you have an outside rate?"

## High-Risk Combo Indicators

These combinations almost always indicate off-platform payment attempts:

### Contact Info + Payment Method
```
"Here's my number 09123456789, send GCash request."
"Add me on Messenger so I can pay you directly."
```

### Discount + Payment Outside
```
"Cheaper if I pay directly, right?"
"I'll give you more if we skip the app."
```

### Avoiding Fee + Account Number
```
"To avoid fees, you can send to my BDO account..."
"Skip the platform fee, here's my GCash: 09XXXXXXXXX"
```

**Action:** These should trigger **instant hard block** and admin notification.

## Technical Implementation

### Pattern Detection

The system uses sophisticated regex patterns that detect:
- Exact phrases and variations
- Misspellings and abbreviations
- Multiple languages (English, Tagalog mix)
- Coded language and euphemisms
- Phone numbers (Philippine format: 09XXXXXXXXX)
- Account numbers (various formats)

### Severity Levels

**CRITICAL (Immediate Block + Suspension Review):**
- Sharing actual payment account numbers
- Tutors initiating off-platform payment
- Combo indicators (contact + payment)

**HIGH (Immediate Block + Warning):**
- Direct requests for payment methods
- Arranging cash payments
- Explicit fee avoidance

**MEDIUM (Block + Flag for Review):**
- Soft implied attempts
- Checking willingness
- Discount negotiations

## Usage Examples

### Example 1: Basic Detection

```typescript
import { moderateMessage } from '@/lib/moderation/message-moderator';

const result = await moderateMessage("Can you pay me via GCash?");

if (!result.allowed && result.reasons.includes("off-platform-payment")) {
  console.log("Off-platform payment attempt detected!");
  // Block message and notify admin
}
```

### Example 2: Severity-Based Action

```typescript
const criticalPatterns = [
  /\bhere'?s\s*my\s*(gcash|bank)/gi,
  /\b09\d{9}\b/g,
  /\byou\s*can\s*pay\s*me\s*(via|through)\s*my/gi,
];

function isCriticalViolation(message: string): boolean {
  return criticalPatterns.some(pattern => pattern.test(message));
}

const result = await moderateMessage(message);

if (result.reasons.includes("off-platform-payment")) {
  if (isCriticalViolation(message)) {
    // Suspend account immediately
    await suspendUser(userId, "Critical payment violation");
    await notifyAdmins("CRITICAL", message);
  } else {
    // Block message and warn user
    await warnUser(userId, "Off-platform payment attempt");
  }
}
```

### Example 3: Tutor Monitoring

```typescript
// Special handling for tutors initiating off-platform payment
if (userRole === "tutor" && result.reasons.includes("off-platform-payment")) {
  // Tutors should NEVER suggest off-platform payment
  await suspendTutor(userId, "Initiated off-platform payment");
  await notifyAdmins("TUTOR_VIOLATION", {
    tutorId: userId,
    message: message,
    severity: "CRITICAL"
  });
  await notifyParent(recipientId, "tutor_suspended");
}
```

## Admin Actions

### When a Message is Flagged

1. **Review the Message**
   - Check full conversation context
   - Identify who initiated (parent or tutor)
   - Assess severity level

2. **Take Appropriate Action**

   **For Parents:**
   - First offense: Warning + education
   - Second offense: 24-hour suspension
   - Third offense: Permanent ban

   **For Tutors:**
   - First offense: Immediate suspension + review
   - Second offense: Permanent ban + report
   - Sharing account numbers: Immediate permanent ban

3. **Document Everything**
   - Save message evidence
   - Record action taken
   - Update user violation history

### Red Flags Requiring Immediate Action

- ✅ Sharing actual account numbers
- ✅ Tutors initiating off-platform payment
- ✅ Multiple attempts in short time
- ✅ Combo indicators (contact + payment)
- ✅ Arranging secret cash meetups

## Prevention Strategies

### User Education

**In Terms of Service:**
- Clearly state all payments must go through platform
- Explain consequences of off-platform payments
- Highlight risks (no dispute resolution, fraud)

**In User Guidelines:**
- Provide examples of prohibited messages
- Explain why platform payments are required
- Show how to report violations

**In Payment Flow:**
- Display warnings before messaging
- Show benefits of platform payments
- Make payment process easy and clear

### Platform Features

**Make Platform Payments Easy:**
- Simple, fast checkout
- Multiple payment methods
- Clear pricing
- Instant confirmation

**Reduce Incentive to Go Off-Platform:**
- Competitive fees
- Fast payouts for tutors
- Dispute resolution system
- Payment protection

**Increase Detection:**
- Real-time moderation
- Pattern learning
- User behavior analysis
- Reputation scoring

## Compliance & Legal

### Why This Matters

**Platform Protection:**
- Revenue loss prevention
- Liability reduction
- Terms of Service enforcement

**User Protection:**
- Fraud prevention
- Dispute resolution capability
- Payment security
- Transaction records

**Legal Compliance:**
- Payment processing regulations
- Tax reporting requirements
- Consumer protection laws
- Platform liability

### Evidence Preservation

When violations are detected:
1. Save complete message thread
2. Record timestamps
3. Capture user information
4. Document actions taken
5. Maintain audit trail

## Testing

### Run Automated Tests

```bash
# Test all off-platform payment patterns
node scripts/test-off-platform-payment.js
```

### Manual Testing Checklist

- [ ] Test direct payment requests
- [ ] Test payment method requests (GCash, bank, etc.)
- [ ] Test account number sharing
- [ ] Test cash payment arrangements
- [ ] Test fee avoidance language
- [ ] Test discount negotiations
- [ ] Test soft implied attempts
- [ ] Test combo indicators
- [ ] Verify safe messages are allowed
- [ ] Check admin notifications work

## Metrics to Monitor

### Weekly
- Total off-platform payment attempts
- Attempts by user type (parent vs tutor)
- Most common patterns detected
- False positive rate
- Action taken breakdown

### Monthly
- Trend analysis
- Pattern effectiveness
- User education impact
- Revenue protection estimate

## False Positives

Some legitimate messages may be flagged:

**Potential False Positives:**
- "I already paid through the platform"
- "The payment button isn't working"
- "How do I complete payment on the website?"

**Mitigation:**
- Admin review for borderline cases
- User appeal process
- Pattern refinement based on feedback
- Context-aware detection

## Future Enhancements

- [ ] Machine learning for pattern detection
- [ ] Multi-language support (Tagalog, etc.)
- [ ] Behavioral analysis (repeat offenders)
- [ ] Automated user education
- [ ] Integration with payment system
- [ ] Real-time risk scoring

---

**Last Updated:** December 4, 2024
**Version:** 2.0
**Status:** Production Ready
