import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailMessage } from '../types/email';

class GmailService {
  private static instance: GmailService;
  private gmail: gmail_v1.Gmail | null = null;
  private oauth2Client: OAuth2Client | null = null;
  private isInitialized = false;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    console.log('Initializing GmailService...');
    
    try {
      // Load client secrets from environment variables
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google';
      
      if (!clientId || !clientSecret) {
        throw new Error('Missing Google OAuth2 credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
      }

      // Create OAuth2 client with type assertion
      this.oauth2Client = new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri
      }) as unknown as OAuth2Client & { gaxios: any };

      // Handle tokens if they exist in environment variables
      if (process.env.GOOGLE_ACCESS_TOKEN) {
        this.oauth2Client.setCredentials({
          access_token: process.env.GOOGLE_ACCESS_TOKEN,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          expiry_date: process.env.GOOGLE_EXPIRY_DATE ? Number(process.env.GOOGLE_EXPIRY_DATE) : undefined,
          token_type: 'Bearer'
        });
      }

      // Create Gmail API client
      this.gmail = google.gmail({ 
        version: 'v1', 
        auth: this.oauth2Client as any 
      });
      
      this.isInitialized = true;
      console.log('GmailService initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize GmailService:', error);
      this.isInitialized = false;
      throw new Error(`Failed to initialize GmailService: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findContactEmails(contact: string, maxResults: number = 10): Promise<EmailMessage[]> {
    if (!this.isInitialized || !this.gmail) {
      await this.initialize();
    }

    try {
      // Build the search query
      const query = `(from:${contact} OR to:${contact} OR cc:${contact} OR bcc:${contact})`;
      console.log(`Searching Gmail with query: ${query}`);

      // Search for messages
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });
      
      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} messages`);

      // Get full message details for each message
      const messagePromises = messages.map(async (message) => {
        if (!message.id) return null;
        
        const messageData = await this.gmail!.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        return this.formatMessage(messageData.data);
      });

      // Wait for all message details to be fetched
      const results = await Promise.all(messagePromises);
      return results.filter((msg): msg is EmailMessage => msg !== null);
      
    } catch (error) {
      console.error('Error searching Gmail:', error);
      throw new Error(`Failed to search Gmail: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private formatMessage(message: any): EmailMessage | null {
    try {
      if (!message.id || !message.threadId) return null;

      // Extract headers
      const headers = message.payload?.headers || [];
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      // Get message body
      let body = '';
      if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (message.payload?.parts) {
        // Try to find the plain text part
        const textPart = message.payload.parts.find(
          (part: any) => part.mimeType === 'text/plain' && part.body?.data
        );
        if (textPart) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      return {
        id: message.id,
        threadId: message.threadId,
        subject: getHeader('Subject') || '(No subject)',
        from: getHeader('From'),
        to: getHeader('To'),
        date: new Date(parseInt(message.internalDate || '0')),
        body,
        snippet: message.snippet || ''
      };
    } catch (error) {
      console.error('Error formatting message:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    // Clean up resources if needed
    this.gmail = null;
    this.oauth2Client = null;
    this.isInitialized = false;
  }
}

// Export a singleton instance
export const gmailService = GmailService.getInstance();

// For backward compatibility
export default gmailService;
