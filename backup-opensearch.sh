#!/bin/bash

# OpenSearch Data Backup Script
# Creates a backup of your vector database data

set -e

BACKUP_DIR="./backups/$(date +%Y-%m-%d_%H-%M-%S)"
OPENSEARCH_URL="https://localhost:9200"
USERNAME="admin"
PASSWORD="h7F!q9rT#4vL"

echo "🔄 Creating OpenSearch backup..."
mkdir -p "$BACKUP_DIR"

# Export index mappings
echo "📋 Backing up index mappings..."
curl -k -u "$USERNAME:$PASSWORD" \
    -X GET "$OPENSEARCH_URL/_mapping" \
    -H "Content-Type: application/json" \
    > "$BACKUP_DIR/index-mappings.json"

# Export all documents
echo "📄 Backing up all documents..."
curl -k -u "$USERNAME:$PASSWORD" \
    -X GET "$OPENSEARCH_URL/_search?size=1000&scroll=1m" \
    -H "Content-Type: application/json" \
    > "$BACKUP_DIR/all-documents.json"

# Export cluster settings
echo "⚙️ Backing up cluster settings..."
curl -k -u "$USERNAME:$PASSWORD" \
    -X GET "$OPENSEARCH_URL/_cluster/settings" \
    -H "Content-Type: application/json" \
    > "$BACKUP_DIR/cluster-settings.json"

# Create restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
# Restore script for this backup

OPENSEARCH_URL="https://localhost:9200"
USERNAME="admin"
PASSWORD="h7F!q9rT#4vL"

echo "🔄 Restoring OpenSearch backup..."

# Note: This is a basic restore script
# For production, consider using OpenSearch snapshot/restore APIs
echo "⚠️  Manual restore required - use the JSON files to recreate indices"
echo "📄 Files available:"
echo "  - index-mappings.json"
echo "  - all-documents.json"
echo "  - cluster-settings.json"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

echo "✅ Backup completed: $BACKUP_DIR"
echo "📊 Files created:"
ls -la "$BACKUP_DIR"

# Show backup summary
echo ""
echo "📈 Backup Summary:"
echo "  - Mappings: $(wc -c < "$BACKUP_DIR/index-mappings.json") bytes"
echo "  - Documents: $(wc -c < "$BACKUP_DIR/all-documents.json") bytes"
echo "  - Settings: $(wc -c < "$BACKUP_DIR/cluster-settings.json") bytes"