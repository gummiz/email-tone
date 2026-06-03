import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { readFileSync } from 'fs';

export class GmailClient {
  private gmail: any = null;
  private oauth2Client: OAuth2Client | null = null;

  async initialize() {
    console.log('[GmailClient] Initializing Gmail client...');
    
    try {
      // Load client secrets from environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';
      
      if (!clientId || !clientSecret) {
        throw new Error('Missing Google OAuth2 credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
      }
      
      // Create an OAuth2 client
      this.oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      );
      
      // Set the access token if available
      if (process.env.GOOGLE_ACCESS_TOKEN) {
        this.oauth2Client.setCredentials({
          access_token: process.env.GOOGLE_ACCESS_TOKEN,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          expiry_date: process.env.GOOGLE_EXPIRY_DATE ? parseInt(process.env.GOOGLE_EXPIRY_DATE) : undefined
        });
      }
      
      // Create Gmail API client
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      console.log('[GmailClient] Successfully initialized Gmail client');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[GmailClient] Failed to initialize Gmail client:', error);
      throw new Error(`Failed to initialize Gmail client: ${errorMessage}`);
    }
  }

  async searchEmails(query: string, maxResults: number = 10) {
    if (!this.gmail) {
      throw new Error('Gmail client not initialized');
    }

    try {
      console.log('Searching emails for query:', query);
      
      // Search for messages
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });
      
      const messages = response.data.messages || [];
      
      // Get full message details for each message
      const messagePromises = messages.map(async (message: any) => {
        const messageData = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        return this.formatMessage(messageData.data);
      });
      
      return Promise.all(messagePromises);
      
    } catch (error) {
      console.error('Error in searchEmails:', error);
      throw new Error('Failed to search emails. Please try again later.');
    }
  }
  
  private formatMessage(message: any) {
    const headers = message.payload?.headers || [];
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No subject)';
    const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';
    
    // Extract plain text body
    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
      const textPart = message.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' && part.body?.data
      );
      if (textPart) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }
    
    return {
      id: message.id,
      threadId: message.threadId,
      subject,
      from,
      to,
      date,
      body,
      snippet: message.snippet || ''
    };
  }

  // Add other Gmail API methods as needed
  async sendEmail(to: string, subject: string, body: string) {
    if (!this.gmail) {
      throw new Error('Gmail client not initialized');
    }

    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}

export const gmailClient = new GmailClient();
