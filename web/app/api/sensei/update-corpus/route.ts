import { NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { CreativeSensei, type KnowledgeExtraction } from '../../../../../dist/core/sensei.js';

const PROJECT_ROOT = process.cwd();

interface UpdateCorpusRequest {
    universeId: string;
    extraction: KnowledgeExtraction;
}

function getUniversePath(universeId: string): string | null {
    const templatePath = join(PROJECT_ROOT, 'templates', universeId);
    const userPath = join(PROJECT_ROOT, 'universes', universeId);

    if (existsSync(userPath)) {
        return userPath;
    } else if (existsSync(templatePath)) {
        return templatePath;
    }
    return null;
}

export async function POST(request: Request) {
    try {
        const { universeId, extraction }: UpdateCorpusRequest = await request.json();

        if (!universeId || !extraction) {
            return NextResponse.json(
                { error: 'Invalid request: universeId and extraction required' },
                { status: 400 }
            );
        }

        const universePath = getUniversePath(universeId);
        if (!universePath) {
            return NextResponse.json(
                { error: 'Universe not found' },
                { status: 404 }
            );
        }

        // Initialize sensei
        const sensei = new CreativeSensei(universeId, universePath);

        // Update corpus
        await sensei.updateCorpus(extraction);

        return NextResponse.json({
            success: true,
            file: extraction.suggestedFile,
            topic: extraction.topic
        });
    } catch (error: any) {
        console.error('Sensei update corpus API error:', error);
        return NextResponse.json(
            { error: 'Failed to update corpus', message: error.message },
            { status: 500 }
        );
    }
}
