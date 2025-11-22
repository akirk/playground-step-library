# Architecture Documentation

This document explains how the WordPress Playground Step Library works internally, including the compilation process, step design patterns, and architectural decisions.

## Quick Navigation

### 🏗️ Core Concepts
- [**Overview**](#overview) - What the Step Library is
- [**Compilation Process**](#compilation-process) - How custom steps become native steps
- [**Step Types**](#step-types) - Built-in vs Custom steps

### 🎨 Step Design
- [**Step Design Patterns**](#step-design-patterns) - Common patterns for creating steps
  - Single Step Transformation
  - Multi-Step Composition
  - Conditional Transformation
  - Step Delegation
- [**When to Create Custom vs Built-in Steps**](#when-to-create-custom-vs-built-in-steps) - Decision guide

### ⚙️ Advanced Features
- [**Deduplication Strategies**](#deduplication-strategies) - Managing duplicate steps
- [**File Organization**](#file-organization) - Project structure

### 🛠️ Development
- [**Creating a New Step**](#creating-a-new-step) - Step-by-step guide
- [**Best Practices**](#best-practices) - Code quality and design guidelines
- [**Performance**](#performance) - Optimization tips
- [**Security**](#security) - Preventing vulnerabilities
- [**Debugging**](#debugging) - Troubleshooting techniques

### 📚 Reference
- [**Extension Points**](#extension-points) - How to extend the system
- [**Related Documentation**](#related-documentation) - Links to other docs

---

## Overview

The Step Library is a **dual-mode compiler** that transforms blueprints containing custom, high-level steps into either:
- **Blueprint v1**: Imperative format with native WordPress Playground steps
- **Blueprint v2**: Declarative format with schema-based configuration

Users can choose which output format they prefer via the web UI or programmatically.

## Compilation Process

### How It Works

```
┌─────────────────────┐
│  Custom Blueprint   │
│  (High-level steps) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Step Compiler     │
│   V1 or V2 Mode     │
└──────┬──────┬───────┘
       │      │
   V1  │      │  V2
       │      │
       ▼      ▼
┌──────────┐ ┌──────────────────┐
│Blueprint │ │   Blueprint v2   │
│   v1     │ │  (Declarative)   │
│(Steps[]) │ │ content, users,  │
│          │ │ plugins, themes  │
└──────────┘ └──────────────────┘
```

### Compilation Steps

#### V1 Compiler (src/index.ts)
1. **Parse Input** - Validates blueprint structure and step definitions
2. **Transform Steps** - Each custom step returns `BlueprintV1` or `BlueprintV2`
3. **Convert to V1** - `BlueprintV2` fragments are converted to v1 steps via converters
4. **Variable Substitution** - Variables are replaced throughout the transformed steps
5. **Deduplication** - Identical steps are merged (configurable via strategies)
6. **Output Generation** - Final blueprint with steps array

#### V2 Compiler (src/v2-compiler.ts)
1. **Parse Input** - Validates blueprint structure
2. **Transform Steps** - Each custom step returns `BlueprintV1` or `BlueprintV2`
3. **Merge Fragments** - Collects and merges declarative fragments:
   - `content` - Posts, pages, media items
   - `users` - User accounts
   - `plugins` - Plugin slugs (from wordpress.org) or installation steps
   - `themes` - Theme slugs or installation steps
   - `constants` - wp-config.php constants
   - `siteOptions` - WordPress options
   - `postTypes` - Custom post type definitions
4. **Handle Imperative Steps** - V1 steps and `additionalSteps` go to `additionalStepsAfterExecution`
5. **Extract Query Parameters** - Special Playground params extracted
6. **Output Generation** - Final v2 blueprint with declarative schema

### Example Transformation

**Input (Custom Step):**
```json
{
  "step": "addPage",
  "title": "Welcome",
  "content": "<p>Hello World!</p>"
}
```

**V1 Output (Imperative):**
```json
{
  "step": "runPHP",
  "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(...);"
}
```

**V2 Output (Declarative):**
```json
{
  "content": [
    {
      "type": "posts",
      "source": {
        "post_title": "Welcome",
        "post_content": "<p>Hello World!</p>",
        "post_type": "page",
        "post_status": "publish"
      }
    }
  ]
}
```

## Step Types

### Built-in Steps (Enhanced Native Steps)

Built-in steps are enhanced versions of native WordPress Playground steps:
- Better defaults and validation
- Automatic URL detection (e.g., GitHub URLs)
- Simplified syntax

**Examples:** `installPlugin`, `installTheme`, `defineWpConfigConst`

**Key Feature:** Built-in steps can delegate to other steps. For example, `installPlugin` automatically uses `githubPlugin` internally when it detects a GitHub URL.

### Custom Steps (New Functionality)

Custom steps provide entirely new functionality:
- Compose multiple native steps
- Provide domain-specific abstractions
- Simplify complex workflows

**Examples:** `addPost`, `setSiteName`, `muPlugin`, `debug`

## When to Create Custom vs Built-in Steps

**Create a Custom Step when:**
- You need to combine multiple native steps
- You're adding completely new functionality
- You want to simplify a common workflow

**Create a Built-in Step when:**
- You're enhancing an existing Playground step
- You need to maintain compatibility with native step syntax
- You want to add smart defaults or detection logic

## StepResult Pattern (Current Implementation)

### Overview

Steps now return a `StepResult` object with two methods:
- `toV1()`: Returns an array of v1 blueprint steps (imperative)
- `toV2()`: Returns `V2SchemaFragments` (declarative schema)

This allows each step to define how it should be compiled in both v1 (imperative) and v2 (declarative) modes.

### StepResult Interface

```typescript
interface StepResult {
  toV1(): any[];               // Returns array of native Playground steps
  toV2(): V2SchemaFragments;   // Returns declarative schema fragments
}

interface V2SchemaFragments {
  content?: any[];              // Posts, pages, custom post types
  users?: any[];                // User accounts
  media?: any[];                // Media library files
  plugins?: any[];              // Plugin slugs or installation configs
  themes?: any[];               // Theme slugs or installation configs
  constants?: Record<string, any>;     // wp-config.php constants
  siteOptions?: Record<string, any>;   // WordPress options
  postTypes?: Record<string, any>;     // Custom post type definitions
  additionalSteps?: any[];      // Fallback for imperative operations
}
```

### Step Implementation Example

```typescript
export const addPage: StepFunction<AddPageStep> = (step): StepResult => {
  return {
    toV1() {
      // V1: Generate PHP code to insert the page
      return [{
        step: "runPHP",
        code: `<?php wp_insert_post(...); ?>`
      }];
    },

    toV2(): V2SchemaFragments {
      // V2: Return declarative content
      return {
        content: [{
          type: 'posts',
          source: {
            post_title: step.title,
            post_content: step.content,
            post_type: 'page',
            post_status: 'publish'
          }
        }],
        // Use additionalSteps for operations that can't be declarative
        additionalSteps: step.homepage ? [
          { step: 'runPHP', code: '<?php /* set page_on_front */ ?>' }
        ] : undefined
      };
    }
  };
};
```

## Step Design Patterns

### 1. V1-Only Pattern (Legacy)

Older steps that only return v1 arrays. The compiler handles these automatically:

```typescript
export const muPlugin: StepFunction<MuPluginStep> = (step) => {
  return [
    { step: "mkdir", path: "/wordpress/wp-content/mu-plugins" },
    { step: "writeFile", path: "...", data: step.code }
  ];
};
```

The compiler's `isStepResult()` check determines if a step returns the old array format or the new StepResult format.

### 2. V1 + V2 Pattern (Current)

Steps implementing both compilation modes:

```typescript
export const setSiteName: StepFunction<SetSiteNameStep> = (step): StepResult => {
  return {
    toV1() {
      return [{
        step: "setSiteOptions",
        options: {
          blogname: step.sitename,
          blogdescription: step.tagline
        }
      }];
    },

    toV2(): V2SchemaFragments {
      return {
        siteOptions: {
          blogname: step.sitename,
          blogdescription: step.tagline
        }
      };
    }
  };
};
```

### 3. Content Creation Pattern

Steps that create posts, pages, or media:

```typescript
toV2(): V2SchemaFragments {
  return {
    content: [{
      type: 'posts',
      source: {
        post_title: step.title,
        post_content: step.content,
        post_type: 'page',
        post_status: 'publish'
      }
    }]
  };
}
```

### 4. Hybrid Pattern (Declarative + Imperative)

V2 fragments with fallback to imperative steps:

```typescript
toV2(): V2SchemaFragments {
  return {
    siteOptions: { show_on_front: 'page' },
    // Use additionalSteps when declarative approach isn't enough
    additionalSteps: [{
      step: 'runPHP',
      code: '<?php /* complex logic */ ?>'
    }]
  };
}
```

## Deduplication Strategies

The compiler removes duplicate steps automatically.

### Default: Keep First

First occurrence is kept, duplicates removed.

### Keep Last

Add this PHP comment to keep the last occurrence:

```php
// DEDUP_STRATEGY: keep_last
```

Useful for configuration files or mu-plugins.

## File Organization

```
playground-step-library/
├── steps/                 # Step definitions
│   ├── types.ts          # TypeScript interfaces (StepResult, V2SchemaFragments)
│   ├── addPage.ts        # Individual step files (with toV1/toV2 methods)
│   ├── addPost.ts
│   └── ...
├── src/
│   ├── index.ts          # Main entry point (PlaygroundStepLibrary facade)
│   ├── v1-compiler.ts    # V1 compiler (StepLibraryCompiler)
│   ├── v2-compiler.ts    # V2 compiler (StepLibraryCompilerV2)
│   ├── decompiler.ts     # Blueprint decompiler (BlueprintDecompiler)
│   ├── steps-registry.ts # Step registry (imports all steps)
│   ├── converters/       # V1 ↔ V2 conversion utilities
│   └── frontend/         # Frontend TypeScript modules
│       ├── main.ts       # UI entry point
│       └── blueprint-compilation-controller.ts # V1/V2 mode switcher
├── lib/                  # Compiled JavaScript output
│   └── src/
│       └── frontend/     # Compiled frontend modules
│           └── main.js   # Compiled UI logic
├── bin/
│   ├── cli.js            # Command-line interface
│   ├── generate-docs.js  # Doc generator
│   └── new-step.js       # Step scaffold
├── docs/                 # Generated documentation
└── index.html            # Web UI
```

## Creating a New Step

**1. Generate scaffold:**
```bash
node bin/new-step.js myStepName
```

**2. Implement transformation in `steps/myStepName.ts`:**

**Option A: StepResult Pattern (Recommended for new steps)**
```typescript
export const myStepName: StepFunction<MyStepNameStep> = (step): StepResult => {
  return {
    toV1() {
      // Return array of native Playground steps for v1
      return [
        { step: "runPHP", code: "<?php /* ... */ ?>" }
      ];
    },

    toV2(): V2SchemaFragments {
      // Return declarative schema fragments for v2
      return {
        siteOptions: { myOption: step.value },
        additionalSteps: [] // Optional imperative fallback
      };
    }
  };
};
```

**Option B: Legacy Pattern (For simple steps)**
```typescript
export const myStepName: StepFunction<MyStepNameStep> = (step) => {
  return [
    // Array of native Playground steps
    { step: "runPHP", code: "<?php /* ... */ ?>" }
  ];
};
```

**3. Add metadata:**
```typescript
myStepName.description = "What this step does";
myStepName.vars = [
  {
    name: "myParam",
    description: "Parameter description",
    type: "text",
    required: true,
    samples: ["example1", "example2"]
  }
];
```

**4. Register in `src/steps-registry.ts`:**
```typescript
import { myStepName } from '../steps/myStepName.js';

export const stepsRegistry = {
  // ... other steps
  myStepName,
};
```

**5. Build and test:**
```bash
npm run build
npm test
```

## Dual Compiler Architecture

The library uses a facade pattern with specialized compilers:

- **`PlaygroundStepLibrary`** (src/index.ts) - Main facade providing unified API
- **`StepLibraryCompiler`** (src/v1-compiler.ts) - V1 compilation logic
- **`StepLibraryCompilerV2`** (src/v2-compiler.ts) - V2 compilation logic

### PlaygroundStepLibrary (Facade)

The main entry point that delegates to the appropriate compiler:

```typescript
const compiler = new PlaygroundStepLibrary();

// Delegates to StepLibraryCompiler
const v1Blueprint = compiler.compile(blueprint);

// Delegates to StepLibraryCompilerV2
const v2Blueprint = compiler.compileV2(blueprint);

// Uses decompiler + V2 compiler
const result = compiler.transpile(nativeV1Blueprint);
```

### V1 Compiler (src/v1-compiler.ts)

**Class:** `StepLibraryCompiler`

**Process:**
1. Executes each custom step via `executeCustomStep()`
2. Checks if result is `StepResult` (has `toV1()` method) or legacy array
3. Calls `.toV1()` if StepResult, otherwise uses array directly
4. Flattens all step arrays into a single steps array
5. Applies deduplication strategies
6. Returns final v1 blueprint with `steps` array

### V2 Compiler (src/v2-compiler.ts)

**Class:** `StepLibraryCompilerV2`

**Process:**
1. Executes each custom step
2. Checks if result is `StepResult` (has `toV2()` method)
3. Calls `.toV2()` to get `V2SchemaFragments`
4. Merges all fragments into unified v2 schema:
   - Arrays (`content`, `users`, `media`) are concatenated
   - Objects (`siteOptions`, `constants`) are merged
   - Plugin/theme steps are handled specially (extracts slugs if from wordpress.org)
5. Collects `additionalSteps` into `additionalStepsAfterExecution`
6. Returns final v2 blueprint with declarative schema

### Frontend Integration

The web UI allows users to select which compiler to use:

**File:** `src/frontend/blueprint-compilation-controller.ts`

- Radio buttons to choose v1 or v2 output
- V2 mode adds `experimental-blueprints-v2-runner=yes` query parameter
- Both modes use the same input blueprint format

## Best Practices

### Step Design

1. **Keep steps focused** - One step, one responsibility
2. **Provide good defaults** - Make optional params truly optional
3. **Document with samples** - Include realistic examples
4. **Test edge cases** - Empty strings, special characters, URLs
5. **Implement both toV1() and toV2()** - Support both compiler modes
6. **Add progress captions** - Show what's happening

### Code Quality

1. **Type safety** - Use TypeScript interfaces
2. **Validate inputs** - Check URLs, paths, formats
3. **Handle errors** - Return empty array for invalid input
4. **Avoid injection** - Properly escape user input in generated code
5. **Document behavior** - Clear descriptions and examples

## Performance

- **Compilation is fast**: < 100ms for typical blueprints
- **No external deps**: Runs in browser or Node.js
- **Optimize steps**: Combine operations when possible
- **Use deduplication**: Avoid redundant operations

## Security

### Code Injection Prevention

Be careful with PHP code generation:

```typescript
// Use JSON.stringify for safe escaping
code: `<?php echo ${JSON.stringify(step.text)}; ?>`
```

### URL Validation

Always validate URLs:

```typescript
const urlTest = /^https:\/\/github\.com\/[^\/]+\/[^\/]+/.exec(step.url);
if (!urlTest) {
  return []; // Invalid, return nothing
}
```

## Extension Points

- **Custom steps**: Add to `steps/` directory
- **Blueprint v2**: Automatic transpilation support
- **Query params**: Extract Playground-specific params
- **Progress tracking**: Add captions to steps

## Debugging Tips

**CLI pretty print:**
```bash
node bin/cli.js blueprint.json --pretty
```

**List available steps:**
```bash
node bin/cli.js --list-steps
```

**Inspect compilation:**
```typescript
const compiled = compiler.compile(blueprint);
console.log(JSON.stringify(compiled, null, 2));
```

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Steps Reference](steps-reference.md) - All available steps
- [Built-in Step Usage](builtin-step-usage.md) - Step composition reference
