import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailMessage } from '../types/email';

export class GmailDirectClient {
  private gmail: any = null;
  private oauth2Client: OAuth2Client | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    console.log('[GmailDirect] Initializing Gmail client...');

    try {
      // Load client secrets from environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';

      if (!clientId || !clientSecret) {
        throw new Error('Missing Google OAuth2 credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
      }

      // Create an OAuth2 client
      this.oauth2Client = new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri
      });

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
      this.isInitialized = true;

      console.log('[GmailDirect] Successfully initialized Gmail client');
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during initialization';
      console.error('[GmailDirect] Failed to initialize Gmail client:', error);
      throw new Error(`Failed to initialize Gmail client: ${errorMessage}`);
    }
  }

  async searchEmails(query: string, maxResults: number = 10): Promise<EmailMessage[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`[GmailDirect] Searching emails with query: ${query}`);

    try {
      // Search for messages
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      const messages = response.data.messages || [];
      console.log(`[GmailDirect] Found ${messages.length} messages`);

      // Get full message details for each message
      const emailPromises = messages.map(async (message: any) => {
        try {
          const messageData = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });

          return this.formatMessage(messageData.data);
        } catch (error) {
          console.error(`[GmailDirect] Failed to fetch message ${message.id}:`, error);
          return null;
        }
      });

      const emails = (await Promise.all(emailPromises)).filter(Boolean) as EmailMessage[];
      console.log(`[GmailDirect] Successfully processed ${emails.length} emails`);

      return emails;

    } catch (error) {
      console.error('[GmailDirect] Error searching emails:', error);
      throw new Error('Failed to search emails. Please try again later.');
    }
  }

  private formatMessage(message: any): EmailMessage | null {
    try {
      const headers = message.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const subject = getHeader('Subject') || '(No subject)';
      const from = getHeader('From') || 'Unknown';
      const to = getHeader('To') || '';
      const date = new Date(getHeader('Date') || Date.now());

      // Extract plain text body
      let body = '';
      const parts = message.payload?.parts || [message.payload];

      const findPlainText = (part: any): string | null => {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }

        if (part.parts) {
          for (const p of part.parts) {
            const result = findPlainText(p);
            if (result) return result;
          }
        }

        return null;
      };

      for (const part of parts) {
        const text = findPlainText(part);
        if (text) {
          body = text;
          break;
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

    } catch (error) {
      console.error('[GmailDirect] Error formatting message:', error);
      return null;
    }
  }
}

export const gmailDirectClient = new GmailDirectClient();
