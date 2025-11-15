# Quick Start Guide

Get chatting with Universe K in under 5 minutes!

## Prerequisites

- Node.js 18 or later
- Anthropic API key (get one at https://console.anthropic.com/settings/keys)

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the project root:

```bash
# Copy the example
cp .env.example .env

# Edit .env and add your API key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Important**: Never commit your `.env` file! It's already in `.gitignore`.

## Start Chatting

```bash
npm run chat
```

This will start a chat session with Universe K, our test universe.

## Chat Commands

While chatting, you can use these commands:

- Type your message and press Enter to chat
- `/exit` - End the conversation and see stats
- `/info` - Show universe details and current stats
- `/clear` - Clear conversation history and start fresh

## What is Universe K?

Universe K is a sophisticated narrative universe that combines:

- **Mycelial biology** - Networks, communication, spore dispersal
- **Quantum encryption** - Modern cryptography and information theory
- **Kafka & Prague** - Literary depth and philosophical weight
- **Complex storytelling** - Generates detailed novel outlines

It's designed to be our most complex test case. If the system works for Universe K, it'll work for anything!

## Example Interaction

```
You: Create a detailed novel outline for K's story

Universe K: [Generates comprehensive multi-chapter outline...]
```

## Cost Tracking

Every response shows:
- Tokens used in this message
- Total tokens used in conversation
- Estimated cost (in USD)

Typical costs:
- Short conversation (10-20 messages): $0.05-0.15
- Novel outline generation: $0.20-0.50

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure you created the `.env` file
- Check that your API key is correctly formatted
- Restart your terminal after creating `.env`

### "Universe not found: universe-k"
- Make sure you're in the project root directory
- Check that `templates/universe-k/` exists

### API errors (401, 429)
- 401: Invalid API key - check your key
- 429: Rate limit - wait a moment and try again

## Next Steps

Once you've successfully chatted with Universe K:

1. Try generating a novel outline: `npm run chat`
2. Explore the corpus files in `templates/universe-k/corpus/`
3. Modify `templates/universe-k/config.yml` to experiment
4. Review the architecture in `ARCHITECTURE.md`

## Development

To work on the codebase:

```bash
# Run in development mode (auto-reload)
npm run dev

# Build TypeScript
npm run build

# Run built version
npm start
```

## Need Help?

- Check the main [README.md](./README.md)
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Open an issue on GitHub
- Read the [USER_JOURNEY.md](./USER_JOURNEY.md) for detailed scenarios

---

Ready to build some universes? Start chatting! 🌌
