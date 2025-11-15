# Working with Claude Code: Development Workflow

This document describes the collaborative development methodology used to build Fine-Tuned Universe.

## Overview

This project demonstrates an agile, iterative development workflow where:
- User provides high-level requirements and vision
- Claude Code translates requirements into GitHub issues
- Claude Code implements features incrementally
- Each step maintains working functionality
- Documentation is created alongside code

## Core Principles

### 1. Requirements → Issues → Implementation

**Process:**
1. User states a requirement or feature need
2. Claude creates a detailed GitHub issue with:
   - User story format
   - Acceptance criteria
   - Technical requirements
   - Estimated effort
3. Claude builds the feature
4. Claude closes the issue with reference to implementation
5. Claude updates documentation

**Example:**
```
User: "When I start the app I want to see a list of available universes"
→ Claude creates Issue #40: "Web UI: Universe Selection Homepage"
→ Claude implements: API routes + React components
→ Claude tests and documents
→ Claude closes issue
```

### 2. Always Retain Functionality

**Philosophy:** Every commit should leave the project in a working state.

**Implementation:**
- Build features incrementally
- Test at each step
- Never break existing functionality
- Use feature flags if needed for incomplete features
- Maintain backward compatibility

**Example:**
- V0.1: CLI working ✅
- Add web interface: CLI still works ✅
- Add memory persistence: Both CLI and web work ✅

### 3. Smart Prioritization

**Framework: Now vs. Backlog**

**NOW (Current Sprint):**
- Core functionality
- Blocking features
- High user value
- Foundation for future work

**BACKLOG (Future):**
- Nice-to-have features
- Optimizations
- Advanced capabilities
- V2/V3 roadmap items

**Tools:**
- **Milestones**: V1 MVP, V2 Enhanced, V3 Platform
- **Labels**: Priority indicators in issue titles
- **Priority**: 🔴 High, 🟡 Medium, 🟢 Low

### 4. Simplest Solution First

**Approach:**
- Solve the immediate problem
- Don't over-engineer
- Iterate and improve later
- Ship quickly, refine continuously

**Examples:**
- Memory persistence: JSON files (not database)
- Corpus search: Load all files (not vector search)
- Chat interface: CLI REPL (before web UI)

These work immediately. Optimization comes later.
