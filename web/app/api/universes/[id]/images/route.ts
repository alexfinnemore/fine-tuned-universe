import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check for images directory
    const imagesDir = join(universePath, 'images');
    if (!existsSync(imagesDir)) {
      return NextResponse.json({ images: [] });
    }

    // List image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const files = readdirSync(imagesDir)
      .filter(f => imageExtensions.some(ext => f.toLowerCase().endsWith(ext)))
      .map(filename => {
        const filePath = join(imagesDir, filename);
        const content = readFileSync(filePath);
        const base64 = content.toString('base64');
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;

        return {
          filename,
          url: `data:${mimeType};base64,${base64}`,
          size: content.length,
        };
      });

    return NextResponse.json({ images: files });
  } catch (error: any) {
    console.error('Error reading images:', error);
    return NextResponse.json(
      { error: 'Failed to read images', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Only allow uploading to user universes
    const userPath = join(PROJECT_ROOT, 'universes', id);
    if (!existsSync(userPath)) {
      return NextResponse.json(
        { error: 'Can only upload to user universes' },
        { status: 403 }
      );
    }

    // Create images directory if it doesn't exist
    const imagesDir = join(userPath, 'images');
    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(imagesDir, file.name);
    writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', message: error.message },
      { status: 500 }
    );
  }
}
