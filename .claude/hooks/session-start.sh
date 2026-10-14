#!/usr/bin/env bash
# Reinstall the studio toolkit in fresh cloud sessions (containers start clean).
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
"$CLAUDE_PROJECT_DIR/studio/setup.sh"
