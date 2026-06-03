import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json(
      { error: 'OAuth error', details: error },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/api/auth/callback/google',
    });

    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      return NextResponse.json(
        { error: 'No refresh token received. Please ensure you have the correct OAuth scopes and access type.' },
        { status: 400 }
      );
    }

    // Return a simple HTML page with the tokens
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Callback</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              line-height: 1.6;
            }
            pre { 
              background: #f4f4f4; 
              padding: 15px; 
              border-radius: 5px; 
              overflow-x: auto;
            }
            .success { color: green; }
          </style>
        </head>
        <body>
          <h1 class="success">Authentication Successful!</h1>
          <p>Add these tokens to your <code>.env.local</code> file:</p>
          <pre>GOOGLE_ACCESS_TOKEN=${tokens.access_token}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
GOOGLE_EXPIRY_DATE=${tokens.expiry_date}</pre>
          <p>After adding these, restart your Next.js server.</p>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Error</title>
          <style>body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }</style>
        </head>
        <body>
          <h1 style="color: red;">Authentication Failed</h1>
          <p>Error exchanging code for tokens. Check the server logs for more details.</p>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}
