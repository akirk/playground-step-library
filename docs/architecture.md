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

The Step Library is a **compiler** that transforms blueprints containing custom, high-level steps into blueprints containing only native WordPress Playground steps.

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
│  (Transformation)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Native Blueprint   │
│  (Playground steps) │
└─────────────────────┘
```

### Compilation Steps

1. **Parse Input** - Validates blueprint structure and step definitions
2. **Transform Steps** - Each custom step is transformed into one or more native steps
3. **Variable Substitution** - Variables are replaced throughout the transformed steps
4. **Deduplication** - Identical steps are merged (configurable via strategies)
5. **Output Generation** - Final blueprint with only native steps

### Example Transformation

**Input (Custom Step):**
```json
{
  "step": "addPost",
  "title": "Welcome",
  "content": "<p>Hello World!</p>",
  "type": "page"
}
```

**Output (Native Steps):**
```json
{
  "step": "runPHP",
  "code": "<?php require_once '/wordpress/wp-load.php'; ..."
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

## Step Design Patterns

### 1. Single Step Transformation

One custom step becomes one native step:

```typescript
export const setSiteName: StepFunction<SetSiteNameStep> = (step) => {
  return [{
    step: "setSiteOptions",
    options: {
      blogname: step.sitename,
      blogdescription: step.tagline
    }
  }];
};
```

### 2. Multi-Step Composition

Custom steps return multiple native steps:

```typescript
export const muPlugin: StepFunction<MuPluginStep> = (step) => {
  return [
    { step: "mkdir", path: "/wordpress/wp-content/mu-plugins" },
    { step: "writeFile", path: "...", data: step.code }
  ];
};
```

### 3. Conditional Transformation

Steps with logic based on parameters:

```typescript
export const installPlugin: StepFunction<InstallPluginStep> = (step) => {
  // GitHub PR detection
  if (step.url.match(/github.com\/.*\/pull\//)) {
    return githubPlugin({ ... });
  }
  
  // WordPress.org default
  return [{ step: "installPlugin", ... }];
};
```

### 4. Step Delegation

Built-in steps delegate to specialized steps:

```typescript
// installPlugin → githubPlugin (for GitHub URLs)
// installPlugin → githubPluginRelease (for releases)
// installPlugin → standard install (for WP.org)
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
│   ├── types.ts          # TypeScript interfaces
│   ├── addPost.ts        # Individual step files
│   └── ...
├── src/
│   ├── index.ts          # Main compiler
│   ├── steps-registry.ts # Auto-generated registry
│   ├── v2-transpiler.ts  # Blueprint v2 support
│   └── frontend/         # Frontend TypeScript modules
│       └── main.ts       # UI entry point
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
```typescript
export const myStepName: StepFunction<MyStepNameStep> = (step) => {
  return [
    // Array of native Playground steps
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

**4. Build and test:**
```bash
npm run build
npm test
```

## Best Practices

### Step Design

1. **Keep steps focused** - One step, one responsibility
2. **Provide good defaults** - Make optional params truly optional
3. **Document with samples** - Include realistic examples
4. **Test edge cases** - Empty strings, special characters, URLs
5. **Reuse existing steps** - Compose rather than duplicate
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
