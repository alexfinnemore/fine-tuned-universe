# Fine-Tuned Universe

> Create personalized AI universes with distinct personalities, knowledge, and collaborative capabilities—without needing to fine-tune models.

## What is a Fine-Tuned Universe?

A "fine-tuned universe" is a personalized AI system with its own:

- **Laws of meaning** - rules of logic, style, narrative tone, ethics
- **Memory substrate** - a corpus of knowledge, stories, and aesthetic sources
- **Personas** - distinct voices and characters
- **Feedback dynamics** - how new information reshapes the world

Think of it as creating a pocket dimension where an AI thinks, speaks, and creates according to your unique vision—whether that's a poetic philosopher, an industrial sound mystic, or a cybernetic architect.

## The Problem This Solves

The original vision (described in `post 1.md` and `post 2.md`) requires:
- Fine-tuning open-source models
- LoRA/QLoRA adapters
- Vector databases (Chroma, FAISS, Pinecone)
- GPU resources
- Complex orchestration frameworks (LangChain, CrewAI)
- Significant technical expertise

**This is too complex for most people who just want to create their own AI universe.**

## Our Approach: Simplicity First

Instead of fine-tuning models, we use:

1. **System Prompts** - Text files that define your universe's "physics"
2. **Corpus Files** - Markdown/text documents that form your universe's knowledge
3. **Claude Code Skills** - Pre-packaged personas that can be customized
4. **Simple APIs** - Direct calls to Claude with your custom context
5. **MCP Connections** (future) - For multimodal capabilities (images, audio)

No GPUs. No training. No complex frameworks. Just files, prompts, and simple scripts.

## User Journey

### 1. Create Your Universe
```bash
# Define a new universe with a name and core personality
npm run create-universe "industrial-mystic" "Graeme Revell / SPK"
```

### 2. Populate Its Knowledge
```
universes/industrial-mystic/
  corpus/
    sound-philosophy.md
    ritual-psychology.md
    industrial-aesthetics.md
```

### 3. Define Its Laws
```yaml
# universes/industrial-mystic/config.yml
name: "Industrial Mystic"
personality: "Ritual noise philosopher, affective ecstatic prophet"
rules:
  - "Speak in ritual-poetic language"
  - "Sound as exorcism, chaos as renewal"
  - "Blend trauma with transcendence"
tone: "industrial, mystical, prophetic"
vocabulary: ["erosion", "ascension", "pulse of decay", "voltage"]
```

### 4. Interact
```bash
# Chat with your universe
npm run chat industrial-mystic

> "What remains of the human when sound becomes architecture?"

# Conversations are automatically saved!
# Your last 10 messages will be loaded when you return
```

### 5. Collaborate (Future)
```bash
# Make two universes collaborate on a project
npm run collaborate industrial-mystic cybernetic-architect \
  --prompt "Create a sonic installation about memory"
```

## Project Status

**Current Phase**: V1 MVP Complete! 🎉

See [V0.1-STATUS.md](./V0.1-STATUS.md) for detailed progress and [GitHub Issues](https://github.com/alexfinnemore/fine-tuned-universe/issues) for roadmap.

### ✅ V1 Completed Features
- ✅ CLI tool for creating and managing universes
- ✅ Full chat interface with memory persistence (CLI + Web)
- ✅ **Web chat interface** - chat through your browser!
- ✅ **Dynamic universe theming** - unique colors per universe!
- ✅ **Corpus file viewer & editor** - view/edit knowledge base in-browser
- ✅ **Image gallery & upload** - visual reference for universes
- ✅ Markdown-based corpus management
- ✅ YAML configuration system
- ✅ Token tracking and cost estimation
- ✅ **Web UI with universe browsing**
- ✅ Two complete example templates

### 🔄 In Progress
- Additional templates (Industrial Mystic, Cybernetic Architect)
- Troubleshooting guide and documentation polish

### 🚀 Future Vision (V2/V3)
- Multi-universe collaboration
- MCP integration for multimodal (images, audio)
- Vercel deployment
- Style transfer between universes
- Export/share universes
- Universe marketplace

## Why This Matters

Fine-tuned universes represent **memetic micro-climates**—personalized AI ecosystems that preserve unique voices, aesthetics, and ways of thinking. Some will be:

- Personal creative companions
- Artistic collaborators
- Philosophical dialogue partners
- Educational tools
- Experimental thinking spaces

This project makes that vision accessible to anyone who can use Claude Code.

## Technical Approach

### What We're NOT Doing
- ❌ Fine-tuning models
- ❌ Training LoRA adapters
- ❌ Managing vector databases
- ❌ Requiring GPU resources
- ❌ Complex ML pipelines

### What We ARE Doing
- ✅ System prompt engineering
- ✅ Context management via file structures
- ✅ API orchestration (Claude)
- ✅ Simple Node.js/TypeScript tooling
- ✅ MCP for advanced features (optional)
- ✅ Markdown-based knowledge graphs

## Getting Started

### Quick Start (5 minutes)

**1. Clone and Install**
```bash
git clone https://github.com/alexfinnemore/fine-tuned-universe.git
cd fine-tuned-universe
npm install
```

**2. Configure API Key**
```bash
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**3. Try the CLI**
```bash
# Chat with Universe K
npm run chat universe-k

# Or create your own universe
npm run create-universe "my-universe"
```

**4. Try the Web Interface**
```bash
cd web && npm run dev
# Open http://localhost:3000
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## Documentation

- [`V0.1-STATUS.md`](./V0.1-STATUS.md) - Current project status and completion
- [`QUICKSTART.md`](./QUICKSTART.md) - 5-minute setup guide
- [`CLAUDE.md`](./CLAUDE.md) - Development workflow and methodology
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Technical architecture and design decisions
- [`USER_JOURNEY.md`](./USER_JOURNEY.md) - Detailed user flows and scenarios
- [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md) - Phased roadmap and implementation plan
- [`post 1.md`](./post%201.md) - Original vision: collaborative universes
- [`post 2.md`](./post%202.md) - Original vision: technical implementation

## FAQ

### Do I need ML or AI expertise to use this?

No! You're doing clever prompt engineering, not training models. If you can edit YAML files and write markdown, you can create a universe.

### How much will API costs be?

Typical usage is ~$0.03-0.10 per conversation. A heavy user might spend $10-30/month. We'll add cost tracking and estimation tools (see Issue #33) so you always know what you're spending.

### Can this really match actual fine-tuning?

For most use cases, yes. With Claude's 200K token context window, you can fit extensive personality definitions and knowledge. It won't match the deep style imprint of actual fine-tuning on millions of examples, but it covers 90% of use cases without the complexity.

### What if I want to work with images or audio?

That's planned for V2 via MCP (Model Context Protocol) integration (Issue #13). V1 focuses on text, which we need to nail first. Once that's solid, multimodal capabilities are straightforward to add.

### Is this just for creative/artistic uses?

Not at all! It works equally well for:
- **Writers** - Creative companions and style mirrors
- **Researchers** - Specialized dialogue partners trained on academic texts
- **Educators** - Custom tutors with specific pedagogical approaches
- **Technical writers** - Domain-specific documentation assistants
- **Anyone** with a unique voice or knowledge base they want to preserve

### How is this different from Character.ai or Replika?

Those are centralized platforms with limited customization. Fine-Tuned Universe is:
- **Local-first** - Your data stays on your machine
- **Fully customizable** - Edit every aspect via files
- **Open source** - Inspect, modify, extend the code
- **No lock-in** - Export and share your universes
- **Privacy-focused** - No telemetry or data collection

### What about privacy and data security?

All your data (corpus, conversations, configs) stays on your machine by default. The only data sent to Anthropic is:
- The system prompt (generated from your config)
- Your conversation messages
- Relevant corpus excerpts

Your API key is stored locally in `.env` and never leaves your machine. We never collect telemetry or track usage.

### Can I use this with other AI models (GPT-4, local models)?

V1 uses Claude exclusively. V2 will support model adapters for other APIs. V3 will support local models (Ollama, LM Studio) for completely free, offline operation (Issue #19).

### How long does it take to create a universe?

Our target is <15 minutes for your first universe:
- 5 min: Installation
- 5 min: Universe creation and configuration
- 5 min: Adding initial corpus files

After that, you can continuously refine and evolve it.

### Will my universe "drift" and lose its personality over time?

We're building safeguards against this:
- System prompt is regenerated for each conversation
- Corpus is re-referenced for each query
- Configuration enforces rules consistently
- Memory system can create "reflections" that reinforce core traits

If you notice drift, you can adjust your config rules or add more corpus examples.

### Can I share my universe with others?

Yes! V2 will include export/import functionality (Issue #15). Export creates a portable .zip with your config and corpus (but not your private conversations). Others can import and run your universe, or fork and customize it.

Eventually we plan a universe marketplace where you can discover and share universes (Issue #18).

### What's the business model? Will this cost money?

The tool itself is free and open source (MIT license). You only pay for:
- Claude API usage (your own Anthropic account)
- Optional: Hosted web version (future, opt-in)

We may explore premium features later (marketplace, hosting), but the core CLI tool will always be free.

### I have more questions!

- Check the [Issues](https://github.com/alexfinnemore/fine-tuned-universe/issues) for detailed technical discussions
- Read [`USER_JOURNEY.md`](./USER_JOURNEY.md) for detailed scenarios
- Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for technical deep-dive
- Open a new issue with your question

## Contributing

This project is in early stages. We welcome:
- User feedback on the concept
- Technical design input
- Example universes and use cases
- Documentation improvements

## License

MIT

---

**A living dialogue of voltage and vision, oscillating between the scream and the code.**
