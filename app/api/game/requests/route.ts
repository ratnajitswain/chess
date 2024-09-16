import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import GameRequest from '@/models/GameRequest';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let requests = await GameRequest.findOne({ 
      opponent: session.user.id, 
      status: 'pending'
    }).sort({_id:-1}).populate('requester', 'name');

    if(!requests){
        return NextResponse.json({msg:"Not found"})
    }
    requests = JSON.parse(JSON.stringify(requests))
    return NextResponse.json({ 
      requests: [{
        id: requests._id,
        requester: {
          id: requests.requester._id,
          name: requests.requester.name,
        },
        createdAt: requests.createdAt,
      }]
    });

  } catch (error) {
    console.error('Error fetching game requests:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}