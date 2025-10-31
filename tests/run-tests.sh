#!/bin/bash

# Fire Enrich - Test Runner Script
# Runs E2E tests with simulated Gemini responses

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        Fire Enrich - Gemini Integration Tests             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo "⚠️  tsx not found. Installing..."
    npm install -g tsx
fi

# Run the test suite
echo "🚀 Running E2E tests with mock Gemini service..."
echo ""

tsx tests/e2e/gemini-integration.test.ts

echo ""
echo "✅ Test run complete!"
