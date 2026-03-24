import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const blast = {
    id,
    subject: 'Q4 Special: 400G Transceivers Sale',
    sendDate: 'Nov 15, 2024',
    totalSent: 8432,
    openRate: '42.3%',
    clickRate: '18.7%',
  }

  const clickers = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@techcorp.com',
      owner: 'Alice Tran',
      clicks: 5,
    },
    {
      name: 'Michael Chen',
      email: 'm.chen@netsolve.io',
      owner: 'Alice Tran',
      clicks: 3,
    },
    {
      name: 'David Rodriguez',
      email: 'drodriguez@cloudnet.com',
      owner: 'Mark Rivera',
      clicks: 7,
    },
    {
      name: 'Emily Thompson',
      email: 'e.thompson@datapro.net',
      owner: 'Mark Rivera',
      clicks: 2,
    },
    {
      name: 'James Wilson',
      email: 'jwilson@fibernet.com',
      owner: 'Unassigned',
      clicks: 4,
    },
  ]

  const bounces = [
    {
      name: 'Robert Martinez',
      email: 'rmartinez@oldtech.com',
      bounceReason: 'Invalid address',
    },
    {
      name: 'Lisa Anderson',
      email: 'l.anderson@defunct.net',
      bounceReason: 'Domain not found',
    },
    {
      name: 'Kevin Brown',
      email: 'kbrown@mailbox-full.com',
      bounceReason: 'Mailbox full',
    },
  ]

  return NextResponse.json({ blast, clickers, bounces })
}
