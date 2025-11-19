import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/channels/:id/members - Lista członków
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params;

    const members = await prisma.channelMember.findMany({
      where: { channelId: params.channelId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { role: 'asc' }, // OWNER, MODERATOR, FOLLOWER
        { joinedAt: 'asc' }
      ]
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('GET members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/channels/:id/members - Zmień rolę członka (tylko owner)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params;
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sprawdź czy użytkownik jest ownerem
    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId }
    });

    if (channel?.ownerId !== userId) {
      return NextResponse.json({ error: 'Only owner can change roles' }, { status: 403 });
    }

    const { targetUserId, role } = await req.json();

    if (!['OWNER', 'MODERATOR', 'FOLLOWER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Jeśli zmiana na OWNER, zmień obecnego ownera na MODERATOR
    if (role === 'OWNER') {
      await prisma.channelMember.update({
        where: {
          channelId_userId: {
            channelId: params.channelId,
            userId
          }
        },
        data: { role: 'MODERATOR' }
      });

      await prisma.channel.update({
        where: { id: params.channelId },
        data: { ownerId: targetUserId }
      });
    }

    const updatedMember = await prisma.channelMember.update({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId: targetUserId
        }
      },
      data: { role }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('POST members error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}