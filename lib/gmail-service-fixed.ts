import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailMessage } from '../types/email';

type GmailMessage = gmail_v1.Schema$Message;
type GmailMessagePart = gmail_v1.Schema$MessagePart;
type GmailMessageHeader = {
  name?: string | null | undefined;
  value?: string | null | undefined;
};

export class GmailService {
  private static instance: GmailService;
  private oauth2Client: OAuth2Client | null = null;
  private gmail: gmail_v1.Gmail | null = null;
  private isInitialized = false;

  private constructor() {}

  async analyzeTone(emails: EmailMessage[], userEmail: string): Promise<{ 
    overallTone: string;
    overallScore: number;
    emailTones: Array<{
      id: string;
      subject: string;
      tone: string;
      score: number;
      isFromUser: boolean;
    }>;
  }> {
    // Simple tone analysis based on word matching
    const positiveWords = ['great', 'good', 'excellent', 'happy', 'thanks', 'thank you', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'angry', 'frustrated', 'disappointed'];
    
    const analyzeContent = (content: string) => {
      const words = content.toLowerCase().split(/\s+/);
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        else if (negativeWords.includes(word)) negativeCount++;
      });
      
      const totalWords = Math.max(words.length, 1); // Avoid division by zero
      const positiveScore = positiveCount / totalWords * 100;
      const negativeScore = negativeCount / totalWords * 100;
      
      // Determine tone
      if (positiveScore > negativeScore) {
        return { tone: 'positive', score: positiveScore };
      } else if (negativeScore > positiveScore) {
        return { tone: 'negative', score: negativeScore };
      }
      return { tone: 'neutral', score: 0 };
    };
    
    // Analyze each email
    const emailTones = emails.map(email => {
      const { tone, score } = analyzeContent(`${email.subject || ''} ${email.body || ''} ${email.snippet || ''}`);
      return {
        id: email.id,
        subject: email.subject || '(No subject)',
        tone,
        score,
        isFromUser: email.from?.includes(userEmail) || false
      };
    });
    
    // Calculate overall tone
    const totalScore = emailTones.reduce((sum, { score, isFromUser }) => {
      // If the email is from the user, we might want to weight it differently
      const weight = isFromUser ? 1.5 : 1.0;
      return sum + (score * weight);
    }, 0);
    
    const overallScore = totalScore / emailTones.length || 0;
    
    // Determine overall tone
    let overallTone = 'neutral';
    if (overallScore > 10) overallTone = 'positive';
    else if (overallScore < -10) overallTone = 'negative';
    
    return {
      overallTone,
      overallScore,
      emailTones
    };
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized');
    }

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      console.log('Access token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token. Please re-authenticate.');
    }
  }

  private getHeader(headers: GmailMessageHeader[] = [], name: string): string {
    const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
    return header?.value || '';
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

      // Create OAuth2 client
      this.oauth2Client = new OAuth2Client({
        clientId,
        clientSecret,
        redirectUri
      });

      // Handle tokens if they exist in environment variables
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          scope: 'https://www.googleapis.com/auth/gmail.readonly'
        });
      } else {
        // If no refresh token, we need to get one through OAuth flow
        const authUrl = this.oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/gmail.readonly'],
          prompt: 'consent' // Force to get refresh token
        });
        
        console.log('Authorize this app by visiting this URL:', authUrl);
        throw new Error('No refresh token available. Please complete the OAuth flow.');
      }

      // Create Gmail API client
      this.gmail = google.gmail({
        version: 'v1',
        auth: this.oauth2Client as any // Type assertion as a workaround for type issues
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
    if (!this.isInitialized || !this.gmail || !this.oauth2Client) {
      await this.initialize();
    }

    try {
      // Build the search query
      const query = `(from:${contact} OR to:${contact} OR cc:${contact} OR bcc:${contact})`;
      console.log(`Searching Gmail with query: ${query}`);

      // Search for messages with retry on token refresh
      const searchMessages = async (retry = true): Promise<gmail_v1.Schema$ListMessagesResponse> => {
        try {
          const response = await this.gmail!.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: maxResults
          });
          return response.data;
        } catch (error: any) {
          if (error.code === 401 && retry && this.oauth2Client) {
            console.log('Token expired, attempting to refresh...');
            await this.refreshAccessToken();
            return searchMessages(false); // Don't retry again to avoid infinite loop
          }
          throw error;
        }
      };

      const response = await searchMessages();
      const messages = response.messages || [];
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

  private async formatMessage(message: GmailMessage): Promise<EmailMessage | null> {
    try {
      if (!message.id || !message.threadId) return null;

      if (!message.payload?.headers) return null;
      
      // Create a safe headers array that matches our expected type
      const headers = message.payload.headers.map(header => ({
        name: header.name || undefined,
        value: header.value || undefined
      }));
      
      // Extract headers
      const from = this.getHeader(headers, 'From');
      const to = this.getHeader(headers, 'To');
      const subject = this.getHeader(headers, 'Subject');
      const date = this.getHeader(headers, 'Date');

      // Get message body
      let body = '';
      if (message.payload) {
        if (message.payload.body?.data) {
          // For simple messages
          body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
        } else if (message.payload.parts) {
          // For multipart messages
          const textPart = message.payload.parts.find(
            (part: GmailMessagePart) => 
              part.mimeType === 'text/plain' || part.mimeType === 'text/html'
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }
      }

      return {
        id: message.id,
        threadId: message.threadId,
        subject: subject || '(No subject)',
        from: from,
        to: to,
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
