---
name: dependency-management
description: Manage project dependencies including checking for updates and security vulnerabilities. Use when you want to ensure dependencies are up-to-date and secure.
license: MIT
compatibility: Requires npm or yarn.
metadata:
  author: AppForge Team
  version: "1.0"
  generatedBy: "1.0.0"
---

Manage project dependencies to ensure they are up-to-date and secure.

**Steps**

1. **Check for outdated dependencies**
   ```bash
   npm outdated
   ```

2. **Check for security vulnerabilities**
   ```bash
   npm audit
   ```

3. **Update dependencies** (optional)
   ```bash
   npm update
   ```

**Output**

- Outdated dependencies list
- Security vulnerabilities report
- Update status
- Recommendations for dependency management

**When to use**

- Regularly to maintain security
- Before major releases
- When encountering dependency issues
- As part of routine maintenance
