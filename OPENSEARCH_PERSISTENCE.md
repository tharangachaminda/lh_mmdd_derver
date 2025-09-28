# Docker Compose Usage for OpenSearch

## 📁 Data Persistence Setup

This Docker Compose configuration ensures your OpenSearch data persists between container restarts.

### 🚀 **Quick Start**

```bash
# Start OpenSearch with persistent storage
docker-compose up -d

# Stop without losing data
docker-compose down

# View logs
docker-compose logs opensearch

# Check container status
docker-compose ps
```

### 📊 **Data Directories**

The following directories will be created automatically:

-   `./opensearch-data/` - All your vector database data, indices, and documents
-   `./opensearch-logs/` - OpenSearch service logs

**⚠️ Important**: Add these to `.gitignore` to avoid committing large data files.

### 🔒 **Security Configuration**

Current setup:

-   Security plugin enabled
-   Default credentials: `admin` / `admin`
-   HTTPS enabled on port 9200
-   Dashboards available on port 5601

### 🔄 **Migration from Existing Container**

If you have data in a running container, migrate it:

```bash
# 1. Export existing data (if any)
node vector-db-summary.mjs > current-data-backup.json

# 2. Stop current container
docker stop <current-container-id>

# 3. Start with Docker Compose
docker-compose up -d

# 4. Re-run ingestion to restore data
node store-questions-direct.mjs
```

### 📈 **Monitoring**

-   **OpenSearch**: http://localhost:9200/\_cluster/health
-   **Dashboards**: http://localhost:5601 (admin/admin)
-   **Data Directory**: Check `./opensearch-data/` size for storage usage

### 🛠️ **Troubleshooting**

```bash
# Check OpenSearch health
curl -k -u admin:admin https://localhost:9200/_cluster/health

# View container logs
docker-compose logs opensearch

# Reset data (⚠️ DANGER: Deletes all data)
docker-compose down -v
rm -rf opensearch-data opensearch-logs
```
