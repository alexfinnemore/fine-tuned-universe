# How It Works - Technical Documentation

> For product designers, developers, and technical stakeholders

## Overview

Fine-Tuned Universe creates personalized AI systems by combining system prompt engineering, context management, and API orchestration—without requiring model fine-tuning or vector databases.

**Core Principle**: Instead of training models, we craft detailed system prompts that embed personality, rules, and knowledge directly into each conversation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
├──────────────────────┬──────────────────────────────────────┤
│   CLI (TypeScript)   │   Web App (Next.js 16 + React 19)   │
└──────────┬───────────┴──────────────┬───────────────────────┘
           │                          │
           │        ┌─────────────────▼────────────────────┐
           │        │    API Routes (Next.js /api/)        │
           │        │  - /api/universes                    │
           │        │  - /api/universes/[id]               │
           │        │  - /api/universes/[id]/theme         │
           │        │  - /api/chat                         │
           │        └─────────────────┬────────────────────┘
           │                          │
           └──────────────────────────▼─────────────────────┐
                                                             │
                        ┌────────────────────────────────────▼───┐
                        │    Core Engine (TypeScript/Node.js)    │
                        │                                        │
                        │  ┌──────────────┐  ┌──────────────┐  │
                        │  │ Config       │  │ Corpus       │  │
                        │  │ Loader       │  │ Loader       │  │
                        │  └──────┬───────┘  └───────┬──────┘  │
                        │         │                  │          │
                        │         └──────┬───────────┘          │
                        │                ▼                      │
                        │    ┌──────────────────────┐          │
                        │    │ System Prompt        │          │
                        │    │ Builder              │          │
                        │    └──────────┬───────────┘          │
                        │               ▼                      │
                        │    ┌──────────────────────┐          │
                        │    │ Claude Client        │          │
                        │    │ (Anthropic SDK)      │          │
                        │    └──────────┬───────────┘          │
                        └───────────────┼────────────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────┐
                        │  Anthropic API            │
                        │  (Claude Sonnet 4)        │
                        │  - Processes system prompt│
                        │  - Generates responses    │
                        │  - Returns token usage    │
                        └───────────────────────────┘
```

---

## Data Flow: User Message → AI Response

### Step 1: Universe Loading

**Location**: `dist/utils/config.js`, `dist/utils/corpus.js`

When a user selects a universe, the system loads:

```typescript
// 1. Load universe configuration
const config = loadUniverseConfig(universePath);
// Returns: { name, personality, model, rules, tone, creativity, vocabulary, forbidden_words }

// 2. Load corpus files
const corpus = loadCorpus(universePath);
// Returns: [{ path, content, tokens }]
```

**Config Structure** (`config.yml`):
```yaml
name: "Universe K"
personality: "Narrator of K's story—Kafkaesque loner..."
model: "claude-sonnet-4-20250514"
rules:
  - "Ground all speculative elements in real science"
  - "Maintain K's paranoid, introverted perspective"
tone: "philosophical, scientific, melancholic"
vocabulary: ["encryption", "spores", "mycelium"]
forbidden_words: ["optimize", "synergy"]
creativity: "very-high"    # Options: low, medium, high, very-high
output_length: "long"       # Options: short, medium, long
```

**Corpus Structure**:
```
universes/universe-k/
  corpus/
    mycelial-networks.md       # Knowledge file 1
    quantum-encryption.md      # Knowledge file 2
    prague-labyrinth.md        # Knowledge file 3
```

### Step 2: System Prompt Construction

**Location**: `dist/core/prompt.js`

The `buildSystemPrompt()` function transforms config + corpus into a comprehensive system prompt:

```typescript
export function buildSystemPrompt(config, corpus) {
  const corpusSummary = getCorpusSummary(corpus);  // List of files
  const corpusContent = getCorpusContent(corpus);  // Full content concatenated

  return `# You are ${config.name}

${config.personality}

## Core Principles

${config.rules.map(rule => `- ${rule}`).join('\n')}

## Knowledge Base

You have access to:
${corpusSummary}

${corpusContent}

## Communication Style

- Tone: ${config.tone}
- Preferred vocabulary: ${config.vocabulary.join(', ')}
- Avoid these words: ${config.forbidden_words.join(', ')}

## Creativity Level

${getCreativityInstruction(config.creativity)}

## Output Length

${getOutputLengthInstruction(config.output_length)}

Remember: You embody the personality, knowledge, and style defined above.`;
}
```

**Example Generated Prompt** (truncated):
```
# You are Universe K

Narrator of K's story—a Kafkaesque loner encoding messages through mycelial networks...

## Core Principles

- Ground all speculative elements in real science (mycelial networks, quantum cryptography)
- Maintain K's paranoid, introverted, solitary perspective
- Prague should feel labyrinthine, coded, haunted—everything is a sign

## Knowledge Base

You have access to:
3 knowledge files:
- mycelial-networks
- quantum-encryption
- prague-labyrinth

## mycelial-networks.md

[Full content of the corpus file embedded here...]

## quantum-encryption.md

[Full content of the corpus file embedded here...]

## Communication Style

- Tone: philosophical, scientific, melancholic, precise, labyrinthine
- Preferred vocabulary: encryption, spores, mycelium, quantum entanglement, cobblestones
- Avoid these words: optimize, synergy, leverage

## Creativity Level

Maximize creative freedom. Be bold, experimental, and imaginative while maintaining coherence.
```

### Step 3: LLM API Call

**Location**: `dist/core/claude.js`

The `ClaudeClient` class handles all communication with the Anthropic API:

```typescript
export class ClaudeClient {
  async chat(systemPrompt, messages) {
    // Make API call to Claude
    const response = await this.client.messages.create({
      model: this.model,              // "claude-sonnet-4-20250514"
      max_tokens: 8192,               // Maximum response length
      system: systemPrompt,           // Our crafted system prompt
      messages: messages.map(m => ({
        role: m.role,                 // 'user' or 'assistant'
        content: m.content,           // Message text
      })),
    });

    // Extract response and usage
    const responseText = response.content[0].text;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = this.calculateCost(inputTokens, outputTokens);

    return { response: responseText, inputTokens, outputTokens, cost };
  }

  calculateCost(inputTokens, outputTokens) {
    const INPUT_PRICE_PER_TOKEN = 0.003 / 1000;   // $3 per million
    const OUTPUT_PRICE_PER_TOKEN = 0.015 / 1000;  // $15 per million
    return inputTokens * INPUT_PRICE_PER_TOKEN + outputTokens * OUTPUT_PRICE_PER_TOKEN;
  }
}
```

**What Gets Sent to Claude**:
1. **System Prompt**: The entire crafted universe definition (personality + rules + corpus)
2. **Conversation History**: Array of user/assistant messages
3. **Model Configuration**: Which Claude model, max tokens, etc.

**What Comes Back**:
- Response text
- Token counts (input/output)
- Cost calculation

### Step 4: Response Handling

**CLI**: `dist/commands/chat.js`
- Displays response with formatting
- Saves conversation to `.history` directory
- Updates token/cost totals

**Web**: `web/app/api/chat/route.ts`
```typescript
export async function POST(request: Request) {
  const { universeId, messages } = await request.json();

  // Load universe
  const config = loadUniverseConfig(universePath);
  const corpus = loadCorpus(universePath);
  const systemPrompt = buildSystemPrompt(config, corpus);

  // Initialize Claude client
  const claude = new ClaudeClient(config.model);

  // Get response
  const result = await claude.chat(systemPrompt, messages);

  return NextResponse.json({
    response: result.response,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    cost: result.cost,
  });
}
```

---

## Knowledge Base System

### How Corpus Files Work

**No Vector Database Required**

Unlike RAG (Retrieval Augmented Generation) systems, we don't use:
- ❌ Vector embeddings
- ❌ Semantic search
- ❌ Chunking strategies
- ❌ Database queries

Instead, we use **context injection**:
- ✅ Load all corpus files at conversation start
- ✅ Embed full content in system prompt
- ✅ Let Claude's 200K token context window handle it
- ✅ Claude naturally references relevant knowledge

**Token Budget**:
- System prompt: ~5K-20K tokens (depending on corpus size)
- Conversation history: ~2K-10K tokens
- Response generation: up to 8K tokens
- Total: Comfortably within 200K context window

**Token Estimation**:
```typescript
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);  // Rough approximation: 1 token ≈ 4 chars
}
```

### Corpus File Format

All corpus files are plain Markdown:

```markdown
# Mycelial Networks

Mycelial networks are the underground communication systems of fungi...

## Key Properties

- Distributed information processing
- Chemical signaling
- Symbiotic relationships with tree roots

## Metaphors for Technology

The internet is often compared to mycelial networks...
```

**Why Markdown?**
- Human-readable and editable
- No preprocessing required
- Supports structure (headings, lists)
- Easy to version control
- Can be edited in the web UI

### Corpus Management

**CLI Commands**:
```bash
# Add corpus file
npm run add-corpus universe-k mycelial-networks

# List corpus files
npm run list-corpus universe-k

# View corpus content
npm run view-corpus universe-k mycelial-networks
```

**Web Interface** (`/universe/[id]`):
- Lists all corpus files with token counts
- Click to view/edit content
- Save changes back to filesystem
- Upload new corpus files

---

## Dynamic Theming System

**Location**: `web/app/api/universes/[id]/theme/route.ts`

Each universe gets a unique color theme based on its content:

```typescript
const AESTHETIC_THEMES = {
  kafka: {
    primary: '#6b7280',    // Gray
    accent: '#9ca3af',
    gradient: ['#111827', '#374151', '#1f2937'],
  },
  mycelial: {
    primary: '#059669',    // Green
    accent: '#34d399',
    gradient: ['#022c22', '#065f46', '#064e3b'],
  },
  quantum: {
    primary: '#3b82f6',    // Blue
    accent: '#60a5fa',
    gradient: ['#1e1b4b', '#1e40af', '#312e81'],
  },
  // ... more themes
};

function analyzeUniverseAesthetic(config, corpusFiles): string {
  const text = `${config.name} ${config.personality} ${corpusFiles.join(' ')}`.toLowerCase();

  if (text.includes('mycelium') || text.includes('fungal')) return 'mycelial';
  if (text.includes('quantum') || text.includes('encryption')) return 'quantum';
  if (text.includes('kafka') || text.includes('prague')) return 'kafka';

  return 'default';
}
```

**How It Works**:
1. Analyze universe name, personality, and corpus filenames
2. Match keywords to predefined aesthetics
3. Return color palette
4. Frontend applies dynamic styles using inline CSS

---

## Web Application Architecture

### Technology Stack

**Frontend**:
- Next.js 16 (App Router)
- React 19 (Client Components)
- Tailwind CSS v4
- TypeScript

**Backend**:
- Next.js API Routes
- Node.js filesystem operations
- Direct imports from compiled TypeScript (`dist/`)

### Route Structure

```
/                                  → Home page (universe list)
/universe/[id]                     → Universe detail page
  - Corpus viewer/editor
  - Image gallery
  - Configuration display
/universe/[id]/chat               → Chat interface
/api/universes                     → List all universes
/api/universes/[id]               → Get universe details
/api/universes/[id]/theme         → Get dynamic theme
/api/universes/[id]/corpus/[file] → Get/update corpus file
/api/universes/[id]/images        → List/upload images
/api/chat                          → Send message, get response
```

### Static vs Dynamic Routes

```typescript
// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';
```

Applied to:
- `/universe/[id]/page.tsx` - Depends on runtime universe data
- `/universe/[id]/chat/page.tsx` - Real-time chat interactions

**Why?** Universes can be created/modified at runtime. We can't pre-generate pages at build time.

### State Management

No Redux or global state. Uses React's built-in state:

```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const [totalTokens, setTotalTokens] = useState(0);
const [totalCost, setTotalCost] = useState(0);
```

**Conversation State** (in-memory only):
- Messages array stored in component state
- Cleared on page refresh
- No persistence (by design - privacy)

**Future Enhancement**: Optional conversation saving (Issue #8).

---

## File System Structure

```
fine-tuned-universe/
├── src/                      # Source TypeScript (compiled to dist/)
│   ├── commands/             # CLI commands
│   │   ├── chat.ts           # Chat command
│   │   ├── create.ts         # Universe creation
│   │   └── ...
│   ├── core/                 # Core engine
│   │   ├── claude.ts         # Claude API client
│   │   └── prompt.ts         # System prompt builder
│   └── utils/                # Utilities
│       ├── config.ts         # Config loader
│       └── corpus.ts         # Corpus loader
│
├── dist/                     # Compiled JavaScript (used by web + CLI)
│   └── [mirrors src/]
│
├── web/                      # Next.js web application
│   ├── app/
│   │   ├── page.tsx          # Home page
│   │   ├── universe/[id]/
│   │   │   ├── page.tsx      # Universe detail
│   │   │   └── chat/
│   │   │       └── page.tsx  # Chat interface
│   │   └── api/
│   │       ├── chat/route.ts
│   │       └── universes/
│   ├── dist/ → ../dist       # Copied during build
│   └── templates/ → ../templates  # Copied during build
│
├── templates/                # Bundled universe templates
│   └── universe-k/
│       ├── config.yml
│       └── corpus/
│           └── *.md
│
└── universes/                # User-created universes
    └── my-universe/
        ├── config.yml
        ├── corpus/
        └── images/
```

**Build Process**:
```bash
# CLI build
npm run build  # Compiles src/ → dist/

# Web build (in web/)
npm run build  # Runs: cp -r ../dist ./dist && cp -r ../templates ./templates && next build
```

**Why Copy Files?**
- Vercel deployment needs self-contained web/ directory
- Web app imports from local dist/ copy
- Keeps web app portable

---

## Token & Cost Tracking

### Token Calculation

**Input Tokens**:
- System prompt (personality + rules + corpus)
- All previous messages in conversation

**Output Tokens**:
- AI's response

**Pricing** (Claude Sonnet 4):
- Input: $3 per million tokens ($0.000003 per token)
- Output: $15 per million tokens ($0.000015 per token)

### Real-Time Cost Display

**CLI**:
```
💬 Universe K
────────────────────────────────
📊 Session: 1,245 tokens | $0.0156
💰 Total: 12,983 tokens | $0.1521
```

**Web UI**:
```
Header displays:
1,245 tokens
$0.0156
```

### Cost Estimation Formula

```typescript
function calculateCost(inputTokens: number, outputTokens: number): number {
  return inputTokens * 0.000003 + outputTokens * 0.000015;
}
```

**Example**:
- System prompt: 8,000 tokens
- User message: 50 tokens
- Previous context: 200 tokens
- **Input total**: 8,250 tokens × $0.000003 = $0.02475

- AI response: 500 tokens
- **Output total**: 500 tokens × $0.000015 = $0.0075

- **Total cost**: $0.03225 per message

**Typical Conversation**:
- 10 messages: ~$0.30
- 100 messages: ~$3.00
- Heavy monthly usage: $10-30

---

## Configuration Deep Dive

### Config Fields Explained

```yaml
# IDENTITY
name: "Universe K"                           # Display name
personality: "Narrator of K's story..."      # Core identity (1-2 sentences)

# MODEL
model: "claude-sonnet-4-20250514"           # Which Claude model to use

# BEHAVIOR RULES
rules:                                       # Strict behavioral guidelines
  - "Ground all speculative elements in real science"
  - "Maintain K's paranoid perspective"
  # Claude follows these as hard constraints

# STYLE
tone: "philosophical, scientific"            # Overall communication tone
vocabulary: ["encryption", "spores"]         # Encouraged words/phrases
forbidden_words: ["optimize", "synergy"]     # Words to avoid

# GENERATION PARAMETERS
creativity: "very-high"                      # low | medium | high | very-high
  # Translates to instructions about creative freedom

output_length: "long"                        # short | medium | long
  # Controls response verbosity (1-3 para vs 3-5 para vs detailed)

# FUTURE FEATURES
collaboration_enabled: false                 # Allow multi-universe collaboration (V2)
```

### How Fields Affect Behavior

**Creativity Levels**:
- `low`: "Be precise, literal, and factual. Avoid speculation."
- `medium`: "Balance factual accuracy with creative expression."
- `high`: "Embrace creative expression while staying grounded."
- `very-high`: "Maximize creative freedom. Be bold and experimental."

**Output Length**:
- `short`: "Keep responses concise and focused (1-3 paragraphs)."
- `medium`: "Provide balanced, thorough responses (3-5 paragraphs)."
- `long`: "Generate detailed, comprehensive output with extensive detail."

**Rules**:
- Embedded at top of system prompt
- Treated as hard constraints by Claude
- More specific rules = more consistent behavior

**Vocabulary/Forbidden Words**:
- Vocabulary: "Preferred vocabulary: encryption, spores, mycelium"
- Forbidden: "Avoid these words: optimize, synergy, leverage"
- Claude naturally incorporates/avoids without rigid enforcement

---

## Error Handling

### API Key Validation

```typescript
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable not set');
}
```

### Claude API Errors

```typescript
try {
  const response = await claude.chat(systemPrompt, messages);
} catch (error) {
  if (error.status === 401) {
    throw new Error('Invalid API key');
  } else if (error.status === 429) {
    throw new Error('Rate limit exceeded. Please wait and try again.');
  } else {
    throw new Error(`Claude API error: ${error.message}`);
  }
}
```

### File System Errors

```typescript
if (!existsSync(configPath)) {
  throw new Error(`Config file not found: ${configPath}`);
}
```

### Web UI Error Boundaries

Each page handles errors independently:
```typescript
const [error, setError] = useState<string | null>(null);

if (error) {
  return <ErrorDisplay message={error} />;
}
```

---

## Performance Considerations

### Context Window Management

**Current Approach**: Load everything
- System prompt: ~5K-20K tokens
- Conversation: grows over time
- Max context: 200K tokens (Claude's limit)

**Future Optimization** (if needed):
- Sliding window for conversation history
- Corpus summarization for large knowledge bases
- Smart truncation strategies

### API Latency

**Typical Response Time**:
- API call: 2-5 seconds
- Depends on: prompt size, response length, API load

**Optimization Strategies**:
- Streaming responses (future)
- Caching system prompts (future)
- Pre-loading universes

### Token Budget Allocation

**Recommended Limits**:
- System prompt: < 30K tokens (room for growth)
- Corpus: 5-10 markdown files × 2K tokens = 10-20K tokens
- Conversation: Keep last 20-30 messages
- Response: up to 8K tokens

**Total**: Comfortably under 100K tokens (50% of limit)

---

## Security & Privacy

### API Key Management

- Stored in `.env` file (never committed)
- Only read server-side (Node.js/Next.js API routes)
- Never exposed to browser

### Data Storage

**Local Files Only**:
- No database
- No telemetry
- No analytics
- All data stays on your machine

**What Gets Sent to Anthropic**:
- System prompt (your universe definition)
- Conversation messages
- Nothing else

### Future Enhancements

- Optional encrypted conversation storage
- Shareable universes (config + corpus only, no conversations)
- Hosted version with user authentication (opt-in)

---

## Deployment

### Local Development

```bash
# CLI
npm install
npm run build
npm run chat universe-k

# Web
cd web
npm install
npm run dev  # http://localhost:3000
```

### Vercel Deployment

**Configuration**:
- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables: `ANTHROPIC_API_KEY`

**Build Process**:
1. Copy `dist/` and `templates/` to `web/`
2. Run Next.js build
3. Generate static pages
4. Mark dynamic routes for server rendering

**Challenges Solved**:
- Moved build dependencies to `dependencies` (not `devDependencies`)
- Added `export const dynamic = 'force-dynamic'` to prevent static generation
- Fixed module resolution for TypeScript

---

## Future Architecture Plans

### V2 Features

**Multi-Universe Collaboration**:
```typescript
// Two universes chat with each other
const result = await collaborateUniverses(
  ['universe-k', 'industrial-mystic'],
  'Create a sonic installation about memory'
);
```

**Streaming Responses**:
```typescript
const stream = await claude.chatStream(systemPrompt, messages);
for await (const chunk of stream) {
  displayChunk(chunk);
}
```

**Conversation Persistence**:
```typescript
// Save conversations to filesystem
saveConversation(universeId, conversationId, messages);
loadConversation(universeId, conversationId);
```

### V3 Features

**Local Models Support**:
```typescript
// Use Ollama or LM Studio instead of Claude
const client = new LocalModelClient({
  provider: 'ollama',
  model: 'llama3-70b',
});
```

**Vector Search (Optional)**:
```typescript
// For large corpora, use semantic search
const relevantChunks = await searchCorpus(query, { limit: 5 });
```

**MCP Integration**:
```typescript
// Multimodal capabilities (images, audio)
const mcpServer = new MCPServer({
  tools: ['image-generation', 'audio-analysis'],
});
```

---

## Key Technical Decisions

### Why No Vector Database?

**Rationale**:
- Adds complexity (embeddings, chunking, search)
- Requires additional infrastructure
- Claude's 200K context is sufficient for most use cases
- Corpus files are small enough to load entirely

**When to reconsider**:
- Corpus > 50K tokens
- Need semantic search across thousands of documents
- Performance becomes an issue

### Why System Prompts Over Fine-Tuning?

**Advantages**:
- Instant updates (no retraining)
- No GPU required
- Easy to version and share
- Transparent and debuggable
- Works with any model

**Disadvantages**:
- Less deep style imprint
- Higher token costs (prompt sent every time)
- Can't learn from interactions (no training loop)

**Verdict**: System prompts cover 90% of use cases without complexity.

### Why Markdown for Corpus?

**Advantages**:
- Human-readable
- Easy to edit (VS Code, web UI, any text editor)
- Version control friendly (git diffs)
- Structure (headings, lists) without parsing
- Universally supported

**Disadvantages**:
- No schema enforcement
- No querying capabilities
- Limited metadata

**Verdict**: Simplicity wins. Power users can upgrade to structured data later.

---

## Debugging & Observability

### Token Usage Tracking

Every API call returns:
```typescript
{
  response: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
}
```

Displayed in real-time in CLI and web UI.

### System Prompt Inspection

To see exactly what's sent to Claude:

```typescript
// In chat.ts or route.ts
console.log('System Prompt:', systemPrompt);
console.log('Messages:', messages);
```

### Error Logging

All errors logged to console:
```typescript
console.error('Chat API error:', error);
```

Future: Structured logging with Winston or Pino.

---

## Contributing Areas

**For Developers**:
- New universe templates
- Additional CLI commands
- Web UI improvements
- API optimizations

**For Designers**:
- More aesthetic themes
- UI/UX enhancements
- Accessibility improvements

**For Writers**:
- Example corpus files
- Universe templates
- Documentation

---

## Glossary

- **Universe**: A personalized AI system with identity, knowledge, and style
- **Corpus**: Collection of markdown files forming the knowledge base
- **System Prompt**: Comprehensive instruction text sent to Claude with every message
- **Config**: YAML file defining universe personality, rules, and parameters
- **Template**: Pre-built universe that can be cloned and customized
- **Creativity**: Parameter controlling how experimental vs. precise the AI should be
- **Tokens**: Units of text processed by the AI (≈4 characters = 1 token)
- **Context Window**: Maximum tokens Claude can process at once (200K)

---

**Questions?** Open an issue or check the main README.
