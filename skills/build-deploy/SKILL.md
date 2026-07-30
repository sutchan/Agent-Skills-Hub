---
name: build-deploy
description: Build and deploy the project to different environments. Use when you want to prepare the project for deployment.
license: MIT
compatibility: Requires npm and Next.js.
metadata:
  author: AppForge Team
  version: "1.0"
  generatedBy: "1.0.0"
---

Build and deploy the project to different environments.

**Steps**

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Start production server** (local testing)
   ```bash
   npm start
   ```

**Output**

- Build status
- Production server URL
- Deployment readiness check
- Any build errors

**When to use**

- Before deploying to production
- To test production build locally
- After making significant changes
- As part of deployment pipeline
