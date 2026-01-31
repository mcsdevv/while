# Project Instructions

## Package Manager

**Use pnpm exclusively.** This project uses pnpm@10.28.1.

### Prohibited
- `bun` - Do not use bun for any reason
- `npm` - Do not use npm
- `yarn` - Do not use yarn

### Commands
- Install: `pnpm install`
- Add package: `pnpm add <package>`
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`

Never create bun.lock, bun.lockb, package-lock.json, or yarn.lock files.

## Visual Validation

**All UI changes must be visually verified before completion.**

### Required Steps

1. **Start dev server** (if not running):
   ```bash
   pnpm dev  # run in background
   ```

2. **Open in browser** via Chrome MCP tools:
   - `tabs_context_mcp` → get/create tab
   - `navigate` → go to localhost URL

3. **Capture screenshot** to verify visual output:
   - `computer` action: `screenshot`

4. **Check for errors**:
   - `read_console_messages` → JS errors/warnings
   - `read_network_requests` → failed API calls

5. **Inspect specific elements** (if needed):
   - `computer` action: `zoom` → inspect UI regions
   - `read_page` → check accessibility tree
   - `javascript_tool` → query DOM state

### When to Validate

- After any component/styling changes
- After adding new UI features
- Before marking UI tasks complete
- Before committing UI-related code

### Sign-off Criteria

- [ ] Screenshot shows expected visual result
- [ ] No console errors related to changes
- [ ] No failed network requests
- [ ] Interactive elements function correctly

## UI Development Guidelines

**All UI work must be reviewed against both guideline skills before committing.**

For ANY UI changes, run both:
```
/web-interface-guidelines
/vercel-react-best-practices
```

### /web-interface-guidelines
Audits code against 100+ rules covering:
- Accessibility
- Forms
- Animations
- Performance
- Design patterns

### /vercel-react-best-practices
React and Next.js optimization guidelines covering:
- Component performance patterns
- Data fetching strategies
- Bundle optimization
- Server/client component decisions

### When to Run

- Before starting any UI implementation (for guidance)
- After any component/styling changes
- After adding new UI features
- Before committing UI-related code

### Integration with Visual Validation

Run both skills **after** visual validation confirms the UI looks correct. This ensures visual correctness, guideline compliance, and optimal React patterns.

## Semantic Versioning

**Version bumps are automated via semantic-release when PRs merge to main.**

### Commit Message Format
```
<type>[scope]: <description>

[body]

[footer]
```

### Version Bump Rules

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `fix:` | PATCH (0.1.2 → 0.1.3) | Bug fixes |
| `feat:` | MINOR (0.1.2 → 0.2.0) | New features |
| `BREAKING CHANGE:` or `feat!:` | MAJOR (0.1.2 → 1.0.0) | Breaking changes |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:` | No release | Non-user-facing |

### What Happens on Merge
1. GitHub Actions runs semantic-release
2. Analyzes commit messages since last release
3. Determines version bump (if any)
4. Updates `package.json` version
5. Generates/updates `CHANGELOG.md`
6. Creates GitHub release with notes

### Writing Commit Messages
- Use imperative mood: "Add feature" not "Added feature"
- Keep subject under 50 characters
- For breaking changes, add `BREAKING CHANGE:` in footer or `!` after type
