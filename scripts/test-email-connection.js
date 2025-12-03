/**
 * Test Email Connection Script
 * 
 * This script tests if your Gmail SMTP configuration is working correctly.
 * Run with: node scripts/test-email-connection.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConnection() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Checking environment variables:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('   EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || 'Not set (optional)');
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Missing EMAIL_USER or EMAIL_PASSWORD in .env.local');
    console.log('\nPlease add these to your .env.local file:');
    console.log('EMAIL_USER=kramvade21@gmail.com');
    console.log('EMAIL_PASSWORD=your-app-password-here');
    process.exit(1);
  }
  
  // Create transporter
  console.log('🔧 Creating email transporter...');
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // Test connection
  console.log('🔌 Testing SMTP connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('\n💡 Common solutions:');
    console.log('   1. Generate a Gmail App Password (required if 2FA is enabled)');
    console.log('   2. Go to: https://myaccount.google.com/apppasswords');
    console.log('   3. Enable 2-Step Verification first');
    console.log('   4. Generate app password for "Mail" and "Other"');
    console.log('   5. Update EMAIL_PASSWORD in .env.local with the app password');
    console.log('\nSee EMAIL_TROUBLESHOOTING.md for detailed instructions.');
    process.exit(1);
  }
  
  // Ask for test email address
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('📧 Enter test email address (or press Enter to skip): ', async (testEmail) => {
    readline.close();
    
    if (!testEmail || testEmail.trim() === '') {
      console.log('\n✅ Connection test passed! Email sending skipped.');
      console.log('You can now approve tutors and emails will be sent automatically.');
      process.exit(0);
    }
    
    // Send test email
    console.log(`\n📤 Sending test email to ${testEmail}...`);
    try {
      const info = await transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME || 'PTLC Digital Coach'} <${process.env.EMAIL_USER}>`,
        to: testEmail,
        subject: 'Test Email from PTLC Digital Coach',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from PTLC Digital Coach.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from: ${process.env.EMAIL_USER}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        `,
      });
      
      console.log('✅ Test email sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('\n📬 Check your inbox at:', testEmail);
      console.log('   (Don\'t forget to check spam folder)');
      console.log('\n✅ Email system is ready to use!');
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
      console.log('\nSee EMAIL_TROUBLESHOOTING.md for help.');
      process.exit(1);
    }
  });
}

// Run the test
testEmailConnection().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
