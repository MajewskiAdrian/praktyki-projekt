import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/channels - Lista kanałów (publiczne + twoje prywatne)
export async function GET(req: NextRequest) {
  try {
    console.log('=== GET /api/channels ===');
    
    const userId = await verifyAuth(req);
    console.log('User ID:', userId);

    const { searchParams } = new URL(req.url);
    const onlyPublic = searchParams.get('public') === 'true';

    let channels;

    if (onlyPublic) {
      // Tylko publiczne kanały
      channels = await prisma.channel.findMany({
        where: { isPublic: true },
        include: {
          owner: { 
            select: { id: true, name: true, email: true } 
          },
          _count: { 
            select: { members: true, messages: true } 
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    } else if (userId) {
      // Zalogowany użytkownik: publiczne + kanały gdzie jest członkiem (w tym prywatne)
      channels = await prisma.channel.findMany({
        where: {
          OR: [
            { isPublic: true },
            { 
              members: {
                some: { userId }
              }
            }
          ]
        },
        include: {
          owner: { 
            select: { id: true, name: true, email: true } 
          },
          _count: { 
            select: { members: true, messages: true } 
          },
          members: {
            where: { userId },
            select: { role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    } else {
      // Niezalogowany: tylko publiczne
      channels = await prisma.channel.findMany({
        where: { isPublic: true },
        include: {
          owner: { 
            select: { id: true, name: true, email: true } 
          },
          _count: { 
            select: { members: true, messages: true } 
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }

    console.log('Channels fetched:', channels.length);
    return NextResponse.json(channels);
    
  } catch (error: any) {
    console.error('GET /api/channels error:', error);
    console.error('Error message:', error.message);
    
    return NextResponse.json({ 
      error: 'Failed to fetch channels',
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/channels - Utwórz kanał
export async function POST(req: NextRequest) {
  try {
    console.log('=== POST /api/channels START ===');
    
    const userId = await verifyAuth(req);
    console.log('userId from verifyAuth:', userId);
    
    if (!userId) {
      console.error('No userId - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    
    const { title, description, isPublic, avatarUrl } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    console.log('Creating channel with ownerId:', userId);

    const channel = await prisma.channel.create({
      data: {
        title,
        description: description || null,
        isPublic: isPublic ?? true,
        avatarUrl: avatarUrl || null,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: { 
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { members: true, messages: true }
        }
      }
    });

    console.log('Channel created successfully:', channel.id);
    return NextResponse.json(channel, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/channels error:', error);
    console.error('Error message:', error.message);
    
    return NextResponse.json({ 
      error: 'Failed to create channel',
      details: error.message 
    }, { status: 500 });
  }
}