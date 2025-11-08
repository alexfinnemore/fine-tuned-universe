# Development Plan

## Overview

This document outlines the phased development approach for Fine-Tuned Universe, focusing on user needs and iterative delivery.

## Guiding Principles

1. **User Journey First** - Every feature must serve a clear user need
2. **Simplicity > Complexity** - Always choose the simpler solution
3. **Working Software > Perfect Architecture** - Ship iteratively
4. **Local-First** - No required cloud dependencies for core features
5. **Zero Lock-In** - Users own their data, can export everything

## Milestones

### Milestone 1: MVP (V1) - "Single Universe Creator"
**Goal**: A non-technical user can create and chat with their own personalized universe
**Timeline**: 2-3 weeks
**User Story**: "As a creative writer, I want to create an AI companion that speaks in my voice and knows my work"

### Milestone 2: Enhanced (V2) - "Collaborative Universes"
**Goal**: Multiple universes can collaborate and generate artifacts
**Timeline**: 4-6 weeks after V1
**User Story**: "As an artist, I want two distinct AI personas to collaborate on a creative project"

### Milestone 3: Platform (V3) - "Universe Ecosystem"
**Goal**: Web UI, sharing, discovery, multimodal capabilities
**Timeline**: TBD
**User Story**: "As a user, I want to share my universe and discover others"

---

## V1 MVP - Detailed Breakdown

### Core User Flow
```
User → Install → Create Universe → Add Corpus → Configure → Chat → Iterate
```

### Features (In Priority Order)

#### 1. Project Foundation & CLI Setup
**Why**: Users need a working tool to build on
**Tasks**:
- [x] Initialize TypeScript/Node project
- [ ] Set up CLI framework (Commander.js)
- [ ] Environment configuration (.env for API keys)
- [ ] Basic error handling and logging
- [ ] README with installation instructions

**Acceptance Criteria**:
- `npm install` works without errors
- `npm run --help` shows available commands
- API key can be configured via .env

---

#### 2. Universe Creation Command
**Why**: First step in user journey - must be smooth
**Tasks**:
- [ ] `create-universe [name]` command
- [ ] Interactive prompts for configuration
- [ ] Create directory structure (`universes/[name]/`)
- [ ] Template system (blank, poetic-philosopher, industrial-mystic, etc.)
- [ ] Generate initial config.yml
- [ ] Create empty corpus/ and memory/ directories

**Acceptance Criteria**:
- User runs `npm run create-universe my-universe`
- Prompted for: name, personality, template
- Directory created with all necessary files
- Success message with next steps

**Example Output**:
```
✓ Created universe: my-universe
✓ Template: poetic-philosopher
✓ Next steps:
  1. Add your texts to: universes/my-universe/corpus/
  2. Edit config: universes/my-universe/config.yml
  3. Start chatting: npm run chat my-universe
```

---

#### 3. Configuration System
**Why**: This defines the "physics" of each universe
**Tasks**:
- [ ] YAML parser for config.yml
- [ ] Configuration schema validation
- [ ] Default values and sensible defaults
- [ ] Config editor helper (optional)

**Config Structure**:
```yaml
name: string
personality: string
model: string (default: "claude-sonnet-4")
rules: string[]
tone: string
vocabulary: string[]
forbidden_words: string[]
creativity: "low" | "medium" | "high" | "very-high"
collaboration_enabled: boolean
```

**Acceptance Criteria**:
- config.yml parsed correctly
- Validation errors are clear and helpful
- Invalid configs don't crash the system

---

#### 4. Corpus Management
**Why**: The knowledge base is core to universe identity
**Tasks**:
- [ ] Corpus class for managing markdown files
- [ ] Load all .md files from corpus/ directory
- [ ] Get corpus summary for system prompt
- [ ] Simple keyword/relevance search (V1: basic fuzzy matching)
- [ ] `add-to-corpus [file]` helper command (optional)

**Acceptance Criteria**:
- Can read multiple .md files from corpus/
- Can retrieve relevant sections based on query
- Handles empty corpus gracefully

---

#### 5. System Prompt Generation
**Why**: This is where config + corpus = personality
**Tasks**:
- [ ] system.md template with variables
- [ ] Template compiler (replaces {{ name }}, {{ rules }}, etc.)
- [ ] Inject corpus summary
- [ ] Inject recent memory context
- [ ] Token counting to stay within limits

**Template Example**:
```markdown
# You are {{ name }}

{{ personality }}

## Core Principles
{{ rules }}

## Knowledge Base
You have access to:
{{ corpus_summary }}

## Style
- Tone: {{ tone }}
- Use these words: {{ vocabulary }}
- Never use: {{ forbidden_words }}
```

**Acceptance Criteria**:
- All config values properly injected
- System prompt under token limit
- Readable and debuggable

---

#### 6. Claude API Integration
**Why**: The actual AI conversation
**Tasks**:
- [ ] Anthropic SDK integration
- [ ] ClaudeAdapter class
- [ ] API key management
- [ ] Error handling (rate limits, invalid keys, etc.)
- [ ] Token counting and cost estimation

**Acceptance Criteria**:
- Can make successful API calls
- Clear error messages for API issues
- Handles rate limiting gracefully

---

#### 7. Chat Interface (CLI)
**Why**: The core user interaction
**Tasks**:
- [ ] `chat [universe-name]` command
- [ ] Interactive REPL interface
- [ ] Load universe config + corpus
- [ ] Build system prompt
- [ ] Send messages to Claude
- [ ] Display responses with formatting
- [ ] Commands: /exit, /clear, /save, /info

**User Experience**:
```bash
$ npm run chat luminous-poet

Luminous Poet is ready. Type '/exit' to quit.

You: Write about loneliness

Luminous Poet: Loneliness is not absence but a specific
phosphorescence—the glow that matter gives off when left
too long in darkness...

You: /info
Universe: luminous-poet
Model: claude-sonnet-4
Corpus files: 3
Memory: 2 messages
Tokens used: 1,247

You: /exit
✓ Conversation saved to universes/luminous-poet/memory/
```

**Acceptance Criteria**:
- Smooth chat experience
- Universe personality is consistent
- Can exit cleanly
- Commands work as expected

---

#### 8. Memory & Persistence
**Why**: Conversations should be saved and inform future chats
**Tasks**:
- [ ] Memory class for conversation history
- [ ] Save conversations as JSON
- [ ] Load recent conversation context
- [ ] Date-based organization (memory/2025-11-08.json)
- [ ] Token-aware context trimming

**Acceptance Criteria**:
- Conversations automatically saved
- Can resume previous conversation
- Old conversations don't blow up token limits

---

#### 9. Template System
**Why**: Users need good starting points
**Tasks**:
- [ ] Create template directory structure
- [ ] Pre-built templates:
  - blank (minimal starter)
  - poetic-philosopher (literary, reflective)
  - industrial-mystic (SPK/Graeme Revell inspired)
  - cybernetic-architect (Clock DVA/Adi Newton inspired)
  - researcher (academic, rigorous)
- [ ] Template documentation
- [ ] Example corpus files for each

**Acceptance Criteria**:
- Templates work out of the box
- Clear documentation for each
- Users can create custom templates

---

#### 10. Documentation & Examples
**Why**: Users need to understand how to use the tool
**Tasks**:
- [x] README.md with quick start
- [x] ARCHITECTURE.md technical overview
- [x] USER_JOURNEY.md with scenarios
- [ ] Example universes (3-4 complete examples)
- [ ] Troubleshooting guide
- [ ] API cost estimation guide

**Acceptance Criteria**:
- Non-technical user can follow README and succeed
- Technical users can understand architecture
- Common issues are documented

---

## V1 MVP Success Criteria

A user can:
1. ✅ Install the tool in < 5 minutes
2. ✅ Create a universe in < 10 minutes
3. ✅ Add their corpus (markdown files)
4. ✅ Configure personality/rules via YAML
5. ✅ Chat with their universe
6. ✅ Get responses that reflect their corpus and style
7. ✅ Have conversations persist across sessions

**Metrics**:
- Time to first universe: < 15 minutes
- User says "this sounds like me"
- No fatal errors in happy path

---

## V2 Enhanced Features

### Multi-Universe Collaboration
**User Need**: "I want multiple universes to work together"

**Features**:
- Orchestrator class
- `collaborate [universe1] [universe2] --prompt "..."`
- Collaboration strategies:
  - Sequential (A → B → C)
  - Parallel (A, B, C → synthesize)
  - Dialogue (A ↔ B with orchestrator mediating)
- Artifact generation and storage
- Shared memory between collaborating universes

**Implementation**:
```typescript
class Orchestrator {
  async collaborate(
    universes: Universe[],
    prompt: string,
    strategy: CollaborationStrategy
  ): Promise<Artifact>
}
```

---

### Web UI
**User Need**: "I want to use this from any device"

**Features**:
- Next.js + React frontend
- Authentication (optional, for cloud deployment)
- Browser-based chat interface
- Corpus file upload
- Visual config editor
- Deploy to Vercel

**Architecture**:
```
/web
  /app
    /universes
    /chat
    /settings
  /components
  /lib
```

---

### Semantic Corpus Search
**User Need**: "My corpus is too large for keyword search"

**Features**:
- Optional embedding generation (via Claude or MCP)
- Vector similarity search
- Automatically retrieve most relevant corpus sections
- Transparent to user (just works better)

**Implementation**:
- MCP server for embeddings (keeps core simple)
- Falls back to keyword search if MCP unavailable

---

### MCP Integration
**User Need**: "I want multimodal capabilities"

**Features**:
- Image generation (Stable Diffusion via MCP)
- Audio generation (for sonic universes)
- Web search (for research universes)
- Custom MCP servers per universe

**Example**:
```yaml
# config.yml
mcp_servers:
  - name: "image-generator"
    type: "stable-diffusion"
    config: {...}
```

---

### Export/Import & Sharing
**User Need**: "I want to share my universe"

**Features**:
- `export [universe-name]` → creates portable .zip
- `import [file.zip]` → installs universe
- Exclude memory (privacy) but include corpus
- Optional: Universe marketplace/registry

---

### Style Transfer
**User Need**: "I want to blend two universes"

**Features**:
- Analyze style from Universe A
- Apply to Universe B's outputs
- Create hybrid universes
- "What would Universe A say about Universe B's topic?"

---

### Cost Dashboard
**User Need**: "I want to know how much I'm spending"

**Features**:
- Token usage tracking
- Cost estimation per conversation
- Monthly spending summary
- Model selection based on budget

---

## V3 Platform Features (Future Vision)

### Universe Marketplace
- Discover and download universes created by others
- Ratings and reviews
- Categories (creative, research, technical, etc.)
- Verified universes (high-quality templates)

### Real-Time Collaboration
- Multiple users chat with same universe simultaneously
- Collaborative corpus building
- Shared artifacts

### Local Model Support
- Option to use Ollama/local models
- Reduces API costs
- Fully offline capability
- Trade-off: Lower quality but free

### Advanced Multimodal
- Video generation
- 3D model generation (for architectural universes)
- Audio reactive visuals
- Full multimedia artifacts

### Version Control Integration
- Git-based universe versioning
- Rollback corpus changes
- Branch/merge universes
- Collaborative editing via git

---

## Technical Debt & Non-Goals

### We Are NOT Building (At Least Not Now)
- ❌ Our own LLM
- ❌ Fine-tuning infrastructure
- ❌ Vector database hosting
- ❌ Complex ML pipelines
- ❌ Mobile apps
- ❌ Enterprise features (SSO, audit logs, etc.)

### Technical Debt We Accept (For Now)
- Simple keyword search (vs semantic search)
- File-based storage (vs database)
- Single-user only (vs multi-user)
- CLI only (vs GUI)

**Rationale**: These limitations keep V1 simple and shippable. We can add sophistication later if users demand it.

---

## Success Metrics

### V1 MVP
- [ ] 10 users create their first universe
- [ ] Average time to first universe < 15 minutes
- [ ] 0 fatal bugs in core flow
- [ ] 3+ GitHub stars
- [ ] Positive feedback from test users

### V2 Enhanced
- [ ] 100 users
- [ ] 50+ universes created
- [ ] 10+ collaboration artifacts generated
- [ ] Web UI deployed to Vercel
- [ ] Featured on Hacker News / Reddit

### V3 Platform
- [ ] 1000+ users
- [ ] Universe marketplace with 100+ public universes
- [ ] Self-sustaining community
- [ ] Revenue model (if needed)

---

## Risk & Mitigation

### Risk 1: API Costs Too High
**Mitigation**:
- Cost estimation before operations
- Smaller model options
- Local model support (V2)

### Risk 2: Personality Not Distinctive
**Mitigation**:
- Better prompt engineering
- More corpus context
- User feedback loop
- Examples of what works

### Risk 3: Technical Users Only
**Mitigation**:
- Extremely simple UX
- Great documentation
- Video tutorials
- Web UI for non-CLI users

### Risk 4: Too Niche
**Mitigation**:
- Clear use cases (writers, researchers, artists)
- Public examples
- Community building
- Partnerships with creative communities

---

## Next Steps (Immediate)

1. **Set up GitHub project** ✅
   - Milestones for V1, V2, V3
   - Issues for each feature
   - Labels (user-story, bug, enhancement, etc.)

2. **Create V1 Issues** (Next)
   - One issue per feature above
   - Clear acceptance criteria
   - Assigned to milestones

3. **Initialize Codebase** (After issues)
   - TypeScript + Node setup
   - CLI framework
   - Project structure

4. **Start Building**
   - Begin with #1 (Project Foundation)
   - Ship each feature incrementally
   - Get user feedback early

---

**Let's build some universes.**
