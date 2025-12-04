# Testing Message Moderation System

> **🆕 ENHANCED**: Now includes comprehensive sexual content detection across 10 categories with 100+ patterns.

## Quick Test Guide

### Method 1: Test in Your Running App

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Login as a parent or tutor**
   - Go to http://localhost:3000/login
   - Login with your test account

3. **Open the messaging page**
   - Navigate to Messages
   - Start a conversation with another user

4. **Test these messages:**

   **✅ Should PASS (Clean Messages)**
   ```
   Hello, when are you available for a session?
   My child needs help with mathematics
   Thank you for the great tutoring!
   Can we schedule for next Tuesday?
   ```

   **🚫 Should BLOCK (High Severity)**
   
   *Sexual Content:*
   ```
   Send me nudes
   You look so sexy
   Want to have some fun later?
   Don't tell your parents about this
   Let's meet in private
   What are you wearing right now?
   ```
   
   *Off-Platform Payment:*
   ```
   Can you pay me via GCash instead?
   Let's do the payment outside the app
   Pay me directly through PayPal
   I prefer bank transfer to avoid fees
   ```
   
   *Contact Exchange:*
   ```
   Call me at 555-123-4567
   Here's my email: test@example.com
   Text me on WhatsApp
   ```

   **⚠️ Should FLAG (Medium Severity)**
   ```
   Visit my website for more info
   Check out example.com
   My contact is in my profile
   ```

5. **Check the results:**
   - Blocked messages will show an alert: "⚠️ Your message was blocked due to inappropriate content"
   - Flagged messages will send but notify admins
   - Clean messages send normally

---

### Method 2: Test with Browser Console

1. **Open your app in browser**
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Run this test:**

```javascript
// Test the moderation function directly
async function testModeration() {
  const { moderateMessage } = await import('/lib/moderation/message-moderator.ts');
  
  const testMessages = [
    "Hello, when are you available?",
    "Can you pay me via GCash?",
    "Call me at 555-1234",
    "Let's do the payment outside the app"
  ];
  
  for (const msg of testMessages) {
    const result = await moderateMessage(msg);
    console.log(`\n"${msg}"`);
    console.log(`Allowed: ${result.allowed}`);
    console.log(`Reasons: ${result.reasons.join(", ")}`);
  }
}

testModeration();
```

---

### Method 3: Create a Test Script

Create a file `scripts/test-moderation.js`:

```javascript
// Test moderation system
async function testModeration() {
  const { moderateMessage, shouldAutoBlock, getCategoryDescription } = 
    await import('../lib/moderation/message-moderator.ts');
  
  console.log('🧪 Testing Message Moderation System\n');
  console.log('=' .repeat(60));
  
  const testCases = [
    {
      category: 'Clean Messages',
      messages: [
        "Hello, when are you available?",
        "My child needs help with math",
        "Thank you for the session!"
      ]
    },
    {
      category: 'Off-Platform Payment',
      messages: [
        "Can you pay me via GCash?",
        "Let's do the payment outside the app",
        "I prefer PayPal directly"
      ]
    },
    {
      category: 'Contact Exchange',
      messages: [
        "Call me at 555-123-4567",
        "My email is test@example.com",
        "Text me on WhatsApp"
      ]
    },
    {
      category: 'External Links',
      messages: [
        "Visit my website at example.com",
        "Check out https://mysite.com"
      ]
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.category}`);
    console.log('-'.repeat(60));
    
    for (const message of testCase.messages) {
      const result = await moderateMessage(message);
      const blocked = shouldAutoBlock(result);
      
      console.log(`\nMessage: "${message}"`);
      console.log(`Status: ${result.allowed ? '✅ ALLOWED' : blocked ? '🚫 BLOCKED' : '⚠️ FLAGGED'}`);
      
      if (!result.allowed) {
        console.log(`Reasons: ${result.reasons.map(getCategoryDescription).join(', ')}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test complete!\n');
}

testModeration().catch(console.error);
```

Run it:
```bash
node scripts/test-moderation.js
```

---

### Method 4: Test in Messages Page

**Step-by-step:**

1. **Login as Parent**
   - Email: parent@test.com
   - Password: (your test password)

2. **Go to Messages**
   - Click "Messages" in navigation

3. **Start conversation with a tutor**

4. **Try sending these test messages one by one:**

   | Message | Expected Result |
   |---------|----------------|
   | "Hello!" | ✅ Sends normally |
   | "Can you pay me via GCash?" | 🚫 Blocked with error |
   | "Call me at 555-1234" | 🚫 Blocked with error |
   | "Let's do payment outside app" | 🚫 Blocked with error |
   | "Visit example.com" | ⚠️ Sends but flagged |

5. **Check browser console** (F12)
   - You'll see moderation logs
   - Example: `"Message blocked: off-platform-payment"`

---

### Method 5: Check Admin Dashboard

1. **Login as Admin**
   - Use your admin account

2. **Go to Moderation page**
   - Navigate to `/admin/moderation`

3. **View flagged messages**
   - You should see any flagged messages
   - With reasons and confidence scores

---

## Expected Behavior

### Blocked Messages (High Severity)
- User sees alert: "⚠️ Your message was blocked due to inappropriate content"
- Message is NOT saved to database
- No notification sent to recipient
- Admin receives notification about attempt

### Flagged Messages (Medium Severity)
- Message IS sent to recipient
- Message saved with `flagged: true`
- Admin receives notification
- Available in admin moderation dashboard

### Clean Messages
- Sent normally
- No flags or warnings
- Normal user experience

---

## Checking Logs

### Browser Console
```javascript
// You'll see logs like:
📤 Sending message...
🔍 Moderating message...
🚫 Message blocked: off-platform-payment
❌ Error sending message: Message blocked: off-platform-payment
```

### Server Logs (if using API)
```
Moderation check: "Can you pay me via GCash?"
Result: { allowed: false, reasons: ["off-platform-payment"] }
Message blocked
```

---

## Troubleshooting

### "Message blocked" not showing?
- Check browser console for errors
- Verify OpenAI API key is set in `.env.local`
- Check if moderation function is being called

### All messages being blocked?
- Check OpenAI API key is valid
- Check API quota/credits
- Review console for API errors

### No messages being blocked?
- Verify integration in `firebase/messages.ts`
- Check if `moderateMessage` is imported correctly
- Test with obvious violations like "pay me via gcash"

---

## Quick Verification Checklist

- [ ] OpenAI API key is set in `.env.local`
- [ ] App is running (`npm run dev`)
- [ ] Can access messaging page
- [ ] Test message "Hello" sends normally
- [ ] Test message "pay me via gcash" is blocked
- [ ] Browser console shows moderation logs
- [ ] Admin receives notification for flagged messages

---

## Sample Test Session

```
1. Login as parent
2. Go to Messages
3. Send: "Hello, when are you available?"
   → ✅ Should send successfully

4. Send: "Can you pay me via GCash instead?"
   → 🚫 Should show error alert
   → Message not sent

5. Send: "Call me at 555-1234"
   → 🚫 Should show error alert
   → Message not sent

6. Check browser console
   → Should see moderation logs

7. Login as admin
8. Check notifications
   → Should see alerts about blocked messages
```

---

## Advanced Testing

### Test with Different Confidence Levels

```javascript
// In browser console
const { moderateMessage } = await import('/lib/moderation/message-moderator.ts');

// Test borderline cases
const borderline = [
  "Can we meet outside?",  // Might flag
  "I'll pay you back",     // Might flag
  "My number is in bio"    // Might flag
];

for (const msg of borderline) {
  const result = await moderateMessage(msg);
  console.log(msg, '→', result);
}
```

### Test API Response Time

```javascript
const start = Date.now();
const result = await moderateMessage("Test message");
const duration = Date.now() - start;
console.log(`Moderation took ${duration}ms`);
```

---

## Automated Test Suite

### Run Comprehensive Sexual Content Tests

We've created an automated test suite that tests all 10 categories of sexual content detection:

```bash
# Make sure your dev server is running first
npm run dev

# In another terminal, run the test suite
node scripts/test-sexual-content-moderation.js
```

This will test:
- 70+ inappropriate messages across 10 categories
- 10+ safe messages that should NOT be flagged
- Accuracy, precision, and recall metrics
- Color-coded results for easy review

**Expected Output:**
```
=================================================================================
Sexual Content Moderation Test Suite
=================================================================================

Testing 11 categories...

1. Direct Sexual Requests
--------------------------
✓ 🚫 BLOCKED "Send me nudes."
   Reasons: sexual-content
✓ 🚫 BLOCKED "Can you send me a sexy picture?"
   Reasons: sexual-content
...

Safe Messages (Should NOT be flagged)
--------------------------------------
✓ ✅ ALLOWED "Hello, I'd like to book a session for my child."
✓ ✅ ALLOWED "What time works best for you?"
...

=================================================================================
Test Summary
=================================================================================

Total Tests: 80
Correct Blocks: 70
Correct Allows: 10
Incorrect Blocks (False Positives): 0
Incorrect Allows (False Negatives): 0

Accuracy: 100.00%
Precision: 100.00%
Recall: 100.00%

✓ Excellent! Moderation system is working well.
```

---

## Need Help?

If moderation isn't working:
1. Check `.env.local` has `OPENAI_API_KEY`
2. Restart dev server after adding API key
3. Check browser console for errors
4. Verify Firebase is initialized
5. Test with obvious violations first

Happy testing! 🧪
