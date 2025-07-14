import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SwarmStatus } from '@prisma/client';
import { saveOrUpdateSwarm } from '@/services/swarm/db';
import { fetchSwarmDetails } from '@/services/swarm/api/swarm';

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

    // Use the new fetchSwarmStats with exponential backoff and super admin key
    const statsResult = await fetchSwarmDetails((swarm as { swarmId?: string; id: string }).swarmId || swarm.id);
    if (
      statsResult.ok &&
      typeof statsResult.data === 'object' &&
      statsResult.data !== null &&
      'success' in statsResult.data &&
      (statsResult.data as { success: boolean }).success
    ) {
      const details = statsResult.data as { data?: { x_api_key?: string } };
      const xApiKey = details.data?.x_api_key;
      await saveOrUpdateSwarm({
        workspaceId: swarm.workspaceId,
        status: SwarmStatus.ACTIVE,
        swarmApiKey: xApiKey,
      });
      return NextResponse.json({
        success: true,
        message: 'Swarm is now active',
        status: SwarmStatus.ACTIVE,
        data: details.data,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing id parameter' }, { status: 400 });
  }
  const swarm = await db.swarm.findUnique({ where: { id } });
  if (!swarm) {
    return NextResponse.json({ success: false, message: 'Swarm not found' }, { status: 404 });
  }
  // Call 3rd party for latest status
  let detailsResult = null;
  if ('swarmId' in swarm && typeof swarm.swarmId === 'string' && swarm.swarmId) {
    detailsResult = await fetchSwarmDetails(swarm.swarmId);
  }
  return NextResponse.json({
    success: true,
    status: swarm.status,
    details: detailsResult?.data,
  });
} 