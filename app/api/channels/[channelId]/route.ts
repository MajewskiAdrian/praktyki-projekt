import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/channels/:id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params;

    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId },
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { members: true, messages: true } }
      }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('GET /api/channels/[channelId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
  }
}

// PATCH /api/channels/:id
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params;
    const userId = await verifyAuth(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (channel.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, avatarUrl } = await req.json();

    const updated = await prisma.channel.update({
      where: { id: params.channelId },
      data: { title, description, avatarUrl }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/channels/[channelId] error:', error);
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}

// DELETE /api/channels/:id
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

    const channelId = params.channelId;

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { ownerId: true }
    });

    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (channel.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the channel owner can delete this channel' },
        { status: 403 }
      );
    }

    await prisma.channel.delete({
      where: { id: channelId }
    });

    return NextResponse.json(
      { message: 'Channel deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    );
  }
}