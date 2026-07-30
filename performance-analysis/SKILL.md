---
name: performance-analysis
description: Analyze project performance including bundle size and load times. Use when you want to optimize performance.
license: MIT
compatibility: Requires npm and Next.js.
metadata:
  author: AppForge Team
  version: "1.0"
  generatedBy: "1.0.0"
---

Analyze project performance to identify optimization opportunities.

**Steps**

1. **Analyze bundle size**
   ```bash
   npm run build -- --analyze
   ```

2. **Run Lighthouse audit**
   ```bash
   npx lighthouse http://localhost:3000 --output=html
   ```

3. **Check performance metrics**
   ```bash
   npx webpack-bundle-analyzer .next/stats.json
   ```

**Output**

- Bundle size analysis
- Lighthouse performance report
- Webpack bundle breakdown
- Performance optimization recommendations

**When to use**

- Before production deployments
- After adding new features
- When performance issues are reported
- As part of regular optimization
