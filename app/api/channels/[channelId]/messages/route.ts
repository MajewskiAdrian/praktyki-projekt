import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

// GET /api/channels/:id/messages
export async function GET(
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
      return NextResponse.json({ error: 'Not a member of this channel' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await prisma.message.findMany({
      where: {
        channelId: params.channelId,
        ...(before && { createdAt: { lt: new Date(before) } })
      },
      include: {
        author: { select: { id: true, name: true } },
        reactions: {
          include: { user: { select: { id: true, name: true } } }
        },
        pollVotes: {
          include: { user: { select: { id: true, name: true } } } // <-- WAŻNE!
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/channels/:id/messages
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

    // Sprawdź uprawnienia
    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId
        }
      }
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'MODERATOR')) {
      return NextResponse.json(
        { error: 'Only owner/moderators can send messages' },
        { status: 403 }
      );
    }

    const { type, content } = await req.json();

    const message = await prisma.message.create({
      data: {
        channelId: params.channelId,
        authorId: userId,
        type,
        content
      },
      include: {
        author: { select: { id: true, name: true } },
        reactions: true,
        pollVotes: true
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('POST message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}