# Architecture

## Design Philosophy

The Fine-Tuned Universe project is built on three core principles:

1. **Simplicity over Power** - We prioritize ease of use over maximum capability
2. **Files over Databases** - Configuration and memory are stored as readable files
3. **Composability** - Small, simple pieces that can be combined in powerful ways

## Why Not Fine-Tuning?

Traditional "fine-tuned universes" require:
- Training infrastructure (GPUs, cloud compute)
- ML expertise (LoRA, vector embeddings, hyperparameters)
- Complex toolchains (LangChain, vector stores, embedding models)
- Ongoing maintenance and versioning

Our approach recognizes that **context is the new fine-tuning**:
- Modern LLMs (Claude 3.5 Sonnet) have 200K+ token context windows
- System prompts can define personality, rules, and style
- Corpus files can be dynamically loaded as context
- No training required—just clever prompt engineering

## System Architecture

```
fine-tuned-universe/
├── cli/                    # Command-line interface
│   ├── create.ts          # Create new universes
│   ├── chat.ts            # Interactive chat
│   └── collaborate.ts     # Multi-universe orchestration (future)
│
├── core/                   # Core engine
│   ├── Universe.ts        # Universe class
│   ├── Orchestrator.ts    # Multi-universe coordinator
│   ├── Corpus.ts          # Knowledge management
│   └── Memory.ts          # Conversation persistence
│
├── universes/             # User-created universes
│   ├── example-universe/
│   │   ├── config.yml     # Universe configuration
│   │   ├── system.md      # System prompt template
│   │   ├── corpus/        # Knowledge files
│   │   │   ├── philosophy.md
│   │   │   ├── aesthetics.md
│   │   │   └── examples.md
│   │   ├── memory/        # Conversation history
│   │   │   └── 2025-11-08.json
│   │   └── artifacts/     # Generated works
│   │       └── hymn-to-voltage.md
│   │
│   └── another-universe/
│       └── ...
│
├── templates/             # Starter templates
│   ├── poetic-philosopher/
│   ├── industrial-mystic/
│   ├── cybernetic-architect/
│   └── blank/
│
└── web/                   # Web interface (future)
    └── ...
```

## Core Components

### 1. Universe

The fundamental unit. A `Universe` consists of:

```typescript
interface Universe {
  id: string;
  name: string;
  config: UniverseConfig;
  corpus: Corpus;
  memory: Memory;

  // Core methods
  chat(message: string): Promise<string>;
  generateArtifact(prompt: string): Promise<Artifact>;
  addToCorpus(file: string): void;
  export(): UniverseExport;
}
```

**Key Design Decision**: Each universe is self-contained in its directory. No shared databases. Easy to backup, version control, and share.

### 2. Configuration (config.yml)

Defines the "physics" of the universe:

```yaml
name: "Industrial Mystic"
personality: "Ritual noise philosopher"
model: "claude-sonnet-4"

# Core rules/constraints
rules:
  - "Speak in ritual-poetic language"
  - "Sound as exorcism, chaos as renewal"
  - "Never use corporate or marketing tone"

# Style parameters
tone: "industrial, mystical, prophetic"
vocabulary: ["erosion", "ascension", "voltage", "membrane"]
forbidden_words: ["optimize", "leverage", "synergy"]

# Behavioral settings
verbosity: "high"
creativity: "maximum"
collaboration_enabled: true
```

### 3. System Prompt (system.md)

A markdown template that gets compiled into the system prompt:

```markdown
# You are {{ name }}

{{ personality }}

## Core Principles
{{ rules }}

## Knowledge Base
You have access to the following knowledge:
{{ corpus_summary }}

## Communication Style
- Tone: {{ tone }}
- Preferred vocabulary: {{ vocabulary }}
- Avoid: {{ forbidden_words }}

## Current Context
{{ recent_memory }}
```

**Why Markdown?** Human-readable, easy to edit, supports rich formatting, compatible with version control.

### 4. Corpus

The knowledge base of the universe. Stored as markdown files in `corpus/`:

```typescript
class Corpus {
  private files: Map<string, string>;

  // Retrieve relevant context for a query
  getRelevant(query: string, maxTokens: number): string[] {
    // V1: Simple keyword matching
    // V2: Semantic search via embeddings (optional)
  }

  // Add new knowledge
  add(filepath: string): void;

  // Get summary for system prompt
  getSummary(): string;
}
```

**V1 Implementation**: Simple keyword/fuzzy matching
**Future**: Optional embedding-based semantic search via MCP server

### 5. Memory

Conversation history and state:

```typescript
class Memory {
  private conversations: Conversation[];

  // Add a message to history
  add(role: 'user' | 'assistant', content: string): void;

  // Get recent context
  getRecent(maxTokens: number): Message[];

  // Save to disk
  persist(): void;

  // Create a "reflection" - universe summarizes its own evolution
  createReflection(): string;
}
```

**Stored as**: JSON files by date in `memory/`

## Claude API Integration

```typescript
class ClaudeAdapter {
  async chat(
    systemPrompt: string,
    messages: Message[],
    config: ModelConfig
  ): Promise<string> {
    // Direct Anthropic API call
    // No middleware, no vector stores, no LangChain
  }
}
```

**Why this is simple**:
- Single API call to Claude
- Context window handles everything
- No need for retrieval infrastructure
- Cost-effective (pay only for tokens used)

## Multi-Universe Collaboration (V2)

```typescript
class Orchestrator {
  private universes: Map<string, Universe>;

  async collaborate(
    universeIds: string[],
    prompt: string,
    strategy: 'sequential' | 'parallel' | 'dialogue'
  ): Promise<Artifact> {
    // Sequential: A → B → C (each builds on previous)
    // Parallel: A, B, C work independently, merged at end
    // Dialogue: A ↔ B conversation, orchestrator mediates
  }
}
```

**Example Flow** (Dialogue Strategy):
1. User: "Create a sonic installation about memory"
2. Orchestrator → Universe A: "Respond to this prompt from your perspective"
3. Universe A → Orchestrator: "Memory as voltage decaying through rusty circuits..."
4. Orchestrator → Universe B: "Here's Universe A's response. Respond with your architectural vision"
5. Universe B → Orchestrator: "I propose a grid structure, 8x8 meters..."
6. Orchestrator: Synthesizes into unified artifact

## Technology Choices

### V1 (MVP)
- **Language**: TypeScript/Node.js
- **CLI**: Commander.js
- **Config**: YAML (js-yaml)
- **API**: Direct Anthropic SDK
- **Storage**: Filesystem (JSON, Markdown)

**Why**: Minimal dependencies, easy to understand, runs anywhere Node runs

### V2 (Enhanced)
- **MCP Integration**: For multimodal (images, audio via MCP servers)
- **Web UI**: React + Next.js (deployable to Vercel)
- **Optional Embeddings**: Via MCP server for semantic search
- **Export/Share**: Package universes as portable zips

### Future Possibilities
- **Multimodal Corpus**: Images, audio files in corpus
- **Style Transfer**: Learn style from one universe, apply to another
- **Version Control**: Git-based universe versioning
- **Marketplace**: Share and discover universes
- **Real-time Collaboration**: Multiple users inhabiting same universe

## Design Decisions & Trade-offs

### ✅ What We Gain
- **Accessibility**: Anyone who can edit files can create a universe
- **Transparency**: Everything is readable, inspectable, debuggable
- **Portability**: Universes are just directories—easy to share
- **No Vendor Lock-in**: Works with any LLM provider (just swap adapter)
- **Cost-effective**: No training, no vector DB hosting fees

### ⚠️ What We Trade
- **Not True Fine-tuning**: Won't match deep style imprint of actual fine-tuning
- **Context Limits**: Bounded by model context window (though 200K is generous)
- **Retrieval**: V1 has basic keyword matching (semantic search is V2/optional)
- **Latency**: API calls slower than local model inference

### 🎯 Our Sweet Spot
We're optimizing for the 90% use case: **creative individuals who want personalized AI companions without becoming ML engineers**.

## Security & Privacy

- **Local-first**: All data stored on user's machine by default
- **No Telemetry**: We don't track usage or collect data
- **API Keys**: User provides their own Anthropic API key
- **Opt-in Cloud**: Web version (future) will be explicit opt-in

## Extensibility

The architecture supports plugins via:

1. **Custom Adapters**: Swap Claude for GPT-4, Llama, etc.
2. **MCP Servers**: Add capabilities (image gen, web search, etc.)
3. **Corpus Processors**: Custom logic for specific file types
4. **Export Formats**: Generate artifacts in any format

Example:
```typescript
// Custom adapter for OpenAI
class GPT4Adapter implements LLMAdapter {
  async chat(system: string, messages: Message[]): Promise<string> {
    // OpenAI API implementation
  }
}

// Use it
const universe = new Universe({
  ...config,
  adapter: new GPT4Adapter()
});
```

## Success Metrics

How do we know if this works?

1. **User Experience**: Can a non-technical person create a universe in < 10 minutes?
2. **Personality Consistency**: Does the universe maintain its character across conversations?
3. **Knowledge Fidelity**: Does it accurately reference its corpus?
4. **Collaboration Quality**: Do multi-universe dialogues produce coherent artifacts?

## Open Questions

1. **Corpus Size**: What's the practical limit before keyword search fails? Do we need semantic search in V1?
2. **Memory Management**: When does conversation history get too long? Auto-summarization?
3. **Cost**: What's the typical API cost per session? How do we optimize?
4. **Personality Drift**: Over long conversations, do universes lose their character? How to prevent?

---

**Next**: See `USER_JOURNEY.md` for detailed user flows and scenarios.
