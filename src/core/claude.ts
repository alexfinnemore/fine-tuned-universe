import Anthropic from '@anthropic-ai/sdk';
import type { Message } from './types.js';

const INPUT_PRICE_PER_TOKEN = 0.003 / 1000; // $3 per million tokens
const OUTPUT_PRICE_PER_TOKEN = 0.015 / 1000; // $15 per million tokens

export class ClaudeClient {
  private client: Anthropic;
  private model: string;

  constructor(model: string = 'claude-sonnet-4-20250514') {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable not set');
    }

    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async chat(
    systemPrompt: string,
    messages: Message[]
  ): Promise<{
    response: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.content[0];
      const responseText = content.type === 'text' ? content.text : '';

      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      const cost = this.calculateCost(inputTokens, outputTokens);

      return {
        response: responseText,
        inputTokens,
        outputTokens,
        cost,
      };
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid API key. Check your ANTHROPIC_API_KEY in .env');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(`Claude API error: ${error.message}`);
      }
    }
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    return inputTokens * INPUT_PRICE_PER_TOKEN + outputTokens * OUTPUT_PRICE_PER_TOKEN;
  }

  formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  }
}
