import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    console.log('📧 Using email account:', process.env.EMAIL_USER);
    
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    if (error.response) {
      console.error('❌ SMTP response:', error.response);
    }
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  tutorApproved: (tutorName: string) => ({
    subject: 'Welcome to PTLC Digital Coach - Your Account is Approved! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
          .checklist {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .checklist-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .checklist-item:last-child {
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Congratulations, ${tutorName}!</h1>
          <p>Your tutor account has been approved</p>
        </div>
        
        <div class="content">
          <p>Dear ${tutorName},</p>
          
          <p>We're excited to inform you that your application to become a tutor on PTLC Digital Coach has been <strong>approved</strong>!</p>
          
          <p>You can now log in to your account and start accepting tutoring sessions.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">
              Log In to Your Account
            </a>
          </div>
          
          <div class="checklist">
            <h3>Next Steps:</h3>
            <div class="checklist-item">
              ✅ <strong>Complete Your Profile</strong> - Add your bio, subjects, and hourly rate
            </div>
            <div class="checklist-item">
              ✅ <strong>Set Your Availability</strong> - Update your schedule to start receiving bookings
            </div>
            <div class="checklist-item">
              ✅ <strong>Upload a Profile Photo</strong> - Help parents get to know you
            </div>
            <div class="checklist-item">
              ✅ <strong>Review Platform Guidelines</strong> - Familiarize yourself with our policies
            </div>
          </div>
          
          <p><strong>What You Can Do Now:</strong></p>
          <ul>
            <li>Accept booking requests from parents</li>
            <li>Message parents directly</li>
            <li>Manage your schedule and availability</li>
            <li>Track your earnings</li>
            <li>Build your reputation through reviews</li>
          </ul>
          
          <p><strong>Payment Information:</strong></p>
          <p>You'll receive 90% of each session payment. Payouts are processed during the first week of each month (1st-7th).</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
          
          <p>Welcome to the PTLC Digital Coach family! We're thrilled to have you on board.</p>
          
          <p>Best regards,<br>
          <strong>The PTLC Digital Coach Team</strong></p>
        </div>
        
        <div class="footer">
          <p>PTLC Digital Coach</p>
          <p>Email: support@ptlcdigitalcoach.com | Phone: (123) 456-7890</p>
          <p style="font-size: 12px; color: #999;">
            This email was sent to you because you registered as a tutor on PTLC Digital Coach.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  tutorRejected: (tutorName: string, reason?: string) => ({
    subject: 'PTLC Digital Coach - Application Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #f3f4f6;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .reason-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Application Update</h1>
        </div>
        
        <div class="content">
          <p>Dear ${tutorName},</p>
          
          <p>Thank you for your interest in becoming a tutor with PTLC Digital Coach.</p>
          
          <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
          
          ${reason ? `
            <div class="reason-box">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
          ` : ''}
          
          <p><strong>What You Can Do:</strong></p>
          <ul>
            <li>Review our tutor requirements and guidelines</li>
            <li>Address any concerns mentioned above</li>
            <li>Contact our support team for clarification</li>
            <li>Reapply in the future if circumstances change</li>
          </ul>
          
          <p>We appreciate your understanding and encourage you to reach out if you have any questions about this decision.</p>
          
          <p>Best regards,<br>
          <strong>The PTLC Digital Coach Team</strong></p>
        </div>
        
        <div class="footer">
          <p>PTLC Digital Coach</p>
          <p>Email: support@ptlcdigitalcoach.com | Phone: (123) 456-7890</p>
        </div>
      </body>
      </html>
    `,
  }),
};
