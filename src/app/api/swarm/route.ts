import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import { SwarmService } from '@/services/swarm';
import { ServiceConfig } from '@/types';
import { config } from '@/lib/env';
import { saveOrUpdateSwarm } from '@/services/swarm/db';
import { SwarmStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, vanity_address, name, instance_type, env } = body;

    // Validate required fields
    if (!workspaceId || !vanity_address || !name || !instance_type) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: workspaceId, vanity_address, name, instance_type',
      }, { status: 400 });
    }

    // Save or update Swarm in the database (status: PENDING)
    await saveOrUpdateSwarm({
      workspaceId,
      name: vanity_address, // domain name used for creation
      instanceType: instance_type,
      environmentVariables: env,
      status: SwarmStatus.PENDING,
    });

    // Trigger the 3rd party request
    const swarmService = new SwarmService(config as unknown as ServiceConfig);
    const apiResponse = await swarmService.createSwarm({ vanity_address, name, instance_type, env });

    // Optionally update the swarm with returned swarm_id
    if (apiResponse?.swarm_id) {
      await saveOrUpdateSwarm({
        workspaceId,
        swarmUrl: `https://${apiResponse.swarm_id}/api`,
        status: SwarmStatus.ACTIVE,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${name} was created successfully`,
      data: { swarm_id: apiResponse?.swarm_id },
    });
  } catch (error) {
    console.error('Error creating Swarm:', error);
    return NextResponse.json({ success: false, message: 'Failed to create swarm' }, { status: 500 });
  }
} 