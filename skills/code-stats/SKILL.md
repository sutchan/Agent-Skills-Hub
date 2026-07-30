---
name: code-stats
description: Generate code statistics and analysis reports. Use when you want to understand the codebase structure and metrics.
license: MIT
compatibility: Requires npm and code analysis tools.
metadata:
  author: AppForge Team
  version: "1.0"
  generatedBy: "1.0.0"
---

Generate comprehensive code statistics and analysis reports to understand the codebase structure.

**Steps**

1. **Count lines of code**
   ```bash
   npx cloc src
   ```

2. **Analyze code complexity**
   ```bash
   npx plato -r -d reports src
   ```

3. **Generate code quality report**
   ```bash
   npx sonarqube-scanner
   ```

**Output**

- Lines of code by file type
- Code complexity analysis
- Code quality metrics
- Code structure visualization

**When to use**

- During code reviews
- When planning refactoring
- To track codebase growth
- As part of project documentation
