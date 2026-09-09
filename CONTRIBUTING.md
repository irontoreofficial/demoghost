# Contributing to DemoGhost

Thank you for your interest in contributing to DemoGhost!

## Development Setup

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/irontoreofficial/demoghost.git
   cd demoghost
   \`\`\`

2. Install dependencies using pnpm:
   \`\`\`bash
   pnpm install
   \`\`\`

3. Run unit tests:
   \`\`\`bash
   pnpm test
   \`\`\`

4. Run the documentation & playground server:
   \`\`\`bash
   pnpm dev
   \`\`\`

5. Build all packages:
   \`\`\`bash
   pnpm build
   \`\`\`

## Pull Request Guidelines

- Ensure all tests pass (`pnpm test` and `pnpm test:e2e`).
- Ensure no TypeScript errors exist (`pnpm typecheck`).
- Format code using Prettier (`pnpm format`).
- Write meaningful commit messages following Conventional Commits.
