# Contributing

## Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run `bun run lint` and `bun run format`
4. Commit with a conventional commit message
5. Push and open a PR

## Conventional Commits

| Type       | Description                  |
| ---------- | ---------------------------- |
| `feat`     | New feature                  |
| `fix`      | Bug fix                      |
| `chore`    | Maintenance task             |
| `docs`     | Documentation change         |
| `style`    | Formatting change (no logic) |
| `refactor` | Code restructuring           |
| `test`     | Test addition or change      |
| `perf`     | Performance improvement      |

## Code Standards

- TypeScript strict mode
- Functional components
- Reusable utilities
- No inline styles
- No duplicated code
- Clear naming conventions
- JSDoc for public utilities

## Pull Request Process

1. Ensure all checks pass (`lint`, `format`, `typecheck`)
2. Update documentation if needed
3. Request review from at least one team member
4. Merge after approval
