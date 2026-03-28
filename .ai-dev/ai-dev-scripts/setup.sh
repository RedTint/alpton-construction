#!/usr/bin/env bash
# setup.sh — Scaffold documentation structure for a new AI Dev Agency project
# Usage: bash .ai-dev/ai-dev-scripts/setup.sh [--project-name "My Project"]
# Called by /setup and /review-and-setup skills

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates/docs"
DOCS_DIR="./docs"

# ── Parse arguments ────────────────────────────────────────────────────────────
PROJECT_NAME="{{PROJECT_NAME}}"
DATE=$(date +"%Y-%m-%d")

while [[ $# -gt 0 ]]; do
  case $1 in
    --project-name)
      PROJECT_NAME="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# ── Helper: copy and substitute placeholders ───────────────────────────────────
copy_template() {
  local src="$1"
  local dest="$2"

  if [[ -f "$dest" ]]; then
    echo "  ⚠️  Skip (exists): $dest"
    return
  fi

  mkdir -p "$(dirname "$dest")"
  sed \
    -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
    -e "s/{{DATE}}/$DATE/g" \
    "$src" > "$dest"
  echo "  ✅ Created: $dest"
}

# ── Create directory structure ─────────────────────────────────────────────────
echo ""
echo "📁 Creating directory structure..."
mkdir -p \
  "$DOCS_DIR/progress" \
  "$DOCS_DIR/releases" \
  "$DOCS_DIR/adr" \
  "$DOCS_DIR/epics"
echo "  ✅ docs/ structure created"

# ── Copy templates ─────────────────────────────────────────────────────────────
echo ""
echo "📄 Copying documentation templates..."

copy_template "$TEMPLATES_DIR/000-README.md"                  "$DOCS_DIR/000-README.md"
copy_template "$TEMPLATES_DIR/001-project-init.md"            "$DOCS_DIR/001-project-init.md"
copy_template "$TEMPLATES_DIR/002-prd-v1.0.0.md"              "$DOCS_DIR/002-prd-v1.0.0.md"
copy_template "$TEMPLATES_DIR/100-userflows-v1.0.0.md"        "$DOCS_DIR/100-userflows-v1.0.0.md"
copy_template "$TEMPLATES_DIR/125-design-system-v1.0.0.md"    "$DOCS_DIR/125-design-system-v1.0.0.md"
copy_template "$TEMPLATES_DIR/150-tech-stacks-v1.0.0.md"      "$DOCS_DIR/150-tech-stacks-v1.0.0.md"
copy_template "$TEMPLATES_DIR/175-c4-diagrams-v1.0.0.md"      "$DOCS_DIR/175-c4-diagrams-v1.0.0.md"
copy_template "$TEMPLATES_DIR/200-atomic-stories-v1.0.0.md"   "$DOCS_DIR/200-atomic-stories-v1.0.0.md"
copy_template "$TEMPLATES_DIR/300-frontend-v1.0.0.md"         "$DOCS_DIR/300-frontend-v1.0.0.md"
copy_template "$TEMPLATES_DIR/325-backend-v1.0.0.md"          "$DOCS_DIR/325-backend-v1.0.0.md"
copy_template "$TEMPLATES_DIR/350-api-contract-v1.0.0.md"     "$DOCS_DIR/350-api-contract-v1.0.0.md"
copy_template "$TEMPLATES_DIR/375-database-schema-v1.0.0.md"  "$DOCS_DIR/375-database-schema-v1.0.0.md"
copy_template "$TEMPLATES_DIR/400-testing-strategy-v1.0.0.md" "$DOCS_DIR/400-testing-strategy-v1.0.0.md"
copy_template "$TEMPLATES_DIR/425-devops-v1.0.0.md"           "$DOCS_DIR/425-devops-v1.0.0.md"
copy_template "$TEMPLATES_DIR/450-workers-v1.0.0.md"          "$DOCS_DIR/450-workers-v1.0.0.md"
copy_template "$TEMPLATES_DIR/adr/000-README.md"              "$DOCS_DIR/adr/000-README.md"
copy_template "$TEMPLATES_DIR/epics/README.md"                "$DOCS_DIR/epics/README.md"
copy_template "$TEMPLATES_DIR/progress/000-progress-v1.0.0.md" "$DOCS_DIR/progress/000-progress-v1.0.0.md"
copy_template "$TEMPLATES_DIR/releases/release-v0.0.1.md"    "$DOCS_DIR/releases/release-v0.0.1.md"

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo "✅ Documentation structure initialized!"
echo ""
echo "📁 docs/"
find "$DOCS_DIR" -type f -name "*.md" | sort | sed "s|$DOCS_DIR/||" | sed 's/^/   ├── /'
echo ""
echo "🎯 Next Steps:"
echo "   1. Fill out docs/001-project-init.md with your project vision"
echo "   2. Run /define @002-prd-v1.0.0.md to formalize requirements"
echo "   3. Run /new-feature {description} to create your first stories"
echo ""
