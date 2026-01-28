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

## Web Interface Guidelines

**All UI changes must be reviewed against Web Interface Guidelines before committing.**

After making UI changes, run:
```
/web-interface-guidelines
```

This audits code against 100+ rules covering:
- Accessibility
- Forms
- Animations
- Performance
- Design patterns

### When to Run

- After any component/styling changes
- After adding new UI features
- Before committing UI-related code

### Integration with Visual Validation

Run `/web-interface-guidelines` **after** visual validation confirms the UI looks correct. This ensures both visual correctness and guideline compliance.
