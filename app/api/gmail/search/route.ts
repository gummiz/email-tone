import { NextRequest, NextResponse } from 'next/server'
import { searchDemoContact, DEMO_EMAILS } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  const { contact } = await request.json()

  if (!contact) {
    return NextResponse.json({ error: 'Contact is required' }, { status: 400 })
  }

  const match = searchDemoContact(contact)

  if (!match) {
    return NextResponse.json(
      { error: 'No email conversations found with this contact' },
      { status: 404 }
    )
  }

  const emails = DEMO_EMAILS[match.email] ?? []

  return NextResponse.json({
    contact: {
      name: match.name,
      email: match.email,
      emailCount: emails.length,
      lastContact: match.lastContact,
    },
    emails,
    emailsFound: emails.length,
  })
}
