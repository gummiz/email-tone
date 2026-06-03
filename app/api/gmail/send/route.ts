// import { NextRequest, NextResponse } from 'next/server';
// import { GmailService } from '@/lib/gmail-service';

// export async function POST(request: NextRequest) {
//   try {
//     const { to, subject, body } = await request.json();

//     if (!to || !subject || !body) {
//       return NextResponse.json({
//         error: 'To, subject, and body are required'
//       }, { status: 400 });
//     }

//     const gmailService = new GmailService();
//     const initialized = await gmailService.initialize();

//     if (!initialized) {
//       return NextResponse.json({
//         error: 'Failed to initialize Gmail service'
//       }, { status: 500 });
//     }

//     const success = await gmailService.sendEmail(to, subject, body);

//     await gmailService.disconnect();

//     if (success) {
//       return NextResponse.json({ message: 'Email sent successfully' });
//     } else {
//       return NextResponse.json({
//         error: 'Failed to send email'
//       }, { status: 500 });
//     }

//   } catch (error) {
//     console.error('Send API error:', error);
//     return NextResponse.json({
//       error: 'Failed to send email'
//     }, { status: 500 });
//   }
// }