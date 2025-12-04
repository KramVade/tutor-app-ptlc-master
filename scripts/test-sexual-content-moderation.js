/**
 * Test Script for Sexual Content Moderation
 * 
 * This script tests the enhanced sexual content detection patterns
 * across all 10 categories with comprehensive examples.
 * 
 * Run with: node scripts/test-sexual-content-moderation.js
 */

// Test messages organized by category
const testCases = {
  "1. Direct Sexual Requests": [
    "Send me nudes.",
    "Can you send me a sexy picture?",
    "Show me your body.",
    "Show me your breasts.",
    "Do you have any naked photos?",
    "Send something hot.",
    "I want to see you without clothes.",
    "Can you send me a private video?",
    "I'm horny, send me pics.",
    "Do you want to do something dirty with me?",
    "Let's sext.",
  ],
  
  "2. Sexual Comments or Descriptions": [
    "You look so sexy in your profile picture.",
    "You have a nice body.",
    "You're so hot, I can't focus on tutoring you.",
    "I'm thinking about you in a sexual way.",
    "I had a dirty dream about you.",
    "Your kid's tutor is really sexy, haha.",
    "You're too beautiful for a student.",
  ],
  
  "3. Sexual Harassment / Innuendos": [
    "Want to have some fun later?",
    "You're cute… too cute to be just a student.",
    "We can meet alone, just the two of us.",
    "You must have guys chasing you at night.",
    "I can give you 'extra lessons' ;)",
    "I'm sure you look good without your uniform.",
    "Are you lonely tonight?",
    "If you play nice, I'll treat you real good.",
  ],
  
  "4. Grooming or Sexual-Boundary Violations": [
    "Don't tell your parents about this conversation.",
    "This is our little secret.",
    "I can help you with school, but you need to be nice to me.",
    "I like talking to you more than kids your age.",
    "You're very mature for your age.",
    "Can you show me what you're wearing?",
    "Let's video call… just us.",
    "You don't need to tell anyone if I say something personal.",
  ],
  
  "5. Requesting Private, Inappropriate Meetups": [
    "Let's meet in private.",
    "Can we see each other at night? Alone?",
    "Don't tell anyone, but I want to meet you.",
    "Come to my place; nobody will know.",
    "I want to hug you when we meet.",
    "I want to kiss you when we meet.",
    "We can have some fun after class.",
  ],
  
  "6. Sexual Jokes / 'Joke but Not a Joke'": [
    "Just kidding… unless you want to ;)",
    "You'd look good in my bed.",
    "You're my type, haha.",
    "Tutor-student romance? Just joking 😉",
    "Your mom is hot, can I get their number? Lol.",
  ],
  
  "7. Sexual Compliments Masked as 'Flattery'": [
    "You're too beautiful for a student.",
    "You look like a model, not a parent.",
    "I can't stop thinking about how cute you are.",
    "You have such a nice figure.",
    "You're the most attractive person I talk to.",
  ],
  
  "8. Boundary-Crossing Personal Questions": [
    "Do you have a boyfriend?",
    "Do you have a girlfriend?",
    "Are you a virgin?",
    "Are you dating anyone older?",
    "Have you ever kissed someone?",
    "What turns you on?",
    "What are you wearing right now?",
  ],
  
  "9. Sexualized Role-Play or Fantasies": [
    "Imagine we're alone in a room…",
    "What if I kiss you during tutoring?",
    "I dreamt about tutoring but you were naked.",
    "Let's pretend we're dating.",
  ],
  
  "10. Inappropriate Comments About Appearance": [
    "Why do you dress like that? It's sexy.",
    "Your lips look kissable.",
    "You should wear tighter clothes.",
    "You have a nice chest.",
    "I bet you look amazing in lingerie.",
    "You have a nice ass.",
  ],
  
  "Safe Messages (Should NOT be flagged)": [
    "Hello, I'd like to book a session for my child.",
    "What time works best for you?",
    "My daughter needs help with math homework.",
    "Thank you for the great tutoring session!",
    "Can we reschedule to next Tuesday?",
    "The payment is showing as pending.",
    "My son really enjoyed the lesson.",
    "Do you have experience with algebra?",
    "I appreciate your patience with my child.",
    "Looking forward to our next session.",
  ],
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printHeader(text) {
  console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function printCategory(category) {
  console.log(`\n${colors.bold}${colors.magenta}${category}${colors.reset}`);
  console.log(`${colors.magenta}${'-'.repeat(category.length)}${colors.reset}`);
}

function printResult(message, shouldBlock, isBlocked, reasons = []) {
  const status = isBlocked 
    ? `${colors.red}🚫 BLOCKED${colors.reset}` 
    : `${colors.green}✅ ALLOWED${colors.reset}`;
  
  const correctness = (shouldBlock === isBlocked)
    ? `${colors.green}✓${colors.reset}`
    : `${colors.red}✗ INCORRECT${colors.reset}`;
  
  console.log(`${correctness} ${status} "${message}"`);
  
  if (isBlocked && reasons.length > 0) {
    console.log(`   ${colors.yellow}Reasons: ${reasons.join(', ')}${colors.reset}`);
  }
}

async function testModeration() {
  printHeader('Sexual Content Moderation Test Suite');
  
  console.log(`${colors.bold}Testing ${Object.keys(testCases).length} categories...${colors.reset}`);
  
  let totalTests = 0;
  let correctBlocks = 0;
  let incorrectBlocks = 0;
  let correctAllows = 0;
  let incorrectAllows = 0;
  
  for (const [category, messages] of Object.entries(testCases)) {
    printCategory(category);
    
    const shouldBlock = !category.includes("Safe Messages");
    
    for (const message of messages) {
      totalTests++;
      
      try {
        // Call the moderation API
        const response = await fetch('http://localhost:3000/api/moderate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });
        
        if (!response.ok) {
          console.log(`${colors.red}✗ API Error for: "${message}"${colors.reset}`);
          continue;
        }
        
        const result = await response.json();
        const isBlocked = result.flagged || false;
        const reasons = result.reasons || [];
        
        printResult(message, shouldBlock, isBlocked, reasons);
        
        // Track accuracy
        if (shouldBlock && isBlocked) {
          correctBlocks++;
        } else if (shouldBlock && !isBlocked) {
          incorrectAllows++;
        } else if (!shouldBlock && !isBlocked) {
          correctAllows++;
        } else {
          incorrectBlocks++;
        }
        
      } catch (error) {
        console.log(`${colors.red}✗ Error testing: "${message}"${colors.reset}`);
        console.log(`   ${error.message}`);
      }
    }
  }
  
  // Print summary
  printHeader('Test Summary');
  
  console.log(`${colors.bold}Total Tests:${colors.reset} ${totalTests}`);
  console.log(`${colors.green}Correct Blocks:${colors.reset} ${correctBlocks}`);
  console.log(`${colors.green}Correct Allows:${colors.reset} ${correctAllows}`);
  console.log(`${colors.red}Incorrect Blocks (False Positives):${colors.reset} ${incorrectBlocks}`);
  console.log(`${colors.red}Incorrect Allows (False Negatives):${colors.reset} ${incorrectAllows}`);
  
  const accuracy = ((correctBlocks + correctAllows) / totalTests * 100).toFixed(2);
  const precision = correctBlocks / (correctBlocks + incorrectBlocks) * 100 || 0;
  const recall = correctBlocks / (correctBlocks + incorrectAllows) * 100 || 0;
  
  console.log(`\n${colors.bold}Accuracy:${colors.reset} ${accuracy}%`);
  console.log(`${colors.bold}Precision:${colors.reset} ${precision.toFixed(2)}%`);
  console.log(`${colors.bold}Recall:${colors.reset} ${recall.toFixed(2)}%`);
  
  if (accuracy >= 95) {
    console.log(`\n${colors.green}${colors.bold}✓ Excellent! Moderation system is working well.${colors.reset}`);
  } else if (accuracy >= 85) {
    console.log(`\n${colors.yellow}${colors.bold}⚠ Good, but could be improved.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}✗ Needs improvement. Review patterns and adjust.${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Note: Make sure your development server is running on http://localhost:3000${colors.reset}\n`);
}

// Run the tests
console.log(`${colors.bold}Starting moderation tests...${colors.reset}`);
console.log(`${colors.yellow}Make sure your Next.js dev server is running!${colors.reset}\n`);

testModeration().catch(error => {
  console.error(`${colors.red}${colors.bold}Test failed:${colors.reset}`, error);
  process.exit(1);
});
