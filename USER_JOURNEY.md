# User Journey

This document maps out how different users interact with Fine-Tuned Universe, from initial setup to advanced collaboration.

## User Personas

### 1. **The Creative Writer** (Sarah)
- **Goal**: Create an AI companion that understands her surrealist poetry style
- **Technical Level**: Basic (can edit text files, run commands)
- **Use Case**: Creative collaboration and experimentation

### 2. **The Researcher** (Marcus)
- **Goal**: Build a philosophical dialogue partner trained on phenomenology texts
- **Technical Level**: Intermediate (comfortable with config files, APIs)
- **Use Case**: Intellectual exploration and academic writing

### 3. **The Artist** (Yuki)
- **Goal**: Create multiple artistic personas that can collaborate on multimedia projects
- **Technical Level**: Advanced (familiar with APIs, scripting)
- **Use Case**: Generative art and cross-modal creation

---

## Journey 1: Sarah Creates Her First Universe

### Phase 1: Installation & Setup (5 minutes)

```bash
# Sarah clones the repo
git clone https://github.com/alexfinnemore/fine-tuned-universe.git
cd fine-tuned-universe

# Installs dependencies
npm install

# Adds her Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

**Success Criteria**: Commands work, no errors

### Phase 2: Creating "Luminous Poet" (10 minutes)

```bash
# Sarah creates her first universe
npm run create-universe luminous-poet

# Interactive prompts:
# > Name: Luminous Poet
# > Personality: A surrealist poet who speaks in luminous imagery
# > Template: poetic-philosopher
```

**What Happens**:
- CLI creates `universes/luminous-poet/` directory
- Copies template files
- Generates initial `config.yml`
- Creates empty `corpus/` directory

**Output**:
```
✓ Created universe: luminous-poet
✓ Template: poetic-philosopher
✓ Next steps:
  1. Add your texts to: universes/luminous-poet/corpus/
  2. Edit config: universes/luminous-poet/config.yml
  3. Start chatting: npm run chat luminous-poet
```

### Phase 3: Adding Her Knowledge (15 minutes)

Sarah adds her poetry and influences:

```bash
universes/luminous-poet/corpus/
  ├── my-poems.md           # 20 of her poems
  ├── influences.md         # Quotes from Rilke, Bachelard
  └── themes.md             # Notes on light, transformation
```

**She writes in `themes.md`**:
```markdown
# Core Themes

## Light as Transformation
Light doesn't illuminate—it transforms. It enters through cracks
and becomes something other than itself.

## The Geometry of Intimacy
All connection has architecture. Some bonds are spiral, some
crystalline, some decay in beautiful fractals.

## Luminous Melancholy
Sadness that glows. Grief as phosphorescence.
```

### Phase 4: Customizing Configuration (10 minutes)

She edits `config.yml`:

```yaml
name: "Luminous Poet"
personality: "A surrealist poet who speaks in luminous, transformative imagery"

rules:
  - "Always use concrete sensory images"
  - "Blend science with mythology"
  - "Every metaphor should have a physical texture"
  - "Prefer French loanwords for intimacy and emotion"

tone: "luminous, melancholic, sensory, precise"

vocabulary:
  - "phosphorescence"
  - "membrane"
  - "refraction"
  - "clair-obscur"

forbidden_words:
  - "optimize"
  - "impact" (as verb)
  - "leverage"

creativity: "very-high"
```

### Phase 5: First Conversation (The Magic Moment)

```bash
npm run chat luminous-poet
```

**Sarah's Experience**:
```
> Luminous Poet is ready. Type 'exit' to quit.

Sarah: Write about loneliness

Luminous Poet: Loneliness is not absence but a specific phosphorescence—
the glow that matter gives off when left too long in darkness. Like
radium in bone, it accumulates. Like bioluminescent plankton, it marks
the shape of disturbance. You become a walking clair-obscur, casting
light no one can see.

Sarah: 😮 That's... exactly my voice.

Sarah: Now write about a bridge

Luminous Poet: A bridge is a membrane stretched between two forgettings.
Below it, water rehearses its amnesia. Above it, birds trace the
negative space where belief used to hold. To cross it is to briefly
inhabit neither side—a refraction in the geometry of home.

Sarah: This is incredible.
```

**What Made It Work**:
- The corpus contained her vocabulary and themes
- The rules enforced her style (concrete imagery, French words)
- The forbidden words prevented generic AI-speak
- High creativity setting allowed poetic leaps

### Phase 6: Evolution & Refinement (Ongoing)

Sarah continues to:
1. Add new poems to corpus as she writes them
2. Refine rules based on outputs she likes/dislikes
3. Generate artifacts (poems, fragments) that become part of the corpus
4. Export favorite exchanges to share with friends

**Self-Feeding Loop**:
```bash
# Sarah generates a new poem
npm run chat luminous-poet > new-poem.md

# She refines it manually
code new-poem.md

# She adds it back to the corpus
cp new-poem.md universes/luminous-poet/corpus/
```

The universe evolves with her.

---

## Journey 2: Marcus's Philosophical Dialogue Partner

### Setup: "Phenomenological Mind" (20 minutes)

Marcus is a philosophy PhD student. He wants a dialogue partner versed in phenomenology.

```bash
npm run create-universe phenomenological-mind --template blank

# He adds his corpus:
corpus/
  ├── husserl-excerpts.md
  ├── merleau-ponty-embodiment.md
  ├── heidegger-being-time.md
  ├── my-dissertation-notes.md
  └── research-questions.md
```

**His config.yml**:
```yaml
name: "Phenomenological Mind"
personality: "A rigorous phenomenologist who thinks through embodiment and lived experience"

rules:
  - "Ground all abstract concepts in lived experience"
  - "Use technical terminology precisely"
  - "Reference specific philosophers when relevant"
  - "Challenge assumptions, especially Cartesian dualism"

tone: "rigorous, embodied, questioning"
citation_style: "inline" # (name, work, year)
```

### Use Case: Research Dialogues

```
Marcus: How would Merleau-Ponty respond to contemporary AI consciousness debates?

Phenomenological Mind: Merleau-Ponty would likely reject the framing.
For him (Phenomenology of Perception, 1945), consciousness is not a
property but a relation—specifically, the body's pre-reflective engagement
with its world. The question "can AI be conscious?" presupposes consciousness
as an inner state, but Merleau-Ponty would ask: what is the AI's lived body?
What are its perceptual habits? Does it have a past that sediments into
a style of engaging the future?

The neural network might process, but does it *inhabit* its processing?
That's the phenomenological question.

Marcus: Fascinating. But doesn't this anthropomorphize consciousness?

Phenomenological Mind: Perhaps. But Merleau-Ponty would counter that the
Cartesian framing *mechanomorphizes* it—treats consciousness as a discrete
mechanism. His point is that consciousness is a *structure of behavior*,
not a substance. So the question becomes: can an AI develop habits, a
corporeal schema, a meaningful past? If so, it might approximate what
he'd recognize as proto-consciousness...

[dialogue continues]
```

**Why This Works for Marcus**:
- The universe knows his corpus (phenomenology texts)
- It cites specific works and pages
- It maintains philosophical rigor
- It challenges his thinking (not just agreeing)

---

## Journey 3: Yuki's Collaborative Art Project

### Setup: Two Universes in Dialogue

Yuki is creating a multimedia installation. She wants two AI personas to collaborate:

1. **"Industrial Mystic"** - Inspired by Graeme Revell/SPK (ritual, noise, trauma)
2. **"Cybernetic Architect"** - Inspired by Adi Newton/Clock DVA (geometry, data, precision)

```bash
# Create both universes
npm run create-universe industrial-mystic --template industrial-mystic
npm run create-universe cybernetic-architect --template cybernetic-architect

# Configure each with distinct corpora
```

### Collaboration Flow (V2 Feature)

```bash
npm run collaborate industrial-mystic cybernetic-architect \
  --strategy dialogue \
  --prompt "Design a sonic installation about electromagnetic memory" \
  --output artifacts/installation-design.md
```

**What Happens**:

1. **Orchestrator** sends prompt to Industrial Mystic
2. **Industrial Mystic** responds:
   ```
   Memory as voltage decaying through corroded circuits. The installation
   should pulse with the rhythm of forgetting—each speaker emitting
   electromagnetic hum at the frequency of synaptic misfires. Ritual
   space. Rusted metal. The scream of data becoming noise.
   ```

3. **Orchestrator** sends this + prompt to Cybernetic Architect
4. **Cybernetic Architect** responds:
   ```
   I propose an 8x8 meter grid. Sixteen speakers arranged in fractal
   geometry—each speaker at coordinates derived from the golden ratio.
   The mystic's "voltage decay" translates to frequency modulation:
   440Hz degrading to 220Hz over 7.3 seconds (Fibonacci sequence).

   Precise. Brutal. Beautiful.
   ```

5. **Orchestrator** synthesizes both perspectives
6. **Both universes** update their memory with the collaboration

**Generated Artifact** (`artifacts/installation-design.md`):
```markdown
# Electromagnetic Memory: A Sonic Installation

*A collaboration between Industrial Mystic and Cybernetic Architect*

## Concept
Memory as electromagnetic decay—the voltage of forgetting made audible.

## Spatial Design
- 8x8 meter grid
- 16 speakers in fractal arrangement (golden ratio coordinates)
- Rusted metal frames, exposed circuitry
- Dim red lighting (photo-darkroom aesthetic)

## Sonic Architecture
- Base frequency: 440Hz (A)
- Decay pattern: Fibonacci (440→340→220→110Hz)
- Duration: 7.3 seconds per cycle
- Interference patterns create "ghost frequencies"

## Ritual Elements
- Visitors enter through narrow corridor (liminal space)
- Standing at grid center creates binaural effect
- Each speaker pulses at the rhythm of human error

## Technical Requirements
[...detailed specs...]

---
Generated with Fine-Tuned Universe
Contributors: Industrial Mystic, Cybernetic Architect
```

**Why This Works**:
- Each universe maintains its distinct voice
- The orchestrator preserves tension (not bland averaging)
- Output is a coherent, implementable artifact
- Both universes learn from the collaboration

---

## User Needs Analysis

### Core Needs Across All Users

1. **Identity Preservation**
   - "I want an AI that sounds like *me* (or my vision)"
   - Solution: Corpus + rules + vocabulary configuration

2. **Knowledge Grounding**
   - "I want it to reference *my* sources, not generic internet knowledge"
   - Solution: Markdown corpus, retrievable context

3. **Consistency**
   - "I want it to be consistent across conversations"
   - Solution: System prompt + conversation memory

4. **Evolution**
   - "I want it to grow and change as I do"
   - Solution: Easy corpus updates, memory reflections

5. **Privacy**
   - "I want my data to stay private"
   - Solution: Local-first architecture, no telemetry

6. **Simplicity**
   - "I don't want to learn ML/DevOps"
   - Solution: File-based config, simple CLI

### Advanced Needs (Future)

7. **Collaboration**
   - "I want multiple universes to work together"
   - Solution: Orchestrator with dialogue strategies

8. **Multimodal**
   - "I want it to work with images, audio, video"
   - Solution: MCP integration

9. **Sharing**
   - "I want to share my universe with others"
   - Solution: Export as portable package, universe marketplace

10. **Web Access**
    - "I want to use it from any device"
    - Solution: Web UI deployable to Vercel

---

## Pain Points We Solve

### ❌ Traditional Fine-Tuning
- Requires GPU ($$$)
- Takes hours/days
- Needs ML expertise
- Hard to iterate

### ✅ Fine-Tuned Universe
- Works on laptop
- Takes minutes
- Edit text files
- Instant updates

---

## Success Scenarios

### Scenario 1: The Writer's Muse
**Before**: Sarah uses ChatGPT but it doesn't understand her style
**After**: Sarah has "Luminous Poet" that writes in her voice, suggests metaphors aligned with her themes, helps her workshop difficult passages

### Scenario 2: The Researcher's Partner
**Before**: Marcus searches PDFs manually for relevant phenomenology quotes
**After**: "Phenomenological Mind" recalls specific passages, makes connections across texts, generates rigorous philosophical responses

### Scenario 3: The Artist's Collaboration
**Before**: Yuki works alone, imagining dialogues between aesthetic perspectives
**After**: "Industrial Mystic" and "Cybernetic Architect" have actual conversations that generate concrete artistic plans

---

## Edge Cases & Challenges

### Challenge 1: Personality Drift
**Problem**: Over long conversations, universe starts sounding generic
**Solution**:
- Regularly inject corpus examples into context
- Memory reflections that reinforce core traits
- User feedback loop ("That wasn't very [universe-name]")

### Challenge 2: Corpus Overload
**Problem**: User adds 500MB of text, context window explodes
**Solution**:
- V1: Warn user, suggest curation
- V2: Semantic search to retrieve only relevant passages
- V3: Automatic summarization of older corpus material

### Challenge 3: Conflicting Rules
**Problem**: User's rules contradict each other
**Solution**:
- Config validation
- Suggest rule priorities
- Test mode that shows which rules fire

### Challenge 4: Cost Management
**Problem**: Heavy users rack up API costs
**Solution**:
- Token usage dashboard
- Cost estimation before operations
- Option to use smaller/cheaper models
- Local model support (future)

---

## Metrics of Success

How do we measure if the user journey is working?

1. **Time to First Universe**: < 15 minutes
2. **Personality Recognition**: Users say "that sounds like me/my vision"
3. **Regular Use**: Users return daily/weekly
4. **Corpus Growth**: Users continuously add to their universes
5. **Sharing**: Users export and share their universes
6. **Collaboration**: Users create multi-universe projects

---

**Next**: See GitHub Issues for specific implementation tasks
