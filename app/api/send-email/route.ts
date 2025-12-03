import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API called');
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in environment variables.' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { type, to, tutorName, reason } = body;

    console.log('📧 Email type:', type);
    console.log('📧 Recipient:', to);

    if (!to || !tutorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let emailContent;

    switch (type) {
      case 'tutor_approved':
        emailContent = emailTemplates.tutorApproved(tutorName);
        break;
      case 'tutor_rejected':
        emailContent = emailTemplates.tutorRejected(tutorName, reason);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('❌ Error in send-email API:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send email',
        details: error.code || 'Unknown error',
        hint: 'If using Gmail, you may need to generate an App Password. See EMAIL_NOTIFICATION_SYSTEM.md for instructions.'
      },
      { status: 500 }
    );
  }
}
