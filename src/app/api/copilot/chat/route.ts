import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processCopilotQuery } from '@/server/services/copilotService';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    const userRole = user?.role || 'STUDENT';
    const studentProfileId = user?.student?.id;

    const result = await processCopilotQuery({
      query,
      userRole,
      studentProfileId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Copilot Chat Error:', error);
    return NextResponse.json(
      {
        answer: 'CampusIQ Copilot encountered a temporary processing delay. Please retry your request or consult the relevant department portal.',
        queryCategory: 'GENERAL',
        sources: [],
      },
      { status: 500 }
    );
  }
}
