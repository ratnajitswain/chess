import { NextRequest, NextResponse } from 'next/server'
import SocketHandler from '@/lib/socket'

export async function GET(req: NextRequest, res: NextResponse) {
  // @ts-ignore
  await SocketHandler(req, res)
  return new NextResponse('Socket is connected')
}

export async function POST(req: NextRequest, res: NextResponse) {
  // @ts-ignore
  await SocketHandler(req, res)
  return new NextResponse('Socket is connected')
}