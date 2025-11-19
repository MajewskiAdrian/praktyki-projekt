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
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const { optionId } = await req.json();

    if (!optionId) {
      return NextResponse.json({ error: 'optionId is required' }, { status: 400 });
    }

    // Sprawdź czy wiadomość jest ankietą
    const message = await prisma.message.findUnique({
      where: { id: params.messageId }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.type !== 'POLL') {
      return NextResponse.json({ error: 'Message is not a poll' }, { status: 400 });
    }

    // Sprawdź czy optionId jest valid
    const options = (message.content as any).options || [];
    const validOption = options.find((opt: any) => opt.id === optionId);
    
    if (!validOption) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Upsert głos
    const vote = await prisma.pollVote.upsert({
      where: {
        messageId_userId: {
          messageId: params.messageId,
          userId
        }
      },
      create: {
        messageId: params.messageId,
        userId,
        optionId
      },
      update: {
        optionId
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    console.log(`User ${userId} voted for option ${optionId} in poll ${params.messageId}`);
    return NextResponse.json(vote, { status: 201 });
    
  } catch (error: any) {
    console.error('POST vote error:', error);
    return NextResponse.json({ 
      error: 'Failed to vote',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Usuń głos (opcjonalne)
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

    await prisma.pollVote.delete({
      where: {
        messageId_userId: {
          messageId: params.messageId,
          userId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE vote error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete vote',
      details: error.message 
    }, { status: 500 });
  }
}