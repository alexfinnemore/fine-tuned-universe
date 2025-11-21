import { NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { CreativeSensei } from '../../../../../dist/core/sensei.js';
import { loadUniverseConfig } from '../../../../../dist/utils/config.js';
import { loadCorpus } from '../../../../../dist/utils/corpus.js';
import { getCorpusSummary } from '../../../../../dist/utils/corpus.js';

const PROJECT_ROOT = process.cwd();

interface AnalyzeRequest {
    universeId: string;
    userMessage: string;
    universeResponse: string;
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
        const { universeId, userMessage, universeResponse }: AnalyzeRequest = await request.json();

        if (!universeId || !userMessage || !universeResponse) {
            return NextResponse.json(
                { error: 'Invalid request: universeId, userMessage, and universeResponse required' },
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

        // Load universe context
        const config = loadUniverseConfig(universePath);
        const corpus = loadCorpus(universePath);
        const corpusSummary = getCorpusSummary(corpus);

        // Initialize sensei
        const sensei = new CreativeSensei(universeId, universePath);
        const recentAdditions = sensei.getRecentAdditions(5);

        const context = {
            universeConfig: config,
            corpusSummary,
            recentConversation: [],
            recentAdditions,
        };

        // Analyze the response
        const suggestions = await sensei.analyzeResponse(
            userMessage,
            universeResponse,
            context
        );

        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error('Sensei analyze API error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze response', message: error.message },
            { status: 500 }
        );
    }
}
