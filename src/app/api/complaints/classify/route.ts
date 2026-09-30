import { NextResponse } from 'next/server';
import { classifyComplaint } from '@/server/services/complaintService';

export async function POST(request: Request) {
  try {
    const { title, description, location } = await request.json();
    if (!title && !description) {
      return NextResponse.json({ error: 'Title or description required' }, { status: 400 });
    }

    const classification = await classifyComplaint({
      title: title || '',
      description: description || '',
      location: location || '',
    });

    return NextResponse.json(classification);
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json({ error: 'Failed to classify' }, { status: 500 });
  }
}
