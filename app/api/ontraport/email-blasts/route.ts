import { NextResponse } from 'next/server'

export async function GET() {
  const blasts = [
    {
      id: '123',
      subject: 'Q4 Special: 400G Transceivers Sale',
      sendDate: 'Nov 15, 2024',
      totalSent: 8432,
      openRate: '42.3%',
      clickRate: '18.7%',
    },
    {
      id: '122',
      subject: 'New Product Launch: QSFP-DD Series',
      sendDate: 'Nov 8, 2024',
      totalSent: 9127,
      openRate: '38.9%',
      clickRate: '15.2%',
    },
    {
      id: '121',
      subject: 'VIP Exclusive: Early Access to 800G',
      sendDate: 'Oct 28, 2024',
      totalSent: 2341,
      openRate: '56.7%',
      clickRate: '24.3%',
    },
  ]

  return NextResponse.json(blasts)
}
