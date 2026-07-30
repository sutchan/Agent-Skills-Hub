---
name: run-tests
description: Run the project's test suite including unit tests, component tests, and end-to-end tests. Use when you want to verify code functionality.
license: MIT
compatibility: Requires npm and Jest/Playwright.
metadata:
  author: AppForge Team
  version: "1.0"
  generatedBy: "1.0.0"
---

Run the project's comprehensive test suite to verify code functionality.

**Steps**

1. **Run unit tests**
   ```bash
   npm test
   ```

2. **Run component tests**
   ```bash
   npm run test:components
   ```

3. **Run end-to-end tests** (if configured)
   ```bash
   npm run e2e
   ```

**Output**

- Test results summary
- Coverage report (if configured)
- Failed tests details
- Overall test status

**When to use**

- After implementing new features
- After fixing bugs
- Before merging changes
- As part of CI/CD pipeline
