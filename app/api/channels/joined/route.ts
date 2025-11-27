import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const userId = await verifyAuth(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const channels = await prisma.channel.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        members: true,
                        messages: true
                    }
                },
                members: {
                    where: {
                        userId: userId
                    },
                    select: {
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(channels);
    } catch (error: any) {
        console.error('Error fetching joined channels:', error);
        return NextResponse.json({
            error: 'Failed to fetch channels',
            details: error.message
        }, { status: 500 });
    }
}