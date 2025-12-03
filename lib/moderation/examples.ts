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

// Uncomment to run examples:
// runAllExamples().catch(console.error);
