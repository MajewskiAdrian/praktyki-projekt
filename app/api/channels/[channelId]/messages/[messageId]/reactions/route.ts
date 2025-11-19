import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ channelId: string; messageId: string }> }
) {
  try {
    const params = await context.params;
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    const reaction = await prisma.reaction.create({
      data: {
        messageId: params.messageId,
        userId,
        emoji
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(reaction, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Already reacted' }, { status: 409 });
    }
    console.error('POST reaction error:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ channelId: string; messageId: string }> }
) {
  try {
    const params = await context.params;
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji required' }, { status: 400 });
    }

    // Sprawdź czy reakcja istnieje
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: params.messageId,
          userId,
          emoji
        }
      }
    });

    if (!existingReaction) {
      return NextResponse.json({ error: 'Reaction not found' }, { status: 404 });
    }

    await prisma.reaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId: params.messageId,
          userId,
          emoji
        }
      }
    });

    console.log(`User ${userId} removed reaction ${emoji} from message ${params.messageId}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('DELETE reaction error:', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}