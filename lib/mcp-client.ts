import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';

export class MCPGmailClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private gmail: any = null; // Add gmail property with appropriate type

  async initialize() {
    console.log('[MCPClient] Initializing MCP client...');
    
    try {
      // Initialize the MCP server using the local server instance
      const serverPath = path.resolve(process.cwd(), 'mcp-server/build/index.js');
      console.log('[MCPClient] Creating StdioClientTransport...', { serverPath });
      this.transport = new StdioClientTransport({
        command: 'node',
        args: [serverPath]
      });

      // Initialize client
      console.log('[MCPClient] Creating MCP Client...');
      this.client = new Client({
        name: 'email-tone-analyzer',
        version: '1.0.0',
      }, {
        capabilities: {
          resources: {},
          tools: {},
        },
      });

      // Connect to server with timeout
      console.log('[MCPClient] Connecting to MCP server...');
      const connectionPromise = this.client.connect(this.transport);
      
      // Set a timeout for the connection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('MCP server connection timeout')), 15000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      
      console.log('[MCPClient] Successfully connected to MCP server');
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        transportInitialized: !!this.transport,
        clientInitialized: !!this.client,
        serverPath: path.resolve(process.cwd(), 'mcp-server'),
      };
      
      console.error('[MCPClient] Failed to initialize MCP client:', JSON.stringify(errorDetails, null, 2));
      
      // Provide specific error messages
      if (errorMessage.includes('ENOENT')) {
        throw new Error('MCP server executable not found. Make sure @modelcontextprotocol/create-server is installed.');
      }
      
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('timeout')) {
        throw new Error('Could not connect to MCP server. Make sure it is running and accessible.');
      }
      
      if (errorMessage.includes('EACCES') || errorMessage.includes('EPERM')) {
        throw new Error('Permission denied when trying to start MCP server. Check file permissions.');
      }
    }
  }

  async searchEmails(query: string, maxResults: number = 10) {
    if (!this.gmail) {
      throw new Error('Gmail client not initialized');
    }

    console.log('Searching emails for query:', query);

    try {
      // Search for messages
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });
      
      // Process and return the response
      return response.data.messages || [];
      
    } catch (error) {
      console.error('Error searching emails:', {
        query,
        maxResults,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error('Failed to search emails. Please try again later.');
    }
  }

  async getEmailThread(threadId: string) {
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    try {
      const result = await this.client.callTool({
        name: 'read_email',
        arguments: {
          messageId: threadId
        }
      });
      return result.content;
    } catch (error) {
      console.error('Error fetching email thread:', error);
      throw new Error('Failed to fetch email thread. The email might not exist or you might not have permission to access it.');
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    try {
      const result = await this.client.callTool({
        name: 'send_email',
        arguments: {
          to,
          subject,
          body
        }
      });
      return result.content;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email. Please check if the MCP server is running and properly configured.');
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
    if (this.transport) {
      await this.transport.close();
    }
  }
}