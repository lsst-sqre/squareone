---
'squareone': patch
---

Update Node.js from 22.13.0 to 22.21.1

This infrastructure update brings the latest LTS improvements, bug fixes, and security patches from Node.js 22. Updated in:
- `.nvmrc` for local development environment
- `apps/squareone/Dockerfile` for production Docker builds
- GitHub Actions workflows automatically use the `.nvmrc` version

Developers should run `nvm use` to switch to the new Node.js version locally.
