import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params;

    // Locate universe
    const templatePath = join(PROJECT_ROOT, 'templates', id);
    const userPath = join(PROJECT_ROOT, 'universes', id);

    let universePath: string;
    if (existsSync(userPath)) {
      universePath = userPath;
    } else if (existsSync(templatePath)) {
      universePath = templatePath;
    } else {
      return NextResponse.json(
        { error: 'Universe not found' },
        { status: 404 }
      );
    }

    // Read corpus file
    const filePath = join(universePath, 'corpus', filename);
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Corpus file not found' },
        { status: 404 }
      );
    }

    const content = readFileSync(filePath, 'utf-8');

    return NextResponse.json({
      filename,
      content,
      tokens: Math.ceil(content.length / 4),
    });
  } catch (error: any) {
    console.error('Error reading corpus file:', error);
    return NextResponse.json(
      { error: 'Failed to read corpus file', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Locate universe (only allow editing user universes, not templates)
    const userPath = join(PROJECT_ROOT, 'universes', id);

    if (!existsSync(userPath)) {
      return NextResponse.json(
        { error: 'Can only edit user universes, not templates' },
        { status: 403 }
      );
    }

    // Write corpus file
    const filePath = join(userPath, 'corpus', filename);
    writeFileSync(filePath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      filename,
      tokens: Math.ceil(content.length / 4),
    });
  } catch (error: any) {
    console.error('Error writing corpus file:', error);
    return NextResponse.json(
      { error: 'Failed to write corpus file', message: error.message },
      { status: 500 }
    );
  }
}
