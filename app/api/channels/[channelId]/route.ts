import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

// GET /api/channels/:id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params; // <-- UNWRAP Promise
    const userId = req.headers.get('x-user-id'); // Opcjonalne, dla SSR

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
    const params = await context.params; // <-- UNWRAP Promise
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId }
    });

    if (channel?.ownerId !== userId) {
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
    const params = await context.params; // <-- UNWRAP Promise
    const userId = await verifyAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: params.channelId }
    });

    if (channel?.ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.channel.delete({
      where: { id: params.channelId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/channels/[channelId] error:', error);
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}