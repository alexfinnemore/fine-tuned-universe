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
```

### 5. Collaborate (Future)
```bash
# Make two universes collaborate on a project
npm run collaborate industrial-mystic cybernetic-architect \
  --prompt "Create a sonic installation about memory"
```

## Project Status

**Current Phase**: Planning & V1 Development

See [GitHub Issues](https://github.com/alexfinnemore/fine-tuned-universe/issues) for detailed roadmap.

### V1 Goals (MVP)
- CLI tool for creating and managing universes
- Simple chat interface for single universe interaction
- Markdown-based corpus management
- System prompt configuration
- Basic artifact generation

### Future Vision
- Multi-universe collaboration
- Web UI (deployable to Vercel)
- MCP integration for multimodal (images, audio)
- Style transfer between universes
- Persistent memory and evolution
- Export/share universes

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

```bash
# Clone the repository
git clone https://github.com/alexfinnemore/fine-tuned-universe.git
cd fine-tuned-universe

# Install dependencies
npm install

# Create your first universe
npm run create-universe "my-universe" "A poetic philosopher"

# Start chatting
npm run chat my-universe
```

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Technical architecture and design decisions
- [`USER_JOURNEY.md`](./USER_JOURNEY.md) - Detailed user flows and scenarios
- [`post 1.md`](./post%201.md) - Original vision: collaborative universes
- [`post 2.md`](./post%202.md) - Original vision: technical implementation

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
