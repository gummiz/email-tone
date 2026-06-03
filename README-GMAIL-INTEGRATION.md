# Gmail Integration

This document provides information about the Gmail integration in the Email Tone Analyzer application.

## Setup

1. **Environment Variables**
   Create a `.env.local` file in the root of your project with the following variables:

   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
   
   # Optional: If you have existing tokens
   GOOGLE_ACCESS_TOKEN=your_access_token
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   GOOGLE_EXPIRY_DATE=expiry_timestamp
   
   # For testing
   TEST_EMAIL=your_test_email@example.com
   ```

2. **OAuth 2.0 Setup**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Configure the OAuth consent screen
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)
   - Get your client ID and client secret

## Usage

### GmailService

The `GmailService` is a singleton class that provides methods to interact with the Gmail API.

```typescript
import { gmailService } from '@/lib/gmail-service-fixed';

// Initialize the service
await gmailService.initialize();

// Search for emails
const emails = await gmailService.findContactEmails('example@domain.com', 10);

// Clean up
await gmailService.disconnect();
```

### API Endpoint

A Next.js API route is available at `/api/gmail/search`:

```typescript
// Request
POST /api/gmail/search
{
  "contact": "example@domain.com"
}

// Response
{
  "contact": {
    "name": "example",
    "email": "example@domain.com",
    "emailCount": 5,
    "lastContact": "2023-01-01T00:00:00.000Z"
  },
  "emails": [
    {
      "id": "message_id_123",
      "threadId": "thread_id_123",
      "subject": "Test Email",
      "from": "sender@example.com",
      "to": "recipient@example.com",
      "date": "2023-01-01T00:00:00.000Z",
      "body": "Email body content...",
      "snippet": "Email preview snippet..."
    }
  ]
}
```

## Testing

To test the Gmail service, use the test script:

```bash
# Install test dependencies
npm install --save-dev ts-node typescript @types/node dotenv

# Run the test script
npx ts-node scripts/test-gmail-fixed.ts
```

## Error Handling

The service includes error handling for common issues:
- Missing environment variables
- Authentication errors
- API rate limiting
- Invalid email addresses
- Network errors

## Security Considerations

- Never commit your OAuth credentials to version control
- Use environment variables for sensitive data
- Implement proper token refresh logic in production
- Follow the principle of least privilege when requesting OAuth scopes

## Troubleshooting

1. **Authentication Errors**
   - Verify your OAuth client ID and secret
   - Check that the redirect URI matches exactly
   - Ensure tokens are not expired

2. **API Errors**
   - Check the Gmail API status page for outages
   - Verify that the Gmail API is enabled for your project
   - Check your API quota and usage

3. **Type Errors**
   - Ensure all TypeScript types are properly imported
   - Check for version mismatches in your dependencies
