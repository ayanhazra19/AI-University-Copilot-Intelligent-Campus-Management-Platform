import { NextResponse } from 'next/server';
import { generateComplaintsReport, generateAttendanceReport } from '@/server/services/reportService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'complaints';
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv';

    if (type === 'complaints') {
      const report = await generateComplaintsReport(format);
      if (report.type === 'csv') {
        return new NextResponse(report.data, {
          headers: {
            'Content-Type': report.contentType,
            'Content-Disposition': `attachment; filename="${report.fileName}"`,
          },
        });
      }
      return NextResponse.json(report.data);
    }

    if (type === 'attendance') {
      const report = await generateAttendanceReport(format);
      if (report.type === 'csv') {
        return new NextResponse(report.data, {
          headers: {
            'Content-Type': report.contentType,
            'Content-Disposition': `attachment; filename="${report.fileName}"`,
          },
        });
      }
      return NextResponse.json(report.data);
    }

    return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
