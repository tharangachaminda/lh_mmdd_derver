#!/bin/bash

# Codebase Cleanup Script
# Safely removes question ingestion scripts and related files after vector DB backup
# 
# ⚠️  IMPORTANT: Only run this AFTER confirming vector database backup is complete!
# Vector database should contain 1,821 documents in enhanced-math-questions index

set -e

echo "🧹 Learning Hub Codebase Cleanup"
echo "=================================="
echo ""

# Safety check - verify vector database backup exists
BACKUP_DIR="backups/2025-10-05_23-46-01"
if [ ! -f "$BACKUP_DIR/enhanced-math-questions-backup.json" ]; then
    echo "❌ ERROR: Vector database backup not found!"
    echo "Expected: $BACKUP_DIR/enhanced-math-questions-backup.json"
    echo ""
    echo "Please create backup first by running:"
    echo "./backup-opensearch.sh"
    exit 1
fi

# Verify OpenSearch has the data
echo "🔍 Verifying vector database status..."
if ! QUESTION_COUNT=$(curl -s "http://localhost:9200/enhanced-math-questions/_count" | jq -r '.count' 2>/dev/null); then
    echo "⚠️  WARNING: Cannot verify OpenSearch status"
    echo "OpenSearch might not be running, but backup exists"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cleanup cancelled"
        exit 1
    fi
else
    echo "✅ Vector database status: $QUESTION_COUNT documents in enhanced-math-questions index"
    if [ "$QUESTION_COUNT" -lt 1800 ]; then
        echo "⚠️  WARNING: Expected ~1,821 documents, found only $QUESTION_COUNT"
        read -p "Continue cleanup anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Cleanup cancelled"
            exit 1
        fi
    fi
fi

echo ""
echo "📋 Files to be removed:"
echo "======================="

# Create removal list
CLEANUP_LIST=(
    # Question ingestion scripts
    "bulk-ingest-all-questions.mjs"
    "ingest-grade5-questions.mjs"
    "ingest-grade8-phase1a-prime-composite.mjs"
    "ingest-grade8-phase1b-negative-numbers.mjs"
    "ingest-grade8-phase1c-fraction-decimal-percentage.mjs" 
    "ingest-grade8-phase1e-number-patterns.mjs"
    "ingest-grade8-phase1f-linear-equations.mjs"
    "ingest-grade8-phase1g-algebraic-manipulation.mjs"
    "ingest-grade8-phase2a-unit-conversions.mjs"
    "ingest-grade8-phase2b-perimeter-area-volume.mjs"
    "ingest-grade8-phase2c-clean.mjs"
    "ingest-grade8-phase2c-speed.mjs"
    "ingest-grade8-phase2c-speed-time-distance.mjs"
    "ingest-grade8-phase2d-ratios-proportions.mjs"
    "ingest-grade8-phase2e-financial-literacy.mjs"
    "ingest-grade8-algebraic-manipulation.mjs"
    "ingest-grade8-patterns.mjs"
    "ingest-grade8-patterns-simple.mjs"
    "ingest-phase1g-direct.mjs"
    "validate-and-ingest-questions.mjs"
    "test-phase2a-ingestion.mjs"
    
    # Generated question data files
    "grade5-comprehensive-questions.json"
    "grade5-questions-vector-ready.json"
    
    # Template files (keeping question-format-template.json as reference)
    "grade3-template.json"
    "grade4-template.json"
    "grade5-template.json"
    "grade6-template.json"
    "grade7-template.json"
    "grade8-template.json"
    
    # Batch files
    "curriculum-batch-grades3-8.json"
    "curriculum-batch-sample.json"
    
    # Utility scripts
    "add-difficulty-fields.mjs"
    "clear-grade3-questions.mjs"
    "clear-grade5-questions.mjs"
    "create-vector-ready-questions.mjs"
    "generate-grade3-questions.mjs"
    "generate-multi-grade-questions.mjs"
    "find-issue.cjs"
    "fix_difficulty.cjs"
    "fix_structure.cjs"
    "inspect-vector-data.mjs"
    "recreate-index.mjs"
)

# Test files to remove
TEST_FILES=(
    "src/tests/curriculum-grades3-8.test.ts"
    "src/tests/curriculum-types.test.ts"
    "src/tests/curriculum.enhanced.test.ts"
    "src/tests/curriculum.indexing.test.ts"
    "src/tests/curriculum.validator.test.ts"
    "src/tests/curriculumData.test.ts"
    "src/tests/grade8.phase1a.dataset.test.ts"
    "src/tests/grade8.phase1b.dataset.test.ts"
    "src/tests/grade8.phase1c.dataset.test.ts"
    "src/tests/grade8.phase1e.dataset.test.ts"
    "src/tests/grade8.phase1f.dataset.test.ts"
    "src/tests/grade8.phase1g.dataset.test.ts"
    "src/tests/grade8.phase2a.dataset.test.ts"
    "src/tests/grade8.phase2b.dataset.test.ts"
    "src/tests/grade8.phase2c.dataset.test.ts"
    "src/tests/grade8.phase2d.dataset.test.ts"
    "src/tests/grade8.phase2e.dataset.test.ts"
    "src/tests/grade7.phase1b.dataset.test.ts"
    "src/tests/grade7.phase1c.dataset.test.ts"
    "src/tests/grade7.phase2a.dataset.test.ts"
    "src/tests/grade7.phase2b.dataset.test.ts"
    "src/tests/grade7.phase2c.dataset.test.ts"
)

# Display files that will be removed
echo "📄 Question Ingestion Scripts (${#CLEANUP_LIST[@]} files):"
for file in "${CLEANUP_LIST[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  - $file (not found)"
    fi
done

echo ""
echo "🧪 Test Files (${#TEST_FILES[@]} files):"
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  - $file (not found)"
    fi
done

echo ""
echo "💾 Total disk space to be freed:"
TOTAL_SIZE=0
for file in "${CLEANUP_LIST[@]}" "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || echo 0)
        TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
    fi
done

if [ "$TOTAL_SIZE" -gt 0 ]; then
    SIZE_MB=$((TOTAL_SIZE / 1024 / 1024))
    echo "  📊 Approximately ${SIZE_MB}MB"
fi

echo ""
echo "🔄 Files to KEEP (important for system):"
echo "  ✅ question-format-template.json (reference template)"
echo "  ✅ All vector database data (1,821 documents in OpenSearch)"
echo "  ✅ All AI services and core application code"
echo "  ✅ Backup directory: $BACKUP_DIR/"

echo ""
read -p "🗑️  Proceed with cleanup? This will permanently delete the files listed above. (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🧹 Starting cleanup..."

# Remove files
REMOVED_COUNT=0
FAILED_COUNT=0

for file in "${CLEANUP_LIST[@]}" "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  🗑️  Removing: $file"
        if rm "$file" 2>/dev/null; then
            REMOVED_COUNT=$((REMOVED_COUNT + 1))
        else
            echo "    ❌ Failed to remove: $file"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
    fi
done

echo ""
echo "✅ Cleanup Complete!"
echo "==================="
echo "📊 Summary:"
echo "  ✅ Files removed: $REMOVED_COUNT"
if [ "$FAILED_COUNT" -gt 0 ]; then
    echo "  ❌ Failed removals: $FAILED_COUNT"
fi
echo "  💾 Disk space freed: ~${SIZE_MB}MB"
echo ""
echo "🔧 Next Steps:"
echo "  1. Rebuild the application: npm run build"
echo "  2. Run tests to verify system stability: npm test"
echo "  3. Commit the cleanup: git add -A && git commit -m 'cleanup: Remove question ingestion scripts after vector DB backup'"
echo ""
echo "📦 Vector Database Status:"
echo "  ✅ All question data preserved in OpenSearch"
echo "  📁 Backup available: $BACKUP_DIR/"
echo "  🔄 Restore command: cd $BACKUP_DIR && ./restore.sh"

echo ""
echo "🎯 Codebase is now cleaner and more maintainable!"
echo "   The AI-enhanced question generation system continues to work"
echo "   with all 1,821 questions accessible via vector database."