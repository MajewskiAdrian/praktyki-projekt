import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST - Follow channel
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

    // Sprawdź czy kanał istnieje
    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Sprawdź czy już nie jest członkiem
    const existingMember = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already following this channel' }, { status: 409 });
    }

    // Sprawdź czy użytkownik jest zbanowany
    const ban = await prisma.channelBan.findUnique({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId
        }
      }
    });

    if (ban && (!ban.until || ban.until > new Date())) {
      return NextResponse.json({
        error: 'You are banned from this channel',
        bannedUntil: ban.until
      }, { status: 403 });
    }

    // Dodaj jako followera
    const member = await prisma.channelMember.create({
      data: {
        channelId: params.channelId,
        userId,
        role: 'FOLLOWER'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log(`User ${userId} followed channel ${params.channelId}`);
    return NextResponse.json(member, { status: 201 });

  } catch (error: any) {
    console.error('POST follow error:', error);
    return NextResponse.json({
      error: 'Failed to follow channel',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Unfollow channel
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params;
    const userId = await verifyAuth(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sprawdź czy jest członkiem
    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Not following this channel' }, { status: 404 });
    }

    // Nie pozwól ownerowi opuścić własnego kanału
    if (member.role === 'OWNER') {
      return NextResponse.json({
        error: 'Channel owner cannot unfollow their own channel'
      }, { status: 403 });
    }

    // Usuń członkostwo
    await prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId
        }
      }
    });

    console.log(`User ${userId} unfollowed channel ${params.channelId}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('DELETE follow error:', error);
    return NextResponse.json({
      error: 'Failed to unfollow channel',
      details: error.message
    }, { status: 500 });
  }
}