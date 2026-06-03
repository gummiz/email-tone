import { NextRequest, NextResponse } from 'next/server'
import { DEMO_PROFILES, DEMO_EMAILS } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  const { contact } = await request.json()

  if (!contact?.email) {
    return NextResponse.json({ error: 'Contact email is required' }, { status: 400 })
  }

  const profile = DEMO_PROFILES[contact.email]

  if (!profile) {
    return NextResponse.json({ error: 'No profile found for this contact' }, { status: 404 })
  }

  const emails = DEMO_EMAILS[contact.email] ?? []

  return NextResponse.json({
    ...profile,
    emailsAnalyzed: emails.length,
  })
}
