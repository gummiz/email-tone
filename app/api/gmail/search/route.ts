import { NextRequest, NextResponse } from 'next/server';
import { gmailService } from "../../../../lib/gmail-service-fixed";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export async function POST(request: NextRequest) {
  console.log('[SearchAPI] Received search request');
  
  try {
    const body = await request.json();
    console.log('[SearchAPI] Request body:', JSON.stringify(body, null, 2));
    
    const { contact } = body;

    if (!contact) {
      console.error('[SearchAPI] Error: No contact provided');
      return NextResponse.json(
        { error: 'Contact email is required' }, 
        { status: 400 }
      );
    }

    console.log(`[SearchAPI] Searching for emails from/to: ${contact}`);
    
    try {
      // Initialize the gmail service if not already initialized
      if (!gmailService.isInitialized) {
        await gmailService.initialize();
      }
      const emails = await gmailService.findContactEmails(contact, 10);
      console.log(`[SearchAPI] Found ${emails.length} emails`);

      // Basic contact info extraction
      const contactInfo = {
        name: contact.includes('@') ? contact.split('@')[0] : contact,
        email: contact.includes('@') ? contact : emails[0]?.from || `${contact}@example.com`,
        emailCount: emails.length,
        lastContact: emails.length > 0 ? emails[0].date : null
      };

      return NextResponse.json({
        contact: contactInfo,
        emails
      });
    } catch (error) {
      console.error('[SearchAPI] Error searching emails:', error);
      return NextResponse.json(
        { error: 'Failed to search emails', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('[SearchAPI] Error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search emails',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, 
      { status: 500 }
    );
  }
}
