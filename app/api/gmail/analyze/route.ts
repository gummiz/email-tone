import { NextRequest, NextResponse } from 'next/server';
import { GmailService } from '@/lib/gmail-service-fixed';

export async function POST(request: NextRequest) {
  try {
    const { contact, userEmail } = await request.json();

    if (!contact || !userEmail) {
      return NextResponse.json({
        error: 'Contact and user email are required'
      }, { status: 400 });
    }

    const gmailService = GmailService.getInstance();
    const initialized = await gmailService.initialize();

    if (!initialized) {
      return NextResponse.json({
        error: 'Failed to initialize Gmail service'
      }, { status: 500 });
    }

    // Find emails
    const emails = await gmailService.findContactEmails(contact.email);

    if (emails.length === 0) {
      return NextResponse.json({
        error: 'No emails found with this contact'
      }, { status: 404 });
    }

    // Analyze tone
    const toneAnalysis = await gmailService.analyzeTone(emails, userEmail);

    await gmailService.disconnect();

    // Return the analysis directly (not wrapped in toneProfile)
    // as the analyzeTone method already returns the correct structure
    return NextResponse.json({
      ...toneAnalysis,
      emailsAnalyzed: emails.length
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json({
      error: 'Failed to analyze tone'
    }, { status: 500 });
  }
}