---
name: code-quality-check
description: Run code quality checks including linting, type checking, and code formatting. Use when you want to ensure code follows project standards.
license: MIT
compatibility: Requires npm and TypeScript.
metadata:
  author: AppForge Team
  version: "1.0"
  generatedBy: "1.0.0"
---

Run comprehensive code quality checks to ensure code follows project standards.

**Steps**

1. **Run ESLint for linting**
   ```bash
   npm run lint
   ```

2. **Run TypeScript type checking**
   ```bash
   npx tsc --noEmit
   ```

3. **Check code formatting**
   ```bash
   npx prettier --check .
   ```

**Output**

- Summary of linting errors (if any)
- TypeScript type errors (if any)
- Formatting issues (if any)
- Overall code quality status

**When to use**

- Before committing code
- Before creating a pull request
- As part of regular code reviews
- After making significant changes to the codebase
