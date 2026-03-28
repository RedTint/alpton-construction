#!/usr/bin/env bash
# client-new-setup.sh — Scaffold a new client folder under docs/clients/
#
# Usage:
#   bash .ai-dev/ai-dev-scripts/client-new-setup.sh --client-name "Acme Corp"
#   bash .ai-dev/ai-dev-scripts/client-new-setup.sh --client-name "Acme Corp" --client-id 003
#
# What it does:
#   1. Determines next client ID (auto-increments from existing folders)
#   2. Converts client name to a URL-safe slug
#   3. Scaffolds docs/clients/{ID}-{slug}/ from templates
#   4. Updates docs/clients/README.md index
#
# Called by: /client-new skill
# Templates:  .ai-dev/ai-dev-scripts/templates/clients/
#   000.README.md, 001.client-profile.md, 002.client-deliverables.md,
#   003.client-context.md, 004.client-issues.md,
#   meetings/README.md, meetings/meeting-note.md (used by /client-update --add-meeting)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates/clients"
CLIENTS_DIR="./docs/clients"
DATE=$(date +"%Y-%m-%d")

# ── Parse arguments ─────────────────────────────────────────────────────────────
CLIENT_NAME=""
CLIENT_ID=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --client-name)
      CLIENT_NAME="$2"
      shift 2
      ;;
    --client-id)
      CLIENT_ID="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# ── Validate ────────────────────────────────────────────────────────────────────
if [[ -z "$CLIENT_NAME" ]]; then
  echo "❌ Error: --client-name is required"
  echo "   Usage: bash client-new-setup.sh --client-name \"Acme Corp\""
  exit 1
fi

# ── Derive slug ─────────────────────────────────────────────────────────────────
# "Acme Corp" → "acme-corp"
CLIENT_SLUG=$(echo "$CLIENT_NAME" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9]/-/g' \
  | sed 's/--*/-/g' \
  | sed 's/^-//;s/-$//')

# ── Determine next client ID ────────────────────────────────────────────────────
if [[ -z "$CLIENT_ID" ]]; then
  mkdir -p "$CLIENTS_DIR"
  # Find highest existing numeric prefix across all client folders
  LAST_ID=$(ls -d "$CLIENTS_DIR"/[0-9][0-9][0-9]-* 2>/dev/null \
    | grep -oE '^[^/]*/[0-9]+' \
    | grep -oE '[0-9]+$' \
    | sort -n \
    | tail -1)
  if [[ -z "$LAST_ID" ]]; then
    NEXT_NUM=1
  else
    NEXT_NUM=$((10#$LAST_ID + 1))
  fi
  CLIENT_ID=$(printf "%03d" "$NEXT_NUM")
fi

CLIENT_DIR="$CLIENTS_DIR/${CLIENT_ID}-${CLIENT_SLUG}"

# ── Guard: already exists ───────────────────────────────────────────────────────
if [[ -d "$CLIENT_DIR" ]]; then
  echo "⚠️  Client folder already exists: $CLIENT_DIR"
  echo "   No changes made."
  exit 0
fi

# ── Helper: copy template with placeholder substitution ────────────────────────
copy_template() {
  local src="$1"
  local dest="$2"

  mkdir -p "$(dirname "$dest")"
  sed \
    -e "s/{{CLIENT_NAME}}/$CLIENT_NAME/g" \
    -e "s/{{CLIENT_ID}}/$CLIENT_ID/g" \
    -e "s/{{CLIENT_SLUG}}/$CLIENT_SLUG/g" \
    -e "s/{{DATE}}/$DATE/g" \
    "$src" > "$dest"
  echo "  ✅ Created: $dest"
}

# ── Scaffold client folder ──────────────────────────────────────────────────────
echo ""
echo "📁 Scaffolding client: $CLIENT_NAME ($CLIENT_ID)"
echo "   Folder: $CLIENT_DIR"
echo ""

mkdir -p "$CLIENT_DIR/meetings"

copy_template "$TEMPLATES_DIR/000.README.md"           "$CLIENT_DIR/000.README.md"
copy_template "$TEMPLATES_DIR/001.client-profile.md"   "$CLIENT_DIR/001.client-profile.md"
copy_template "$TEMPLATES_DIR/002.client-deliverables.md" "$CLIENT_DIR/002.client-deliverables.md"
copy_template "$TEMPLATES_DIR/003.client-context.md"   "$CLIENT_DIR/003.client-context.md"
copy_template "$TEMPLATES_DIR/004.client-issues.md"    "$CLIENT_DIR/004.client-issues.md"
copy_template "$TEMPLATES_DIR/meetings/README.md"      "$CLIENT_DIR/meetings/README.md"

# ── Update docs/clients/README.md index ────────────────────────────────────────
INDEX_FILE="$CLIENTS_DIR/README.md"

if [[ ! -f "$INDEX_FILE" ]]; then
  # Bootstrap the index if it doesn't exist
  cat > "$INDEX_FILE" << EOF
# Client Index

**Last Updated:** $DATE
**Total Clients:** 0
**Active:** 0 | **On Hold:** 0 | **Completed:** 0 | **Archived:** 0

---

## Active Clients

| # | Client | Status | Active Deliverables | Open Issues | Last Updated |
|---|--------|--------|---------------------|-------------|--------------|

---

## On Hold

*(none)*

---

## Completed

*(none)*

---

## Archived

*(none)*
EOF
  echo "  ✅ Created: $INDEX_FILE"
fi

# Insert new row into the Active Clients table
# Find the header row + separator, insert new data row after it
NEW_ROW="| $CLIENT_ID | [$CLIENT_NAME](./${CLIENT_ID}-${CLIENT_SLUG}/000.README.md) | Active | 0 | 0 | $DATE |"

# Use awk to insert the new row after the table header separator line inside ## Active Clients
awk -v row="$NEW_ROW" '
  /^\| # \| Client \|/ { print; getline; print; print row; next }
  { print }
' "$INDEX_FILE" > "${INDEX_FILE}.tmp" && mv "${INDEX_FILE}.tmp" "$INDEX_FILE"

# Update total count in the header
TOTAL=$(ls -d "$CLIENTS_DIR"/[0-9][0-9][0-9]-* 2>/dev/null | wc -l | tr -d ' ')
sed -i.bak "s/\*\*Total Clients:\*\* [0-9]*/\*\*Total Clients:\*\* $TOTAL/" "$INDEX_FILE"
sed -i.bak "s/\*\*Active:\*\* [0-9]*/\*\*Active:\*\* $TOTAL/" "$INDEX_FILE"
sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $DATE/" "$INDEX_FILE"
rm -f "${INDEX_FILE}.bak"

echo "  ✅ Updated: $INDEX_FILE"

# ── Print output for skill to consume ──────────────────────────────────────────
echo ""
echo "CLIENT_DIR=$CLIENT_DIR"
echo "CLIENT_ID=$CLIENT_ID"
echo "CLIENT_SLUG=$CLIENT_SLUG"
echo ""
echo "✅ Client '$CLIENT_NAME' scaffolded successfully!"
echo ""
echo "📁 $CLIENT_DIR/"
echo "   ├── 000.README.md"
echo "   ├── 001.client-profile.md"
echo "   ├── 002.client-deliverables.md"
echo "   ├── 003.client-context.md"
echo "   ├── 004.client-issues.md"
echo "   └── meetings/"
echo "       └── README.md"
echo ""
echo "🎯 Next Steps:"
echo "   1. Fill in 001.client-profile.md with client details"
echo "   2. Add deliverables: /client-update --add-issue or edit 002.client-deliverables.md"
echo "   3. Review before working: /client-review $CLIENT_SLUG"
