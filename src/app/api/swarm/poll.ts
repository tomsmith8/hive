import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SwarmStatus } from '@prisma/client';
import { saveOrUpdateSwarm } from '@/services/swarm/db';
import { swarmApiRequest } from '@/services/swarm/api/swarm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, swarmId } = body;
    if (!workspaceId && !swarmId) {
      return NextResponse.json({ success: false, message: 'Missing workspaceId or swarmId' }, { status: 400 });
    }

    // Find the swarm by workspaceId or swarmId
    const where: Record<string, string> = {};
    if (workspaceId) where.workspaceId = workspaceId;
    if (!workspaceId && swarmId) where.swarmId = swarmId;
    const swarm = await db.swarm.findFirst({ where });
    if (!swarm) {
      return NextResponse.json({ success: false, message: 'Swarm not found' }, { status: 404 });
    }

    if (swarm.status === SwarmStatus.ACTIVE) {
      return NextResponse.json({
        success: true,
        message: 'Swarm is already active',
        status: swarm.status,
      });
    }

    if (!swarm.swarmUrl) {
      return NextResponse.json({ success: false, message: 'Swarm URL not set' }, { status: 400 });
    }
    if (!swarm.swarmApiKey) {
      return NextResponse.json({ success: false, message: 'Swarm API key not set' }, { status: 400 });
    }

    // Poll the stats endpoint using the generic swarmApiRequest
    const statsResult = await swarmApiRequest({
      swarmUrl: swarm.swarmUrl,
      endpoint: '/stats',
      method: 'GET',
      apiKey: swarm.swarmApiKey,
    });
    if (statsResult.ok && statsResult.status === 200 && statsResult.data) {
      await saveOrUpdateSwarm({
        workspaceId: swarm.workspaceId,
        status: SwarmStatus.ACTIVE,
      });
      return NextResponse.json({
        success: true,
        message: 'Swarm is now active',
        status: SwarmStatus.ACTIVE,
        data: statsResult.data,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Swarm is not yet active',
      status: swarm.status,
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to poll swarm status' }, { status: 500 });
  }
} 