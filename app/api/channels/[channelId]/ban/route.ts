import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth, checkChannelRole } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

// POST /api/channels/:id/ban - Zbanuj użytkownika
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

    const role = await checkChannelRole(params.channelId, userId);
    if (role !== 'OWNER' && role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUserId, reason, until } = await req.json();

    // Nie można zbanować ownera
    const targetMember = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId: targetUserId
        }
      }
    });

    if (targetMember?.role === 'OWNER') {
      return NextResponse.json({ error: 'Cannot ban channel owner' }, { status: 400 });
    }

    const ban = await prisma.channelBan.create({
      data: {
        channelId: params.channelId,
        userId: targetUserId,
        reason,
        until: until ? new Date(until) : null
      }
    });

    // Usuń z członków
    await prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId: targetUserId
        }
      }
    });

    return NextResponse.json(ban, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
  }
}

// DELETE /api/channels/:id/ban?userId=xxx - Odbanuj
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

    const role = await checkChannelRole(params.channelId, userId);
    if (role !== 'OWNER' && role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    await prisma.channelBan.delete({
      where: {
        channelId_userId: {
          channelId: params.channelId,
          userId: targetUserId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 });
  }
}