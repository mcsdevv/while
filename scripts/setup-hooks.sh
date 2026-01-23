#!/usr/bin/env bash

# Setup Git Hooks
# This script installs git hooks to ensure code quality before commits

set -e

echo "🔧 Setting up git hooks..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/usr/bin/env sh

# Pre-commit hook to ensure code quality
# This hook runs linting and formatting before each commit

echo "🔍 Running pre-commit checks..."

# Find bun executable
BUN_CMD=""
if command -v bun >/dev/null 2>&1; then
  BUN_CMD="bun"
elif [ -f "$HOME/.bun/bin/bun" ]; then
  BUN_CMD="$HOME/.bun/bin/bun"
else
  echo "❌ bun not found in PATH. Please install bun or ensure it's in your PATH."
  exit 1
fi

# Run biome lint with auto-fix
echo "📝 Formatting and linting code..."
$BUN_CMD run lint:fix

# Stage any changes made by the formatter
git add -u

# Check if there are still linting errors
echo "✅ Verifying lint status..."
if ! $BUN_CMD run lint; then
  echo "❌ Linting failed. Please fix the errors manually and try again."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "💡 The pre-commit hook will now:"
echo "   1. Auto-format your code with biome"
echo "   2. Run linting checks"
echo "   3. Prevent commits if linting fails"
echo ""
echo "To bypass the hook (not recommended): git commit --no-verify"
