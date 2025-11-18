import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    // Determine which file to read
    let filename: string;
    if (type === 'user') {
      filename = 'HOW-IT-WORKS-USER.md';
    } else if (type === 'technical') {
      filename = 'HOW-IT-WORKS-TECHNICAL.md';
    } else {
      return NextResponse.json(
        { error: 'Invalid documentation type' },
        { status: 400 }
      );
    }

    // Try reading from web directory first (production build),
    // then fall back to parent directory (development)
    let filePath = join(PROJECT_ROOT, filename);

    if (!existsSync(filePath)) {
      filePath = join(PROJECT_ROOT, '..', filename);
    }

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Documentation file not found' },
        { status: 404 }
      );
    }

    const content = readFileSync(filePath, 'utf-8');

    return NextResponse.json({
      content,
      type,
    });
  } catch (error: any) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      { error: 'Failed to load documentation', message: error.message },
      { status: 500 }
    );
  }
}
