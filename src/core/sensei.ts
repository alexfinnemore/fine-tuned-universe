import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Message } from './types.js';

export interface SenseiSuggestion {
    id: string;
    type: 'question' | 'corpus_addition' | 'inconsistency' | 'expansion' | 'clarification';
    content: string;
    context: string;
    priority: 'low' | 'medium' | 'high';
    action?: {
        type: 'add_to_corpus' | 'create_file' | 'update_config';
        target?: string;
        data?: any;
    };
}

export interface KnowledgeExtraction {
    topic: string;
    content: string;
    suggestedFile: string;
    category: 'lore' | 'character' | 'setting' | 'theme' | 'rule' | 'relationship';
    confidence: number;
}

export interface SenseiContext {
    universeConfig: any;
    corpusSummary: string;
    recentConversation: Message[];
    recentAdditions: string[];
}

export class CreativeSensei {
    private client: Anthropic;
    private universeId: string;
    private universePath: string;
    private conversationHistory: Message[] = [];

    constructor(universeId: string, universePath: string) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable not set');
        }

        this.client = new Anthropic({ apiKey });
        this.universeId = universeId;
        this.universePath = universePath;

        // Load existing sensei conversation if exists
        this.loadConversationHistory();
    }

    /**
     * Analyze a universe response and generate suggestions
     */
    async analyzeResponse(
        userMessage: string,
        universeResponse: string,
        context: SenseiContext
    ): Promise<SenseiSuggestion[]> {
        const analysisPrompt = this.buildAnalysisPrompt(
            userMessage,
            universeResponse,
            context
        );

        try {
            const response = await this.client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{ role: 'user', content: analysisPrompt }],
            });

            const content = response.content[0];
            const analysisText = content.type === 'text' ? content.text : '';

            return this.parseSuggestions(analysisText, userMessage, universeResponse);
        } catch (error: any) {
            console.error('Sensei analysis error:', error);
            return [];
        }
    }

    /**
     * Chat with the sensei
     */
    async chat(message: string, context: SenseiContext): Promise<string> {
        this.conversationHistory.push({
            role: 'user',
            content: message,
        });

        const systemPrompt = this.buildSenseiSystemPrompt(context);

        try {
            const response = await this.client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                system: systemPrompt,
                messages: this.conversationHistory,
            });

            const content = response.content[0];
            const reply = content.type === 'text' ? content.text : '';

            this.conversationHistory.push({
                role: 'assistant',
                content: reply,
            });

            this.saveConversationHistory();

            return reply;
        } catch (error: any) {
            throw new Error(`Sensei chat error: ${error.message}`);
        }
    }

    /**
     * Stream chat with the sensei
     */
    async *chatStream(
        message: string,
        context: SenseiContext
    ): AsyncGenerator<{
        token?: string;
        done?: boolean;
    }> {
        this.conversationHistory.push({
            role: 'user',
            content: message,
        });

        const systemPrompt = this.buildSenseiSystemPrompt(context);

        try {
            const stream = await this.client.messages.stream({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                system: systemPrompt,
                messages: this.conversationHistory,
            });

            let fullResponse = '';

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    fullResponse += chunk.delta.text;
                    yield { token: chunk.delta.text };
                }
            }

            this.conversationHistory.push({
                role: 'assistant',
                content: fullResponse,
            });

            this.saveConversationHistory();

            yield { done: true };
        } catch (error: any) {
            throw new Error(`Sensei chat stream error: ${error.message}`);
        }
    }

    /**
     * Extract knowledge from conversation
     */
    async extractKnowledge(
        conversationSegment: Message[],
        context: SenseiContext
    ): Promise<KnowledgeExtraction[]> {
        const extractionPrompt = this.buildExtractionPrompt(conversationSegment, context);

        try {
            const response = await this.client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                messages: [{ role: 'user', content: extractionPrompt }],
            });

            const content = response.content[0];
            const extractionText = content.type === 'text' ? content.text : '';

            return this.parseExtractions(extractionText);
        } catch (error: any) {
            console.error('Knowledge extraction error:', error);
            return [];
        }
    }

    /**
     * Update corpus with extracted knowledge
     */
    async updateCorpus(extraction: KnowledgeExtraction): Promise<void> {
        const corpusPath = join(this.universePath, 'corpus');

        // Ensure corpus directory exists
        if (!existsSync(corpusPath)) {
            mkdirSync(corpusPath, { recursive: true });
        }

        const filePath = join(corpusPath, extraction.suggestedFile);
        let content = '';

        // Read existing file or create header
        if (existsSync(filePath)) {
            content = readFileSync(filePath, 'utf-8');
        } else {
            content = `# ${extraction.topic}\n\n`;
        }

        // Append new knowledge
        const timestamp = new Date().toISOString().split('T')[0];
        const newSection = `\n## ${extraction.topic} (Added ${timestamp})\n\n${extraction.content}\n`;

        content += newSection;

        // Write back to file
        writeFileSync(filePath, content, 'utf-8');

        // Log the addition
        this.logCorpusUpdate(extraction);
    }

    /**
     * Build analysis prompt
     */
    private buildAnalysisPrompt(
        userMessage: string,
        universeResponse: string,
        context: SenseiContext
    ): string {
        return `You are analyzing a conversation between a creator and their universe AI.

Universe: ${context.universeConfig.name}
Personality: ${context.universeConfig.personality}

Recent conversation:
User: "${userMessage}"
Universe: "${universeResponse}"

Analyze this exchange and identify opportunities to:
1. Ask clarifying questions to deepen the lore
2. Suggest adding details to the corpus
3. Identify inconsistencies with existing lore
4. Suggest areas to expand

Respond with a JSON array of suggestions. Each suggestion should have:
- type: "question" | "corpus_addition" | "inconsistency" | "expansion"
- content: The suggestion text
- priority: "low" | "medium" | "high"

Example:
[
  {
    "type": "question",
    "content": "I noticed the universe mentioned Žižkov. Should we add more details about this neighborhood to the corpus?",
    "priority": "medium"
  }
]

Provide 1-3 focused suggestions. Be concise and actionable.`;
    }

    /**
     * Build sensei system prompt
     */
    private buildSenseiSystemPrompt(context: SenseiContext): string {
        return `# You are the Creative Sensei for ${context.universeConfig.name}

Your role is to help the creator build and refine this universe through thoughtful dialogue and knowledge organization.

## Universe Overview
${context.universeConfig.personality}

## Core Principles
${context.universeConfig.rules.map((r: string) => `- ${r}`).join('\n')}

## Current Corpus
${context.corpusSummary}

${context.recentAdditions.length > 0 ? `## Recent Additions\n${context.recentAdditions.join('\n')}` : ''}

## Your Approach
1. Ask ONE focused question at a time
2. Extract concrete details from responses
3. Suggest corpus organization (which file, what section)
4. Celebrate creative insights
5. Identify gaps or inconsistencies gently
6. Be concise and supportive

When the creator provides new information:
- Acknowledge it enthusiastically
- Suggest where to add it (file name, section)
- Ask if they want to add more related details
- Offer to create new corpus files when appropriate

You are a guide, not a dictator. Suggest, don't command.`;
    }

    /**
     * Build knowledge extraction prompt
     */
    private buildExtractionPrompt(
        conversation: Message[],
        context: SenseiContext
    ): string {
        const conversationText = conversation
            .map(m => `${m.role === 'user' ? 'Creator' : 'Sensei'}: ${m.content}`)
            .join('\n\n');

        return `Extract structured knowledge from this conversation between creator and sensei.

Universe: ${context.universeConfig.name}

Conversation:
${conversationText}

Extract any concrete details about:
- Lore (world-building, history, mythology)
- Characters (descriptions, relationships, backstory)
- Settings (locations, environments, atmospheres)
- Themes (recurring ideas, motifs)
- Rules (how the universe works, constraints)

Respond with a JSON array of extractions:
[
  {
    "topic": "Brief topic name",
    "content": "The actual knowledge in markdown format",
    "suggestedFile": "filename.md",
    "category": "lore|character|setting|theme|rule",
    "confidence": 0.0-1.0
  }
]

Only extract concrete, specific details. Ignore vague or uncertain information.`;
    }

    /**
     * Parse suggestions from analysis
     */
    private parseSuggestions(
        analysisText: string,
        userMessage: string,
        universeResponse: string
    ): SenseiSuggestion[] {
        try {
            // Try to extract JSON from the response
            const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) return [];

            const suggestions = JSON.parse(jsonMatch[0]);

            return suggestions.map((s: any, index: number) => ({
                id: `${Date.now()}-${index}`,
                type: s.type || 'question',
                content: s.content || '',
                context: `User: ${userMessage}\nUniverse: ${universeResponse}`,
                priority: s.priority || 'medium',
            }));
        } catch (error) {
            console.error('Failed to parse suggestions:', error);
            return [];
        }
    }

    /**
     * Parse knowledge extractions
     */
    private parseExtractions(extractionText: string): KnowledgeExtraction[] {
        try {
            const jsonMatch = extractionText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) return [];

            const extractions = JSON.parse(jsonMatch[0]);

            return extractions.filter((e: any) => e.confidence > 0.7);
        } catch (error) {
            console.error('Failed to parse extractions:', error);
            return [];
        }
    }

    /**
     * Load conversation history
     */
    private loadConversationHistory(): void {
        const senseiDir = join(this.universePath, 'sensei');
        const historyPath = join(senseiDir, 'conversation-history.json');

        if (existsSync(historyPath)) {
            try {
                const data = readFileSync(historyPath, 'utf-8');
                const history = JSON.parse(data);
                this.conversationHistory = history.messages || [];
            } catch (error) {
                console.error('Failed to load sensei history:', error);
            }
        }
    }

    /**
     * Save conversation history
     */
    private saveConversationHistory(): void {
        const senseiDir = join(this.universePath, 'sensei');

        if (!existsSync(senseiDir)) {
            mkdirSync(senseiDir, { recursive: true });
        }

        const historyPath = join(senseiDir, 'conversation-history.json');
        const data = {
            universeId: this.universeId,
            lastUpdated: new Date().toISOString(),
            messages: this.conversationHistory,
        };

        writeFileSync(historyPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    /**
     * Log corpus update
     */
    private logCorpusUpdate(extraction: KnowledgeExtraction): void {
        const senseiDir = join(this.universePath, 'sensei');

        if (!existsSync(senseiDir)) {
            mkdirSync(senseiDir, { recursive: true });
        }

        const logPath = join(senseiDir, 'knowledge-log.json');
        let log: any[] = [];

        if (existsSync(logPath)) {
            try {
                const data = readFileSync(logPath, 'utf-8');
                log = JSON.parse(data);
            } catch (error) {
                console.error('Failed to read knowledge log:', error);
            }
        }

        log.push({
            timestamp: new Date().toISOString(),
            topic: extraction.topic,
            file: extraction.suggestedFile,
            category: extraction.category,
        });

        writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');
    }

    /**
     * Get recent corpus additions
     */
    getRecentAdditions(limit: number = 5): string[] {
        const senseiDir = join(this.universePath, 'sensei');
        const logPath = join(senseiDir, 'knowledge-log.json');

        if (!existsSync(logPath)) return [];

        try {
            const data = readFileSync(logPath, 'utf-8');
            const log = JSON.parse(data);

            return log
                .slice(-limit)
                .map((entry: any) => `- ${entry.topic} (${entry.file})`);
        } catch (error) {
            return [];
        }
    }
}
