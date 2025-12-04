/**
 * Examples of how to use the message moderation system
 */

import {
  moderateMessage,
  moderateMessages,
  getCategoryDescription,
  shouldAutoBlock,
  shouldWarn,
} from "./message-moderator";

// ============================================
// EXAMPLE 1: Basic message moderation
// ============================================
export async function example1_basicModeration() {
  console.log("=== Example 1: Basic Moderation ===\n");

  const message = "Can you pay me via GCash instead? It's cheaper.";

  const result = await moderateMessage(message);

  console.log("Message:", message);
  console.log("Allowed:", result.allowed);
  console.log("Reasons:", result.reasons);
  console.log("Flagged Patterns:", result.flaggedPatterns);
  console.log("\n");
}

// ============================================
// EXAMPLE 2: Handling moderation results
// ============================================
export async function example2_handleResults() {
  console.log("=== Example 2: Handle Results ===\n");

  const messages = [
    "Hello, I'd like to book a session for my child.",
    "Let's do the payment outside the app to avoid fees.",
    "You're an idiot and I hate you!",
    "Here's my phone number: 555-123-4567",
  ];

  for (const message of messages) {
    const result = await moderateMessage(message);

    console.log(`Message: "${message}"`);

    if (result.allowed) {
      console.log("✅ Message is safe to send");
    } else if (shouldAutoBlock(result)) {
      console.log("🚫 Message BLOCKED (high severity)");
      console.log("Reasons:", result.reasons.map(getCategoryDescription));
    } else if (shouldWarn(result)) {
      console.log("⚠️ Message flagged for review (medium severity)");
      console.log("Reasons:", result.reasons.map(getCategoryDescription));
    }

    console.log("\n");
  }
}

// ============================================
// EXAMPLE 3: Integration with messaging system
// ============================================
export async function example3_messagingIntegration(
  senderId: string,
  recipientId: string,
  messageText: string
) {
  console.log("=== Example 3: Messaging Integration ===\n");

  // Moderate the message before sending
  const moderation = await moderateMessage(messageText);

  if (moderation.allowed) {
    // Message is safe, send it
    console.log("✅ Sending message...");
    // await sendMessage(senderId, recipientId, messageText);
    return { success: true, messageId: "msg_123" };
  } else if (shouldAutoBlock(moderation)) {
    // Block the message and notify user
    console.log("🚫 Message blocked");
    return {
      success: false,
      error: "Your message was blocked due to inappropriate content.",
      reasons: moderation.reasons.map(getCategoryDescription),
    };
  } else if (shouldWarn(moderation)) {
    // Flag for admin review but allow sending
    console.log("⚠️ Message flagged for review");
    // await sendMessage(senderId, recipientId, messageText);
    // await createModerationAlert(senderId, messageText, moderation);
    return {
      success: true,
      messageId: "msg_124",
      warning: "Your message has been flagged for review.",
    };
  }
}

// ============================================
// EXAMPLE 4: Batch moderation
// ============================================
export async function example4_batchModeration() {
  console.log("=== Example 4: Batch Moderation ===\n");

  const messages = [
    "Hi, when are you available?",
    "Pay me directly via PayPal",
    "Call me at 555-1234",
  ];

  const results = await moderateMessages(messages);

  results.forEach((result, index) => {
    console.log(`Message ${index + 1}: "${messages[index]}"`);
    console.log(`Allowed: ${result.allowed}`);
    if (!result.allowed) {
      console.log(`Reasons: ${result.reasons.join(", ")}`);
    }
    console.log("\n");
  });
}

// ============================================
// EXAMPLE 5: Real-time chat moderation
// ============================================
export async function example5_realtimeChatModeration(
  userId: string,
  message: string
) {
  console.log("=== Example 5: Real-time Chat ===\n");

  // Check message before displaying in chat
  const moderation = await moderateMessage(message);

  if (shouldAutoBlock(moderation)) {
    // Don't display the message, show error to sender
    return {
      display: false,
      error: "Message blocked: " + moderation.reasons.join(", "),
      notifyAdmin: true,
    };
  } else if (shouldWarn(moderation)) {
    // Display message but flag it
    return {
      display: true,
      flagged: true,
      reasons: moderation.reasons,
      notifyAdmin: true,
    };
  } else {
    // Display message normally
    return {
      display: true,
      flagged: false,
    };
  }
}

// ============================================
// EXAMPLE 6: Admin moderation dashboard
// ============================================
export async function example6_adminDashboard() {
  console.log("=== Example 6: Admin Dashboard ===\n");

  // Simulate flagged messages from database
  const flaggedMessages = [
    {
      id: "msg_1",
      sender: "user_123",
      recipient: "user_456",
      text: "Let's do the deal privately",
      timestamp: new Date(),
    },
    {
      id: "msg_2",
      sender: "user_789",
      recipient: "user_012",
      text: "Here's my email: john@example.com",
      timestamp: new Date(),
    },
  ];

  console.log("Flagged Messages for Review:\n");

  for (const msg of flaggedMessages) {
    const moderation = await moderateMessage(msg.text);

    console.log(`Message ID: ${msg.id}`);
    console.log(`From: ${msg.sender} → To: ${msg.recipient}`);
    console.log(`Text: "${msg.text}"`);
    console.log(`Flagged for: ${moderation.reasons.join(", ")}`);
    console.log(
      `Descriptions: ${moderation.reasons.map(getCategoryDescription).join(", ")}`
    );
    console.log(`Confidence: ${moderation.confidence?.toFixed(2) || "N/A"}`);
    console.log("\n");
  }
}

// ============================================
// Run all examples
// ============================================
export async function runAllExamples() {
  await example1_basicModeration();
  await example2_handleResults();
  await example3_messagingIntegration(
    "user_1",
    "user_2",
    "Can you pay me outside the app?"
  );
  await example4_batchModeration();
  await example5_realtimeChatModeration(
    "user_1",
    "Text me at 555-1234 for details"
  );
  await example6_adminDashboard();
}

// ============================================
// EXAMPLE 7: Sexual content detection tests
// ============================================
export async function example7_sexualContentTests() {
  console.log("=== Example 7: Sexual Content Detection ===\n");

  const testMessages = [
    // 1. Direct sexual requests
    "Send me nudes.",
    "Can you send me a sexy picture?",
    "Show me your body.",
    "Do you have any naked photos?",
    "Send something hot.",
    "I want to see you without clothes.",
    "Can you send me a private video?",
    "I'm horny, send me pics.",
    "Do you want to do something dirty with me?",
    "Let's sext.",
    
    // 2. Sexual comments or descriptions
    "You look so sexy in your profile picture.",
    "You have a nice body.",
    "You're so hot, I can't focus on tutoring you.",
    "I'm thinking about you in a sexual way.",
    "I had a dirty dream about you.",
    "Your kid's tutor is really sexy, haha.",
    
    // 3. Sexual harassment / innuendos
    "Want to have some fun later?",
    "You're cute… too cute to be just a student.",
    "We can meet alone, just the two of us.",
    "You must have guys chasing you at night.",
    "I can give you 'extra lessons' ;)",
    "I'm sure you look good without your uniform.",
    "Are you lonely tonight?",
    "If you play nice, I'll treat you real good.",
    
    // 4. Grooming or sexual-boundary violations
    "Don't tell your parents about this conversation.",
    "This is our little secret.",
    "I can help you with school, but you need to be nice to me.",
    "I like talking to you more than kids your age.",
    "You're very mature for your age.",
    "Can you show me what you're wearing?",
    "Let's video call… just us.",
    "You don't need to tell anyone if I say something personal.",
    
    // 5. Requesting private, inappropriate meetups
    "Let's meet in private.",
    "Can we see each other at night? Alone?",
    "Don't tell anyone, but I want to meet you.",
    "Come to my place; nobody will know.",
    "I want to hug you when we meet.",
    "We can have some fun after class.",
    
    // 6. Sexual jokes / "joke but not a joke"
    "Just kidding… unless you want to ;)",
    "You'd look good in my bed.",
    "You're my type, haha.",
    "Tutor-student romance? Just joking 😉",
    "Your mom is hot, can I get their number? Lol.",
    
    // 7. Sexual compliments masked as "flattery"
    "You're too beautiful for a student.",
    "You look like a model, not a parent.",
    "I can't stop thinking about how cute you are.",
    "You have such a nice figure.",
    "You're the most attractive person I talk to.",
    
    // 8. Boundary-crossing personal questions
    "Do you have a boyfriend?",
    "Are you a virgin?",
    "Are you dating anyone older?",
    "Have you ever kissed someone?",
    "What turns you on?",
    "What are you wearing right now?",
    
    // 9. Sexualized role-play or fantasies
    "Imagine we're alone in a room…",
    "What if I kiss you during tutoring?",
    "I dreamt about tutoring but you were naked.",
    "Let's pretend we're dating.",
    
    // 10. Inappropriate comments about appearance
    "Why do you dress like that? It's sexy.",
    "Your lips look kissable.",
    "You should wear tighter clothes.",
    "You have a nice chest.",
    "I bet you look amazing in lingerie.",
    
    // Safe messages (should NOT be flagged)
    "Hello, I'd like to book a session for my child.",
    "What time works best for you?",
    "My daughter needs help with math homework.",
    "Thank you for the great tutoring session!",
    "Can we reschedule to next Tuesday?",
  ];

  let flaggedCount = 0;
  let safeCount = 0;

  for (const message of testMessages) {
    const result = await moderateMessage(message);
    
    if (!result.allowed) {
      flaggedCount++;
      console.log(`🚫 FLAGGED: "${message}"`);
      console.log(`   Reasons: ${result.reasons.join(", ")}`);
      console.log(`   Patterns: ${result.flaggedPatterns?.length || 0} matched`);
    } else {
      safeCount++;
      console.log(`✅ SAFE: "${message}"`);
    }
    console.log("\n");
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total messages tested: ${testMessages.length}`);
  console.log(`Flagged: ${flaggedCount}`);
  console.log(`Safe: ${safeCount}`);
  console.log("\n");
}

// ============================================
// EXAMPLE 8: Off-platform payment detection tests
// ============================================
export async function example8_offPlatformPaymentTests() {
  console.log("=== Example 8: Off-Platform Payment Detection ===\n");

  const testMessages = [
    // 1. Direct suggestion to pay outside platform
    "Can I pay you directly?",
    "Is it okay if we do payment outside the website?",
    "Let's just settle the payment privately.",
    "I want to pay off the platform.",
    "Can we skip the system fee and handle this ourselves?",
    "I'd rather pay you personally, not through the app.",
    "Can we make a direct deal?",
    "Let's avoid the booking fee by doing it privately.",
    "Can you give me a lower price if I pay off-platform?",
    
    // 2. Requests for GCash, bank transfer, or other wallets
    "What's your GCash number?",
    "Can I send the payment via GCash instead?",
    "Do you accept bank transfer?",
    "What is your PayMaya account?",
    "Can I send money to your number?",
    "Give me your bank account so I can transfer the payment.",
    "I'll pay through PayPal instead of using the system.",
    "Do you take Coins.ph?",
    
    // 3. Sending payment information (high risk)
    "Here's my GCash number: 09123456789.",
    "Here's the bank account number.",
    "Send the payment request to this PayPal email.",
    "Message me directly for payment.",
    "You can pay me through my GCash: 09987654321.",
    "Just transfer to my BPI account instead.",
    "Here's my bank details.",
    
    // 4. Arranging in-person cash payments
    "I can pay you cash when we meet.",
    "I'll just hand you the money during the session.",
    "Let's meet somewhere so I can pay in person.",
    "Can I drop by your place to give the payment in cash?",
    "Cash is easier—no need to book here.",
    
    // 5. Trying to avoid platform fees
    "It's cheaper if we don't book through the app.",
    "If I pay you directly, does it cost less?",
    "Let's avoid the service fee.",
    "Can we bypass the system so I don't need to pay extra?",
    "Is there a way to skip the website fee?",
    "I want a discount if we handle payment privately.",
    
    // 6. Negotiating direct deals
    "Let's make our own payment arrangement.",
    "I'll give you ₱500 if we deal privately.",
    "I can offer a better rate if we skip the app.",
    "I'll hire you long-term if we do it outside the platform.",
    "Can we make a separate agreement?",
    
    // 7. Moving conversations off-platform for payment
    "Message me on Facebook so we can talk about payment.",
    "Let's discuss payment on Messenger.",
    "Can you give me your number so I can send GCash?",
    "Add me on FB, I'll send the payment details there.",
    "I'll DM you the payment info.",
    
    // 8. Checking tutor's willingness
    "Do you allow direct payment?",
    "Do tutors accept outside payments?",
    "Is it okay if I don't book the session here?",
    "How do I pay you personally?",
    "Can I hire you privately?",
    
    // 9. Tutor initiating improper payment
    "Book through the app is expensive; you can pay me via GCash.",
    "Let's do it privately so we both avoid the fee.",
    "Just send the payment directly to me.",
    "We don't need to use the platform for payment.",
    "You can pay me cash if that's easier.",
    
    // 10. Hidden or soft implied attempts
    "Is there a way to make it cheaper?",
    "Does the app always need to be used for paying?",
    "Can we arrange something between us?",
    "Can we handle payments off record?",
    "Is there another way to pay?",
    "Do you accept other forms of payment?",
    
    // 11. Discount offers for private deals
    "If I pay directly, can you lower the price?",
    "I can give you more per hour if we skip the app.",
    "Private sessions are cheaper, right?",
    "Do you have an outside rate?",
    
    // Safe messages (should NOT be flagged)
    "I'll pay through the platform.",
    "How do I complete payment on the website?",
    "The payment button isn't working.",
    "I've already paid through the app.",
    "When will the payment be processed?",
  ];

  let flaggedCount = 0;
  let safeCount = 0;

  for (const message of testMessages) {
    const result = await moderateMessage(message);
    
    if (!result.allowed && result.reasons.includes("off-platform-payment")) {
      flaggedCount++;
      console.log(`🚫 FLAGGED: "${message}"`);
      console.log(`   Category: off-platform-payment`);
    } else if (!result.allowed) {
      console.log(`⚠️ FLAGGED (other): "${message}"`);
      console.log(`   Reasons: ${result.reasons.join(", ")}`);
    } else {
      safeCount++;
      console.log(`✅ SAFE: "${message}"`);
    }
    console.log("\n");
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total messages tested: ${testMessages.length}`);
  console.log(`Flagged for off-platform payment: ${flaggedCount}`);
  console.log(`Safe: ${safeCount}`);
  console.log("\n");
}

// Uncomment to run examples:
// runAllExamples().catch(console.error);
// example7_sexualContentTests().catch(console.error);
// example8_offPlatformPaymentTests().catch(console.error);
