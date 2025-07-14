import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, getGithubUsernameAndPAT } from '@/lib/auth/nextauth';
import { db } from '@/lib/db';
import { swarmApiRequest } from '@/services/swarm/api/swarm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repo_url, workspaceId, swarmId, use_lsp, commit } = body;
    if (!repo_url || (!workspaceId && !swarmId)) {
      return NextResponse.json({ success: false, message: 'Missing required fields: repo_url and workspaceId or swarmId' }, { status: 400 });
    }

    // Get user's GitHub username and PAT using the reusable utility
    const githubCreds = await getGithubUsernameAndPAT(session.user.id);
    if (!githubCreds) {
      return NextResponse.json({ success: false, message: 'No GitHub credentials found for user' }, { status: 400 });
    }
    const { username, pat } = githubCreds;

    // Resolve Swarm
    const where: Record<string, string> = {};
    if (swarmId) where.swarmId = swarmId;
    if (!swarmId && workspaceId) where.workspaceId = workspaceId;
    const swarm = await db.swarm.findFirst({ where });
    if (!swarm) {
      return NextResponse.json({ success: false, message: 'Swarm not found' }, { status: 404 });
    }
    if (!swarm.swarmUrl || !swarm.swarmApiKey) {
      return NextResponse.json({ success: false, message: 'Swarm URL or API key not set' }, { status: 400 });
    }

    // Confirm repo_url association (for now, check repositoryUrl field)
    if (swarm.repositoryUrl !== repo_url) {
      return NextResponse.json({ success: false, message: 'Swarm is not associated with the given repo_url' }, { status: 400 });
    }

    // Proxy to stakgraph microservice
    const apiResult = await swarmApiRequest({
      swarmUrl: `https://stakgraph.${swarm.name}.sphinx.chat`,
      endpoint: '/ingest',
      method: 'POST',
      apiKey: swarm.swarmApiKey,
      data: {
        repo_url,
        username,
        pat,
        use_lsp,
        commit,
      },
    });

    return NextResponse.json({
      success: apiResult.ok,
      status: apiResult.status,
      data: apiResult.data,
    }, { status: apiResult.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to ingest code' }, { status: 500 });
  }
} 