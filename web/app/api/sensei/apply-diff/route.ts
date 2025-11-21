import { NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { CreativeSensei } from '../../../../../dist/core/sensei.js';
import type { SenseiSuggestion } from '../../../../../dist/core/sensei.js';

const PROJECT_ROOT = process.cwd();

interface ApplyDiffRequest {
    universeId: string;
    suggestion: SenseiSuggestion;
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
        const { universeId, suggestion }: ApplyDiffRequest = await request.json();

        if (!universeId || !suggestion || !suggestion.diff) {
            return NextResponse.json(
                { error: 'Invalid request: universeId and suggestion with diff required' },
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

        // Apply the diff
        await sensei.applyDiff(suggestion);

        return NextResponse.json({
            success: true,
            filePath: suggestion.diff.filePath,
            operation: suggestion.diff.operation
        });
    } catch (error: any) {
        console.error('Apply diff API error:', error);
        return NextResponse.json(
            { error: 'Failed to apply diff', message: error.message },
            { status: 500 }
        );
    }
}
