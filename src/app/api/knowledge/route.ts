import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  listKnowledgeDocuments,
  uploadAndIndexDocument,
  deleteKnowledgeDocument,
} from '@/server/services/knowledgeService';

export async function GET() {
  try {
    const documents = await listKnowledgeDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Knowledge GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge base' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { title, fileName, fileType, department, category, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and document content are required' }, { status: 400 });
    }

    const doc = await uploadAndIndexDocument(
      { title, fileName, fileType, department, category, content },
      { id: user.id, name: user.name, role: user.role }
    );

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    console.error('Knowledge POST error:', error);
    return NextResponse.json({ error: 'Failed to index document' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Document ID required' }, { status: 400 });

    await deleteKnowledgeDocument(id, { id: user.id, name: user.name, role: user.role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
