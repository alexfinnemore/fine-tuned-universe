# How Fine-Tuned Universe Works

> A simple guide for everyone - no technical knowledge required

## What Is This?

Fine-Tuned Universe lets you create your own personalized AI with a unique personality, knowledge base, and communication style. Think of it like:

- **A creative companion** who knows your favorite artists and thinks like them
- **A knowledgeable guide** trained on specific topics you care about
- **A conversation partner** with a consistent personality and perspective

The magic? You don't need to train any AI models. You just write some configuration files and add knowledge documents, and the system does the rest.

---

## The Big Idea

### Traditional AI Fine-Tuning (What We're NOT Doing)

Normally, creating a custom AI requires:
- Training models on expensive computers with GPUs
- Technical expertise in machine learning
- Days or weeks of computation
- Thousands of dollars in costs

### Our Approach (What We ARE Doing)

Instead, we use something called "system prompts" - detailed instructions that tell an AI (Claude) how to behave. Think of it like this:

**Traditional Fine-Tuning** = Teaching a student everything from scratch over months
**System Prompts** = Giving an already-smart student a detailed manual before each conversation

The second approach is instant, free (besides API costs), and just as effective for most purposes.

---

## How It Works: The Five Steps

### Step 1: You Create a Universe

When you create a universe, you define:

**Identity**:
- Name (e.g., "Universe K", "Industrial Mystic")
- Personality (1-2 sentences describing who/what this AI is)

**Rules**:
- How should it behave?
- What perspective should it take?
- What style should it use?

**Example**:
```yaml
name: "Universe K"
personality: "A Kafkaesque narrator obsessed with quantum encryption and mycelial networks"
rules:
  - "Maintain a paranoid, introverted perspective"
  - "Ground speculative ideas in real science"
  - "Prague should feel labyrinthine and coded"
```

Think of this as writing a character profile for an actor.

### Step 2: You Add Knowledge (Corpus Files)

A "corpus" is just a fancy word for "collection of documents." You can add:

- Background information
- Reference materials
- Stories or narratives
- Artistic influences
- Technical knowledge
- Anything you want your universe to know about

**Example**: For "Universe K", you might add:
```
corpus/
  mycelial-networks.md       (About fungal communication)
  quantum-encryption.md      (About cryptography)
  prague-labyrinth.md        (About the city's maze-like streets)
```

These are just plain text files that you can edit in any text editor, or right in the web interface.

### Step 3: The System Builds a Prompt

When you start a conversation, here's what happens behind the scenes:

1. **The system reads your config file** (identity, rules, style)
2. **It reads all your corpus files** (knowledge base)
3. **It combines everything into one big instruction document** called a "system prompt"

This system prompt says something like:

```
You are Universe K, a Kafkaesque narrator obsessed with quantum encryption.

Follow these rules:
- Maintain a paranoid, introverted perspective
- Ground all ideas in real science
- Everything is labyrinthine and coded

Here's your knowledge base:
[Full content of mycelial-networks.md]
[Full content of quantum-encryption.md]
[Full content of prague-labyrinth.md]

Communication style: philosophical, scientific, melancholic
```

This instruction document can be thousands of words long! It contains everything the AI needs to embody your universe.

### Step 4: You Send a Message

When you type a message like:

> "What remains of the human when technology becomes nature?"

The system sends to Claude:
1. **The system prompt** (your universe's instructions)
2. **Your message** ("What remains of the human...")
3. **Previous messages** (context from the conversation)

### Step 5: Claude Responds as Your Universe

Claude reads the entire system prompt, understands it's supposed to be "Universe K", sees your question, and generates a response that matches:
- The personality you defined
- The rules you set
- The knowledge you provided
- The style you specified

You get back a response that sounds like it's from your unique universe.

**The best part?** This happens in seconds, and costs just a few cents per conversation.

---

## Behind the Scenes: Token Costs

You might wonder: "How much does this cost?"

### What Are Tokens?

Tokens are how AI systems measure text. Roughly:
- **1 token ≈ 4 characters** (or about 0.75 words)
- "Hello world!" = about 3 tokens
- A typical paragraph = about 100 tokens

### What You Pay For

Every time you send a message:

**Input Tokens** (what Claude reads):
- Your system prompt: ~5,000-20,000 tokens (depending on how much knowledge you added)
- Your message: ~10-100 tokens
- Previous conversation: ~100-1,000 tokens

**Output Tokens** (what Claude writes):
- The response: ~100-1,000 tokens (depending on length)

**Pricing**:
- Input: $3 per million tokens ($0.000003 each)
- Output: $15 per million tokens ($0.000015 each)

### Example Costs

**Single message**:
- System prompt: 8,000 tokens × $0.000003 = $0.024
- Your message: 50 tokens × $0.000003 = $0.00015
- Previous context: 200 tokens × $0.000003 = $0.0006
- AI response: 500 tokens × $0.000015 = $0.0075
- **Total: ~$0.032 (about 3 cents)**

**Typical usage**:
- 10-message conversation: ~$0.30
- 100 messages: ~$3.00
- Heavy monthly use: $10-30

**The app shows you costs in real-time** so you're never surprised.

---

## Knowledge Base: How Your Universe "Knows" Things

### No Database Magic

Your universe doesn't search through databases or use complex retrieval systems. It's simpler:

1. **All your knowledge files get loaded at once**
2. **Everything is sent to Claude with every message**
3. **Claude reads it all and references what's relevant**

Think of it like giving someone a binder full of reference materials before a conversation. They read through it, then naturally reference relevant parts while talking to you.

### Why This Works

Claude can read up to 200,000 tokens (about 150,000 words) at once. That's like:
- A short novel
- 50-100 Wikipedia articles
- 10-20 technical papers

For most personal AI universes, that's **more than enough**.

### What to Put in Your Corpus

Good corpus files:
- **Background knowledge**: "This is what mycelial networks are..."
- **Style examples**: Passages written in the voice you want
- **Reference materials**: Historical facts, scientific concepts
- **Creative influences**: Quotes, aesthetic descriptions

Bad corpus files:
- Redundant information
- Overly generic content
- Things the base AI already knows well

**Tip**: Start small (3-5 files), then add more as needed.

---

## Personalities: How Your Universe "Sounds" Right

### The Rules System

When you define rules in your config:

```yaml
rules:
  - "Maintain a paranoid, introverted perspective"
  - "Ground all speculative ideas in real science"
  - "Use labyrinthine, coded language"
```

These become instructions Claude follows strictly. They're like stage directions for an actor.

### Tone and Vocabulary

```yaml
tone: "philosophical, scientific, melancholic"
vocabulary: ["encryption", "spores", "mycelium", "labyrinth"]
forbidden_words: ["optimize", "synergy", "leverage"]
```

This fine-tunes the language:
- **Tone**: Overall feeling (formal vs. casual, dark vs. bright)
- **Vocabulary**: Words to use naturally
- **Forbidden words**: Words to avoid (usually corporate jargon or clichés)

### Creativity Level

```yaml
creativity: "very-high"
```

This tells Claude how experimental to be:
- **Low**: Stick to facts, be literal and precise
- **Medium**: Balance accuracy with creative expression
- **High**: Take interpretive risks, be more poetic
- **Very High**: Maximize imagination while staying coherent

### Output Length

```yaml
output_length: "long"
```

Controls response size:
- **Short**: 1-3 paragraphs (quick answers)
- **Medium**: 3-5 paragraphs (thorough but focused)
- **Long**: Detailed, comprehensive (multi-section responses)

---

## Two Ways to Use It

### 1. Command Line (CLI)

For people who like terminal commands:

```bash
# Chat with Universe K
npm run chat universe-k

# Create a new universe
npm run create-universe my-universe

# Add knowledge files
npm run add-corpus my-universe my-knowledge-file
```

Simple, fast, perfect for quick conversations.

### 2. Web Interface

For people who prefer browsers:

1. **Start the web server**: `cd web && npm run dev`
2. **Open http://localhost:3000** in your browser
3. **Browse universes** - see all available universes
4. **Click to chat** - open a conversation
5. **Edit knowledge** - view and modify corpus files
6. **Upload images** - add visual references

The web interface includes:
- Automatic color themes for each universe
- Real-time token/cost tracking
- Corpus file viewer and editor
- Image gallery

---

## What Makes Each Universe Unique

### Dynamic Theming

Each universe gets its own color scheme based on its content:

- **Universe K** (Kafkaesque): Gray, melancholic tones
- **Mycelial Universe**: Green, organic gradients
- **Quantum Universe**: Blue, technological vibes
- **Industrial Mystic**: Red, intense colors

The system automatically detects keywords in your universe name and content, then assigns matching colors.

### Separate Knowledge Bases

Each universe has its own:
- Config file (personality, rules)
- Corpus directory (knowledge files)
- Image directory (visual references)

They never interfere with each other. You can have:
- A philosophical poet universe
- A technical documentation universe
- A creative fiction universe
- All separate and distinct

### Consistent Personality

Because the full system prompt is regenerated for every message, your universe never "drifts" or forgets who it is. Every response is informed by:
- The complete personality definition
- All the rules you set
- The entire knowledge base

---

## Common Questions

### "Is this as good as actually training an AI?"

For most use cases, **yes**. The main differences:

**System Prompts (what we do)**:
- ✅ Instant setup
- ✅ Easy to modify
- ✅ No technical expertise needed
- ✅ Transparent and understandable
- ❌ Slightly less deep style imprint

**Fine-Tuning (traditional)**:
- ✅ Deeper style learning
- ✅ More efficient (no prompt overhead)
- ❌ Requires ML expertise
- ❌ Takes days/weeks
- ❌ Expensive
- ❌ Hard to modify

**Verdict**: System prompts are 90% as effective with 1% of the complexity.

### "Will my conversations be private?"

Yes! Everything stays on your computer:
- Universe configs
- Corpus files
- (Optionally) conversation history

The only data sent to Anthropic (Claude's company) is:
- The system prompt (your universe instructions)
- Your messages
- Claude's responses

Your API key never leaves your machine. We don't track or collect anything.

### "Can I share my universe with others?"

Yes! Your universe is just a folder with:
```
my-universe/
  config.yml       (personality and rules)
  corpus/          (knowledge files)
  images/          (optional)
```

You can:
- Zip it up and share it
- Upload it to GitHub
- Send it to friends

Anyone can load it and chat with your universe. (Future versions will have import/export tools to make this even easier.)

### "What if I make a mistake in my config?"

No problem! Just edit the YAML file and start a new conversation. Changes take effect immediately.

You can experiment freely:
- Try different personalities
- Adjust rules
- Change creativity levels
- Add or remove corpus files

There's no training to redo. It's instant.

### "How much knowledge can I add?"

**Technical limit**: About 150,000 words (200K tokens)

**Practical limit**: 10-20 corpus files (5K-30K words total)

**Why less is better**:
- Faster responses
- Lower costs
- Easier to maintain
- More focused personality

**Tip**: Quality over quantity. Five excellent, relevant files beat fifty mediocre ones.

### "Can I use images or audio?"

**V1 (current)**: Text only

**V2 (planned)**:
- Image support (upload and reference in conversations)
- Audio analysis (future)

For now, you can:
- Upload images to your universe's `images/` folder
- Reference them in corpus files
- Describe visual concepts in text

### "What about other AI models besides Claude?"

**V1**: Claude Sonnet 4 only

**V2**: Other models (GPT-4, Gemini) will be supported

**V3**: Local models (Ollama, LM Studio) for free, offline use

Claude is the best starting point because of its:
- 200K token context window (huge)
- Strong instruction-following
- Natural, coherent writing
- Reasonable pricing

---

## Tips for Creating Great Universes

### 1. Start with a Clear Identity

Good personality definitions:
- ✅ "A melancholic philosopher obsessed with memory and technology"
- ✅ "Industrial noise mystic, affective ecstatic prophet"
- ✅ "Cybernetic architect designing impossible cities"

Weak personality definitions:
- ❌ "A helpful AI assistant"
- ❌ "Someone who is creative and smart"
- ❌ "An expert in everything"

### 2. Write Specific Rules

Good rules:
- ✅ "Ground all speculative ideas in real science"
- ✅ "Use ritual-poetic language"
- ✅ "Maintain a paranoid perspective"

Vague rules:
- ❌ "Be helpful"
- ❌ "Answer questions well"
- ❌ "Be creative"

### 3. Curate Your Knowledge Base

Good corpus files:
- ✅ Unique knowledge the base AI doesn't have
- ✅ Style examples written in your desired voice
- ✅ Specific technical or creative references
- ✅ 500-2000 words each (focused, digestible)

Bad corpus files:
- ❌ Generic Wikipedia-like content
- ❌ Redundant information
- ❌ Overly long documents (10,000+ words)

### 4. Test and Iterate

1. Create your universe with a basic config
2. Have a short conversation
3. Notice what's working and what's not
4. Edit your config or add corpus files
5. Try again

It usually takes 3-5 iterations to dial in the personality perfectly.

### 5. Use the Web Interface for Editing

Instead of switching between text editors:
1. Open your universe in the web interface
2. Click on corpus files to view/edit them
3. Save changes directly
4. Immediately start a new chat to test

Much faster workflow!

---

## Example Use Cases

### 1. Creative Writing Partner

**Universe**: "Poetic Philosopher"
**Personality**: Luminous, philosophical, explores meaning through metaphor
**Corpus**: Poetry collections, philosophical texts, your own writing
**Use**: Brainstorm ideas, explore themes, get feedback

### 2. Technical Learning Companion

**Universe**: "Quantum Tutor"
**Personality**: Patient teacher specializing in quantum computing
**Corpus**: Quantum mechanics papers, textbook excerpts, worked examples
**Use**: Ask questions, work through problems, clarify concepts

### 3. Artistic Collaborator

**Universe**: "Industrial Mystic"
**Personality**: Sound artist influenced by SPK and ritual psychology
**Corpus**: Sound theory, industrial aesthetics, cultural references
**Use**: Discuss installations, generate ideas, explore concepts

### 4. Personal Knowledge Base

**Universe**: "My Second Brain"
**Personality**: Thoughtful analyst who knows your interests and projects
**Corpus**: Your notes, journal entries, research materials
**Use**: Retrieve information, make connections, reflect on ideas

### 5. Fictional Character

**Universe**: "Detective Noir"
**Personality**: Hard-boiled 1940s detective with a cynical worldview
**Corpus**: Noir fiction excerpts, period slang, character backstory
**Use**: Interactive fiction, story development, world-building

---

## What's Next: Future Features

### Coming in V2

**Multi-Universe Collaboration**:
- Make two universes talk to each other
- "Universe K, meet Industrial Mystic. Discuss memory and technology."

**Better Corpus Management**:
- Import from URLs
- Auto-summarization for long documents
- Search across corpus files

**Conversation History**:
- Save and resume conversations
- Export transcripts
- Search past conversations

**Universe Marketplace**:
- Browse shared universes
- Download and customize popular ones
- Share your creations

### Coming in V3

**Local Models**:
- Run entirely on your computer
- No API costs
- Complete privacy

**Multimodal**:
- Discuss images
- Analyze audio
- Generate visuals

**Advanced Memory**:
- Learn from interactions
- Build long-term context
- Personalize over time

---

## Getting Started

### Quick Start (5 Minutes)

1. **Install**:
   ```bash
   git clone https://github.com/alexfinnemore/fine-tuned-universe.git
   cd fine-tuned-universe
   npm install
   ```

2. **Add Your API Key**:
   - Copy `.env.example` to `.env`
   - Add your Anthropic API key: `ANTHROPIC_API_KEY=sk-ant-...`

3. **Try the Demo**:
   ```bash
   # Chat with Universe K (pre-made example)
   npm run chat universe-k
   ```

4. **Create Your Own**:
   ```bash
   # Create a new universe
   npm run create-universe my-universe

   # Edit the config at universes/my-universe/config.yml
   # Add knowledge files to universes/my-universe/corpus/

   # Start chatting
   npm run chat my-universe
   ```

5. **Try the Web Interface**:
   ```bash
   cd web
   npm install
   npm run dev
   # Open http://localhost:3000
   ```

---

## Need Help?

- **Quickstart Guide**: See `QUICKSTART.md`
- **GitHub Issues**: Report bugs or ask questions
- **Examples**: Check the `templates/` directory for inspiration
- **Community**: (Coming soon - Discord/forum)

---

**Remember**: You're not training an AI. You're crafting instructions and gathering knowledge. It's more like writing a character profile and compiling a research binder than doing machine learning.

**Have fun creating your universe!** 🌌
