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

## Linear User Journey Workflows

This section shows **exactly** what happens, step by step, for common user actions. Each workflow shows the precise sequence of function calls, data transformations, and API interactions.

### Journey 1: Chatting with a Universe (CLI)

**User Action**: `npm run chat universe-k` then types "What is consciousness?"

#### Step-by-Step Execution:

**1. Command Invocation** (`package.json` → `dist/commands/chat.js`)
```bash
npm run chat universe-k
# Executes: node dist/index.js chat universe-k
```

**2. CLI Entry Point** (`dist/index.js`)
```typescript
// Parse command line arguments
const program = new Command();
program
  .command('chat <universe>')
  .action((universe) => {
    chatCommand(universe);  // Call chat handler
  });
```

**3. Chat Command Handler** (`dist/commands/chat.js`)
```typescript
export async function chatCommand(universeId: string) {
  // Step 3a: Locate universe directory
  const templatePath = join(process.cwd(), 'templates', universeId);
  const userPath = join(process.cwd(), 'universes', universeId);

  let universePath: string;
  if (existsSync(userPath)) {
    universePath = userPath;  // User universe takes priority
  } else if (existsSync(templatePath)) {
    universePath = templatePath;  // Fall back to template
  } else {
    throw new Error('Universe not found');
  }

  // Step 3b: Load configuration
  const config = loadUniverseConfig(universePath);
  // config = { name: "Universe K", personality: "...", model: "...", rules: [...] }

  // Step 3c: Load corpus files
  const corpus = loadCorpus(universePath);
  // corpus = [
  //   { path: "mycelial-networks.md", content: "...", tokens: 1234 },
  //   { path: "quantum-encryption.md", content: "...", tokens: 2345 }
  // ]

  // Step 3d: Build system prompt
  const systemPrompt = buildSystemPrompt(config, corpus);
  // systemPrompt = "# You are Universe K\n\n[full personality + rules + corpus]"

  // Step 3e: Initialize Claude client
  const claude = new ClaudeClient(config.model);
  // Creates Anthropic SDK client with API key from process.env.ANTHROPIC_API_KEY

  // Step 3f: Load conversation history (if exists)
  const historyPath = join(universePath, '.history', 'latest.json');
  let messages = [];
  if (existsSync(historyPath)) {
    messages = JSON.parse(readFileSync(historyPath, 'utf-8'));
    // messages = [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
  }

  // Step 3g: Display welcome screen
  console.log(`💬 ${config.name}`);
  console.log(`────────────────────────────────`);

  // Step 3h: Start interactive prompt loop
  startChatLoop();
}
```

**4. User Types Message** (Interactive prompt via readline)
```typescript
async function startChatLoop() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  while (true) {
    // Step 4a: Get user input
    const userInput = await rl.question('You: ');
    // userInput = "What is consciousness?"

    if (userInput.trim() === '') continue;

    // Step 4b: Add user message to conversation
    messages.push({ role: 'user', content: userInput });
    // messages = [{ role: 'user', content: 'What is consciousness?' }]

    // Proceed to Claude API call...
  }
}
```

**5. Call Claude API** (`dist/core/claude.js`)
```typescript
// Step 5a: Prepare API request
const response = await claude.chat(systemPrompt, messages);

// Inside ClaudeClient.chat():
async chat(systemPrompt: string, messages: Message[]) {
  // Step 5b: Make HTTP request to Anthropic
  const response = await this.client.messages.create({
    model: this.model,              // "claude-sonnet-4-20250514"
    max_tokens: 8192,
    system: systemPrompt,           // Full universe definition (~10K tokens)
    messages: messages.map(m => ({
      role: m.role,                 // 'user'
      content: m.content,           // 'What is consciousness?'
    })),
  });

  // Step 5c: Extract response data
  const responseText = response.content[0].text;
  // responseText = "Consciousness is [lengthy philosophical response]..."

  const inputTokens = response.usage.input_tokens;    // e.g., 10,245
  const outputTokens = response.usage.output_tokens;  // e.g., 543

  // Step 5d: Calculate cost
  const cost = this.calculateCost(inputTokens, outputTokens);
  // cost = 10245 * 0.000003 + 543 * 0.000015 = $0.03885

  // Step 5e: Return result
  return {
    response: responseText,
    inputTokens,
    outputTokens,
    cost,
  };
}
```

**6. Display Response and Update State**
```typescript
// Step 6a: Add assistant message to conversation
messages.push({ role: 'assistant', content: response.response });

// Step 6b: Display to user
console.log(`\n${config.name}: ${response.response}\n`);

// Step 6c: Update token tracking
totalInputTokens += response.inputTokens;
totalOutputTokens += response.outputTokens;
totalCost += response.cost;

// Step 6d: Display stats
console.log(`📊 This message: ${response.inputTokens + response.outputTokens} tokens | $${response.cost.toFixed(4)}`);
console.log(`💰 Session total: ${totalInputTokens + totalOutputTokens} tokens | $${totalCost.toFixed(4)}`);

// Step 6e: Save conversation history to disk
const historyPath = join(universePath, '.history', 'latest.json');
writeFileSync(historyPath, JSON.stringify(messages, null, 2));

// Step 6f: Return to prompt for next message
// (Loop continues until user types 'exit')
```

**Complete Flow Summary**:
```
User types command
  ↓
Locate universe directory (templates/ or universes/)
  ↓
Load config.yml → Parse YAML → Validate fields
  ↓
Load corpus/*.md → Read all .md files → Estimate tokens
  ↓
Build system prompt → Combine config + corpus → Generate text
  ↓
Initialize Claude client → Load API key from .env
  ↓
Load conversation history (if exists) → Read .history/latest.json
  ↓
Display welcome screen
  ↓
Start interactive loop:
  ↓
  User types message
    ↓
  Add to messages array
    ↓
  Call Claude API:
    - Send system prompt (full universe definition)
    - Send messages array (conversation history)
    - Receive response + token counts
    ↓
  Display response
    ↓
  Update token/cost totals
    ↓
  Save conversation history to .history/
    ↓
  Repeat loop
```

---

### Journey 2: Chatting with a Universe (Web)

**User Action**: Opens http://localhost:3000, clicks "Universe K", navigates to chat, types "What is consciousness?"

#### Step-by-Step Execution:

**1. Home Page Load** (`web/app/page.tsx`)
```typescript
// Step 1a: Component mounts
useEffect(() => {
  fetchUniverses();
}, []);

// Step 1b: Fetch universes from API
async function fetchUniverses() {
  const res = await fetch('/api/universes');
  const data = await res.json();
  setUniverses(data.universes);
}
```

**2. API: List Universes** (`web/app/api/universes/route.ts`)
```typescript
export async function GET() {
  // Step 2a: Scan template directories
  const templatesDir = join(process.cwd(), 'templates');
  const templateDirs = readdirSync(templatesDir);

  // Step 2b: Scan user universe directories
  const universesDir = join(process.cwd(), 'universes');
  const userDirs = existsSync(universesDir) ? readdirSync(universesDir) : [];

  // Step 2c: Load each universe config
  const universes = [];
  for (const dir of [...templateDirs, ...userDirs]) {
    const config = loadUniverseConfig(join(templatesDir, dir));
    const corpus = loadCorpus(join(templatesDir, dir));

    universes.push({
      id: dir,
      name: config.name,
      personality: config.personality,
      corpusCount: corpus.length,
      model: config.model,
      type: templateDirs.includes(dir) ? 'template' : 'user',
    });
  }

  // Step 2d: Return JSON
  return NextResponse.json({ universes });
}
```

**3. User Clicks "Universe K"**
```typescript
// Step 3a: Next.js navigation
<Link href={`/universe/${universe.id}`}>
  {/* User clicks this */}
</Link>

// Step 3b: Navigate to /universe/universe-k
// Loads web/app/universe/[id]/page.tsx
```

**4. Universe Detail Page Load** (`web/app/universe/[id]/page.tsx`)
```typescript
// Step 4a: Component mounts
useEffect(() => {
  fetchUniverseData();
}, []);

// Step 4b: Fetch universe details
async function fetchUniverseData() {
  // Fetch config and corpus info
  const res = await fetch(`/api/universes/${params.id}`);
  const data = await res.json();
  setUniverse(data);

  // Fetch theme colors
  const themeRes = await fetch(`/api/universes/${params.id}/theme`);
  const themeData = await themeRes.json();
  setTheme(themeData.theme);
}
```

**5. User Clicks "Chat" Button**
```typescript
// Step 5a: Navigate to chat page
<Link href={`/universe/${params.id}/chat`}>
  💬 Start Chatting
</Link>

// Step 5b: Loads web/app/universe/[id]/chat/page.tsx
```

**6. Chat Page Load** (`web/app/universe/[id]/chat/page.tsx`)
```typescript
// Step 6a: Initialize state
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [totalTokens, setTotalTokens] = useState(0);
const [totalCost, setTotalCost] = useState(0);

// Step 6b: Fetch universe info for display
useEffect(() => {
  async function fetchData() {
    const res = await fetch(`/api/universes/${params.id}`);
    const data = await res.json();
    setUniverse(data);

    const themeRes = await fetch(`/api/universes/${params.id}/theme`);
    const themeData = await themeRes.json();
    setTheme(themeData.theme);
  }
  fetchData();
}, [params.id]);

// Step 6c: Display empty chat interface
// User sees: "Start a conversation" placeholder
```

**7. User Types Message** (Client-side input handling)
```typescript
// Step 7a: User types in textarea
<textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyPress={handleKeyPress}
/>

// Step 7b: User presses Enter
function handleKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();  // Trigger send
  }
}
```

**8. Send Message to API** (Client-side)
```typescript
async function sendMessage() {
  // Step 8a: Validate input
  if (!input.trim() || loading) return;

  // Step 8b: Create user message object
  const userMessage = { role: 'user', content: input };
  // userMessage = { role: 'user', content: 'What is consciousness?' }

  // Step 8c: Update UI immediately (optimistic update)
  const newMessages = [...messages, userMessage];
  setMessages(newMessages);
  setInput('');  // Clear input field
  setLoading(true);  // Show loading indicator

  // Step 8d: Make API request
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      universeId: params.id,  // "universe-k"
      messages: newMessages,   // [{ role: 'user', content: '...' }]
    }),
  });

  // Continue to API handler...
}
```

**9. API: Process Chat Request** (`web/app/api/chat/route.ts`)
```typescript
export async function POST(request: Request) {
  // Step 9a: Parse request body
  const { universeId, messages } = await request.json();
  // universeId = "universe-k"
  // messages = [{ role: 'user', content: 'What is consciousness?' }]

  // Step 9b: Validate input
  if (!universeId || !messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Step 9c: Locate universe directory
  const templatePath = join(process.cwd(), 'templates', universeId);
  const userPath = join(process.cwd(), 'universes', universeId);

  let universePath;
  if (existsSync(userPath)) {
    universePath = userPath;
  } else if (existsSync(templatePath)) {
    universePath = templatePath;
  } else {
    return NextResponse.json({ error: 'Universe not found' }, { status: 404 });
  }

  // Step 9d: Load universe (same as CLI)
  const config = loadUniverseConfig(universePath);
  const corpus = loadCorpus(universePath);
  const systemPrompt = buildSystemPrompt(config, corpus);

  // Step 9e: Initialize Claude client
  const claude = new ClaudeClient(config.model);

  // Step 9f: Call Claude API
  const result = await claude.chat(systemPrompt, messages);
  // result = { response: "...", inputTokens: 10245, outputTokens: 543, cost: 0.03885 }

  // Step 9g: Return response as JSON
  return NextResponse.json({
    response: result.response,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    cost: result.cost,
  });
}
```

**10. Handle API Response** (Client-side)
```typescript
// Step 10a: Receive response
const data = await res.json();
// data = { response: "Consciousness is...", inputTokens: 10245, outputTokens: 543, cost: 0.03885 }

// Step 10b: Add assistant message to state
setMessages([
  ...newMessages,
  { role: 'assistant', content: data.response }
]);

// Step 10c: Update token/cost tracking
setTotalTokens(prev => prev + data.inputTokens + data.outputTokens);
setTotalCost(prev => prev + data.cost);

// Step 10d: Hide loading indicator
setLoading(false);

// Step 10e: Auto-scroll to bottom
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
```

**11. UI Updates** (React re-render)
```typescript
// Step 11a: Messages array updated → UI re-renders
{messages.map((msg, i) => (
  <div key={i} className={msg.role === 'user' ? 'justify-end' : 'justify-start'}>
    <div className="message-bubble">
      {msg.content}
    </div>
  </div>
))}

// Step 11b: Token/cost display updated
<div className="text-sm">
  {totalTokens.toLocaleString()} tokens
</div>
<div className="text-xs">
  ${totalCost.toFixed(4)}
</div>

// Step 11c: User can send next message
// (Loading state cleared, input field re-enabled)
```

**Complete Flow Summary**:
```
User opens browser → http://localhost:3000
  ↓
Home page loads → useEffect triggers
  ↓
Fetch /api/universes → GET request
  ↓
API scans templates/ and universes/ directories
  ↓
Load each config.yml → Return universe list
  ↓
Display universe cards on home page
  ↓
User clicks "Universe K"
  ↓
Navigate to /universe/universe-k
  ↓
Detail page loads → Fetch universe data + theme
  ↓
Display corpus files, images, config
  ↓
User clicks "Chat" button
  ↓
Navigate to /universe/universe-k/chat
  ↓
Chat page loads → Fetch universe info for header
  ↓
Display empty chat interface
  ↓
User types message → Update input state
  ↓
User presses Enter → sendMessage()
  ↓
Optimistic UI update (add user message immediately)
  ↓
POST to /api/chat with universeId + messages
  ↓
API locates universe directory
  ↓
Load config → Load corpus → Build system prompt
  ↓
Initialize Claude client → Load API key
  ↓
Call Claude API:
  - Send system prompt (full universe)
  - Send messages array
  - Wait for response
  ↓
API returns JSON: { response, inputTokens, outputTokens, cost }
  ↓
Client receives response
  ↓
Update messages state (add assistant message)
  ↓
Update token/cost totals
  ↓
React re-renders → Display new message
  ↓
Auto-scroll to bottom
  ↓
Clear loading state
  ↓
User can send next message
```

---

### Journey 3: Creating a New Universe (CLI)

**User Action**: `npm run create-universe my-universe`

#### Step-by-Step Execution:

**1. Command Invocation**
```bash
npm run create-universe my-universe
# Executes: node dist/index.js create my-universe
```

**2. Create Command Handler** (`dist/commands/create.js`)
```typescript
export async function createCommand(universeId: string) {
  // Step 2a: Validate universe ID
  if (!universeId || universeId.trim() === '') {
    throw new Error('Universe ID is required');
  }

  // Step 2b: Check if universe already exists
  const universePath = join(process.cwd(), 'universes', universeId);
  if (existsSync(universePath)) {
    throw new Error(`Universe "${universeId}" already exists`);
  }

  // Step 2c: Create directory structure
  mkdirSync(universePath, { recursive: true });
  mkdirSync(join(universePath, 'corpus'));
  mkdirSync(join(universePath, 'images'));
  mkdirSync(join(universePath, '.history'));

  // Step 2d: Prompt user for configuration
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('Creating new universe...\n');

  const name = await rl.question('Name: ');
  const personality = await rl.question('Personality (1-2 sentences): ');
  const tone = await rl.question('Tone (e.g., philosophical, scientific): ');
  const creativity = await rl.question('Creativity (low/medium/high/very-high): ');

  // Step 2e: Create default config
  const config = {
    name: name || universeId,
    personality: personality || 'A helpful AI assistant',
    model: 'claude-sonnet-4-20250514',
    rules: [
      'Be helpful and informative',
      'Maintain a consistent personality',
    ],
    tone: tone || 'conversational',
    creativity: creativity || 'medium',
    output_length: 'medium',
    collaboration_enabled: false,
  };

  // Step 2f: Write config.yml
  const configYaml = yaml.dump(config);
  writeFileSync(join(universePath, 'config.yml'), configYaml);

  // Step 2g: Create starter corpus file
  const starterCorpus = `# Getting Started

This is your universe's knowledge base. Add more files to expand what your universe knows about.

## Example Topics

- Background information
- Style references
- Domain knowledge
- Creative influences
`;

  writeFileSync(join(universePath, 'corpus', 'getting-started.md'), starterCorpus);

  // Step 2h: Display success message
  console.log(`\n✅ Universe "${universeId}" created successfully!`);
  console.log(`\nLocation: universes/${universeId}/`);
  console.log('\nNext steps:');
  console.log(`1. Edit universes/${universeId}/config.yml`);
  console.log(`2. Add corpus files to universes/${universeId}/corpus/`);
  console.log(`3. Start chatting: npm run chat ${universeId}`);
}
```

**Complete Flow**:
```
User runs command
  ↓
Validate universe ID (not empty, not exists)
  ↓
Create directory structure:
  universes/my-universe/
    corpus/
    images/
    .history/
  ↓
Interactive prompts:
  - Name?
  - Personality?
  - Tone?
  - Creativity?
  ↓
Build config object with defaults
  ↓
Write config.yml (YAML format)
  ↓
Create starter corpus file (getting-started.md)
  ↓
Display success message with next steps
```

---

### Journey 4: Editing Corpus Files (Web)

**User Action**: Opens /universe/universe-k, clicks "mycelial-networks.md", edits content, saves

#### Step-by-Step Execution:

**1. User Views Corpus File List** (`web/app/universe/[id]/page.tsx`)
```typescript
// Step 1a: Universe detail page displays corpus files
{universe.corpusFiles.map((file) => (
  <button onClick={() => viewCorpusFile(file.name)}>
    📄 {file.name}
    <span className="text-xs">{file.tokens} tokens</span>
  </button>
))}
```

**2. User Clicks Corpus File**
```typescript
// Step 2a: Click handler
function viewCorpusFile(filename: string) {
  setSelectedCorpus(filename);  // Update state
  fetchCorpusContent(filename);  // Load content
}

// Step 2b: Fetch corpus content
async function fetchCorpusContent(filename: string) {
  const res = await fetch(`/api/universes/${params.id}/corpus/${filename}`);
  const data = await res.json();

  setCorpusContent(data.content);  // Store content
  setEditingCorpus(false);          // View mode (not edit)
}
```

**3. API: Get Corpus File** (`web/app/api/universes/[id]/corpus/[filename]/route.ts`)
```typescript
export async function GET(request: Request, { params }: { params: { id: string, filename: string } }) {
  // Step 3a: Resolve params
  const { id, filename } = await params;

  // Step 3b: Locate universe
  const universePath = locateUniverse(id);

  // Step 3c: Build file path
  const filePath = join(universePath, 'corpus', `${filename}.md`);

  // Step 3d: Check if file exists
  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Step 3e: Read file content
  const content = readFileSync(filePath, 'utf-8');

  // Step 3f: Estimate tokens
  const tokens = estimateTokens(content);

  // Step 3g: Return JSON
  return NextResponse.json({
    filename,
    content,
    tokens,
  });
}
```

**4. Display Corpus Content** (Client-side)
```typescript
// Step 4a: Modal/panel opens showing content
{selectedCorpus && (
  <div className="corpus-viewer">
    <h3>📄 {selectedCorpus}</h3>

    {editingCorpus ? (
      // Edit mode: textarea
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
      />
    ) : (
      // View mode: formatted markdown
      <pre className="whitespace-pre-wrap">{corpusContent}</pre>
    )}

    {!editingCorpus && (
      <button onClick={() => startEditingCorpus()}>
        ✏️ Edit
      </button>
    )}
  </div>
)}
```

**5. User Clicks "Edit"**
```typescript
function startEditingCorpus() {
  setEditedContent(corpusContent);  // Copy current content to edit buffer
  setEditingCorpus(true);            // Switch to edit mode
}

// Step 5b: UI switches to textarea
// User can now modify content
```

**6. User Edits Content and Clicks "Save"**
```typescript
async function saveCorpusFile() {
  // Step 6a: Validate content
  if (!editedContent.trim()) {
    alert('Content cannot be empty');
    return;
  }

  setSaving(true);  // Show loading state

  // Step 6b: Send PUT request
  const res = await fetch(`/api/universes/${params.id}/corpus/${selectedCorpus}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: editedContent,
    }),
  });

  if (!res.ok) {
    alert('Failed to save');
    setSaving(false);
    return;
  }

  // Step 6c: Update local state
  setCorpusContent(editedContent);  // Update view with new content
  setEditingCorpus(false);           // Exit edit mode
  setSaving(false);

  // Step 6d: Refresh corpus list (to update token counts)
  fetchUniverseData();
}
```

**7. API: Save Corpus File** (`web/app/api/universes/[id]/corpus/[filename]/route.ts`)
```typescript
export async function PUT(request: Request, { params }: { params: { id: string, filename: string } }) {
  // Step 7a: Parse request
  const { id, filename } = await params;
  const { content } = await request.json();

  // Step 7b: Validate content
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }

  // Step 7c: Locate universe
  const universePath = locateUniverse(id);

  // Step 7d: Build file path
  const filePath = join(universePath, 'corpus', `${filename}.md`);

  // Step 7e: Write to disk
  writeFileSync(filePath, content, 'utf-8');

  // Step 7f: Re-calculate tokens
  const tokens = estimateTokens(content);

  // Step 7g: Return success
  return NextResponse.json({
    success: true,
    tokens,
  });
}
```

**8. UI Updates**
```typescript
// Step 8a: Exit edit mode → Show view mode
// Step 8b: Display success indicator
// Step 8c: Updated token count displayed in corpus list
```

**Complete Flow**:
```
User on universe detail page
  ↓
Corpus files listed with token counts
  ↓
User clicks "mycelial-networks.md"
  ↓
Click handler: setSelectedCorpus()
  ↓
Fetch /api/universes/universe-k/corpus/mycelial-networks → GET
  ↓
API: Locate universe → Read corpus/mycelial-networks.md → Return content
  ↓
Client: Display in modal/panel (view mode)
  ↓
User clicks "Edit" button
  ↓
Copy content to edit buffer → Switch to textarea
  ↓
User modifies content
  ↓
User clicks "Save"
  ↓
Validate content → Show loading state
  ↓
PUT /api/universes/universe-k/corpus/mycelial-networks
  ↓
API: Validate → Locate universe → Write to disk → Calculate tokens
  ↓
Return success
  ↓
Client: Update local state → Exit edit mode → Refresh list
  ↓
UI shows updated content and token count
```

---

### Journey 5: Getting Dynamic Theme (Web)

**User Action**: Opens /universe/universe-k → Page displays with custom purple/gray theme

#### Step-by-Step Execution:

**1. Universe Detail Page Mounts** (`web/app/universe/[id]/page.tsx`)
```typescript
useEffect(() => {
  async function fetchData() {
    // Step 1a: Fetch universe details
    const res = await fetch(`/api/universes/${params.id}`);
    const data = await res.json();
    setUniverse(data);

    // Step 1b: Fetch theme colors
    const themeRes = await fetch(`/api/universes/${params.id}/theme`);
    const themeData = await themeRes.json();
    setTheme(themeData.theme);
    // theme = { primary: '#6b7280', accent: '#9ca3af', gradient: [...] }
  }
  fetchData();
}, [params.id]);
```

**2. API: Generate Theme** (`web/app/api/universes/[id]/theme/route.ts`)
```typescript
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Step 2a: Resolve universe ID
  const { id } = await params;

  // Step 2b: Locate universe
  const universePath = locateUniverse(id);

  // Step 2c: Load config
  const configPath = join(universePath, 'config.yml');
  const config = yaml.load(readFileSync(configPath, 'utf-8'));

  // Step 2d: Get corpus file names
  const corpusDir = join(universePath, 'corpus');
  const corpusFiles = existsSync(corpusDir)
    ? readdirSync(corpusDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''))
    : [];
  // corpusFiles = ['mycelial-networks', 'quantum-encryption', 'prague-labyrinth']

  // Step 2e: Analyze aesthetic
  const aesthetic = analyzeUniverseAesthetic(config, corpusFiles);

  // Inside analyzeUniverseAesthetic():
  function analyzeUniverseAesthetic(config, corpusFiles) {
    // Step 2e-1: Combine all text
    const text = `${config.name} ${config.personality} ${config.tone} ${corpusFiles.join(' ')}`.toLowerCase();
    // text = "universe k narrator of k's story—kafkaesque... philosophical scientific melancholic mycelial-networks quantum-encryption prague-labyrinth"

    // Step 2e-2: Keyword matching
    if (text.includes('mycelium') || text.includes('fungal') || text.includes('spore')) {
      return 'mycelial';  // Green theme
    }
    if (text.includes('quantum') || text.includes('encryption') || text.includes('cryptograph')) {
      return 'quantum';   // Blue theme
    }
    if (text.includes('kafka') || text.includes('prague') || text.includes('labyrinth')) {
      return 'kafka';     // Gray theme ← MATCHES!
    }
    // ... more checks

    return 'default';     // Purple theme (fallback)
  }

  // Step 2f: Get theme colors
  const theme = AESTHETIC_THEMES[aesthetic];
  // aesthetic = 'kafka'
  // theme = {
  //   primary: '#6b7280',
  //   secondary: '#4b5563',
  //   accent: '#9ca3af',
  //   background: '#1f2937',
  //   text: '#d1d5db',
  //   gradient: ['#111827', '#374151', '#1f2937']
  // }

  // Step 2g: Return JSON
  return NextResponse.json({
    aesthetic,
    theme,
    config: {
      name: config.name,
      personality: config.personality,
      tone: config.tone,
    },
  });
}
```

**3. Apply Theme to UI** (Client-side)
```typescript
// Step 3a: Theme state updated → Trigger re-render

// Step 3b: Calculate dynamic styles
const bgGradient = theme
  ? `linear-gradient(to bottom right, ${theme.gradient[0]}, ${theme.gradient[1]}, ${theme.gradient[2]})`
  : 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)';
// bgGradient = "linear-gradient(to bottom right, #111827, #374151, #1f2937)"

const primaryColor = theme?.primary || '#8b5cf6';
// primaryColor = '#6b7280'

const accentColor = theme?.accent || '#a78bfa';
// accentColor = '#9ca3af'

const textColor = theme?.text || '#e9d5ff';
// textColor = '#d1d5db'

// Step 3c: Apply inline styles
<div style={{ background: bgGradient }}>
  <h1 style={{ color: textColor }}>
    {universe.name}
  </h1>

  <button style={{ backgroundColor: primaryColor }}>
    💬 Chat
  </button>

  <div style={{ borderColor: `${primaryColor}30` }}>
    Corpus files
  </div>
</div>
```

**Complete Flow**:
```
User navigates to /universe/universe-k
  ↓
Page component mounts → useEffect triggers
  ↓
Fetch /api/universes/universe-k/theme → GET
  ↓
API: Load config.yml
  ↓
Get corpus file names
  ↓
Analyze aesthetic:
  - Combine name + personality + tone + corpus filenames
  - Check for keywords ('kafka', 'prague', 'labyrinth')
  - Match to 'kafka' aesthetic
  ↓
Look up theme colors for 'kafka':
  - primary: '#6b7280' (gray)
  - accent: '#9ca3af' (light gray)
  - gradient: ['#111827', '#374151', '#1f2937'] (dark grays)
  ↓
Return JSON: { aesthetic: 'kafka', theme: {...} }
  ↓
Client receives theme data
  ↓
Update theme state → Trigger re-render
  ↓
Calculate dynamic styles:
  - Background gradient
  - Button colors
  - Text colors
  - Border colors
  ↓
Apply inline styles to components
  ↓
Page displays with custom gray theme
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
