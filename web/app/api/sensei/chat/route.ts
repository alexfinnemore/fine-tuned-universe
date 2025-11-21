import { NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { CreativeSensei } from '../../../../../dist/core/sensei.js';
import { loadUniverseConfig } from '../../../../../dist/utils/config.js';
import { loadCorpus } from '../../../../../dist/utils/corpus.js';
import { getCorpusSummary } from '../../../../../dist/utils/corpus.js';

const PROJECT_ROOT = process.cwd();

interface ChatRequest {
    universeId: string;
    message: string;
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
        const { universeId, message }: ChatRequest = await request.json();

        if (!universeId || !message) {
            return NextResponse.json(
                { error: 'Invalid request: universeId and message required' },
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

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of sensei.chatStream(message, context)) {
                        if (chunk.token) {
                            const data = JSON.stringify({ type: 'token', token: chunk.token });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }

                        if (chunk.done) {
                            const data = JSON.stringify({ type: 'done' });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                    }

                    controller.close();
                } catch (error: any) {
                    const errorData = JSON.stringify({
                        type: 'error',
                        message: error.message,
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error('Sensei chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process sensei chat', message: error.message },
            { status: 500 }
        );
    }
}
