# OpenSearch SSL Error Fix

**Date:** October 8, 2025  
**Issue:** SSL Wrong Version Number Error  
**Status:** ✅ RESOLVED

## 🐛 Error Reported

```
Vector search error: TypeError: fetch failed
    at async AIEnhancedQuestionsService.performRealVectorSearch
  [cause]: [Error: C0A02AF001000000:error:0A00010B:SSL routines:ssl3_get_record:wrong version number
  ] {
    library: 'SSL routines',
    reason: 'wrong version number',
    code: 'ERR_SSL_WRONG_VERSION_NUMBER'
  }
```

## 🔍 Root Cause

### Configuration Mismatch
- **`.env` file:** `OPENSEARCH_NODE=https://localhost:9200` (HTTPS)
- **OpenSearch running on:** `http://localhost:9200` (HTTP)
- **Result:** Node.js fetch trying to establish SSL/TLS connection to non-SSL server

### Why This Happens
OpenSearch can run in two modes:
1. **HTTP mode** (development) - No SSL certificates
2. **HTTPS mode** (production) - With SSL certificates

The error `ssl3_get_record:wrong version number` occurs when:
- Client expects HTTPS but server responds with HTTP
- SSL handshake fails because server sends HTTP headers instead of SSL handshake

## ✅ Solution Implemented

### 1. **Fixed `.env` Configuration**

**Before:**
```properties
OPENSEARCH_NODE=https://localhost:9200  # ❌ HTTPS
```

**After:**
```properties
OPENSEARCH_NODE=http://localhost:9200   # ✅ HTTP
```

### 2. **Added Auto-Correction in Code**

```typescript
// Force HTTP for local development to avoid SSL issues
let opensearchUrl = process.env.OPENSEARCH_NODE || "http://localhost:9200";

// Ensure we're using HTTP (not HTTPS) for localhost
if (opensearchUrl.includes("localhost") || opensearchUrl.includes("127.0.0.1")) {
    opensearchUrl = opensearchUrl.replace("https://", "http://");
}
```

**Benefits:**
- ✅ Automatically corrects HTTPS → HTTP for localhost
- ✅ Prevents user configuration errors
- ✅ Works even if `.env` has HTTPS by mistake

### 3. **Enhanced Error Handling**

```typescript
catch (error: any) {
    // Handle SSL/TLS errors specifically
    if (error.code === 'ERR_SSL_WRONG_VERSION_NUMBER' || 
        error.cause?.code === 'ERR_SSL_WRONG_VERSION_NUMBER') {
        console.warn("⚠️  SSL Error: OpenSearch appears to be running on HTTP, not HTTPS.");
        console.warn("   Try setting OPENSEARCH_NODE=http://localhost:9200 in your environment.");
    } else if (error.code === 'ECONNREFUSED') {
        console.warn("⚠️  Connection refused: OpenSearch may not be running on the configured port.");
    } else {
        console.warn("⚠️  Vector search error:", error.message || error);
    }
    return 0.65; // Error fallback score
}
```

**Benefits:**
- ✅ Clear error messages for SSL issues
- ✅ Helpful guidance for users
- ✅ Graceful fallback (doesn't crash)

### 4. **Added Debug Logging**

```typescript
console.log(`🔍 Connecting to OpenSearch at: ${opensearchUrl}`);
```

**Benefits:**
- ✅ Confirms which URL is being used
- ✅ Helps debug configuration issues

## 📊 Impact

### Before Fix
```
❌ Vector search fails with SSL error
❌ Application continues but with degraded quality scores
❌ Confusing error message for developers
```

### After Fix
```
✅ Vector search succeeds
✅ Correct quality metrics calculated
✅ Clear error messages if issues occur
✅ Auto-correction for common misconfigurations
```

## 🧪 Testing

### Test 1: OpenSearch Connection
```bash
# Check OpenSearch is accessible on HTTP
curl http://localhost:9200/_cluster/health

# Should return:
{"cluster_name":"...","status":"yellow"...}
```

### Test 2: Application Startup
```bash
npm run build
node dist/index.js

# Look for log:
🔍 Connecting to OpenSearch at: http://localhost:9200
✅ OpenSearch cluster healthy: yellow status, 1 nodes
```

### Test 3: Question Generation
```bash
# Generate questions via API
# Should see:
✅ Real vector search: X similar questions found, score: 0.XXX
```

## 🚀 Production Considerations

### Local Development (Current)
- ✅ Use HTTP: `OPENSEARCH_NODE=http://localhost:9200`
- ✅ No SSL certificates needed
- ✅ Faster setup

### Production Deployment
If deploying to production with HTTPS:

1. **Update `.env` for production:**
```properties
OPENSEARCH_NODE=https://your-domain.com:9200
```

2. **Ensure valid SSL certificate:**
- Use Let's Encrypt or proper CA-signed cert
- OpenSearch must be configured with SSL

3. **Remove auto-HTTP conversion:**
```typescript
// In production, respect HTTPS URLs
if (process.env.NODE_ENV !== 'production' && 
    (opensearchUrl.includes("localhost") || opensearchUrl.includes("127.0.0.1"))) {
    opensearchUrl = opensearchUrl.replace("https://", "http://");
}
```

## 📝 Files Modified

1. **`.env`**
   - Changed: `https://localhost:9200` → `http://localhost:9200`
   - Added comment explaining HTTP vs HTTPS

2. **`src/services/questions-ai-enhanced.service.ts`**
   - Added auto-correction for localhost URLs
   - Enhanced error handling with specific SSL error detection
   - Added debug logging for connection URL

## ✅ Verification Checklist

- [x] `.env` uses `http://localhost:9200`
- [x] Code auto-corrects https→http for localhost
- [x] Error handling catches SSL errors specifically
- [x] Debug logging shows connection URL
- [x] TypeScript compiles without errors
- [x] OpenSearch health check succeeds
- [x] Vector search returns valid scores

## 🎯 Resolution

**Issue:** SSL version number error when connecting to OpenSearch  
**Cause:** Configuration mismatch (HTTPS in config, HTTP in server)  
**Fix:** Changed `.env` to HTTP + added auto-correction + improved errors  
**Result:** ✅ OpenSearch connection working, vector search functional

---

**Note:** This fix ensures the application works correctly in local development. For production deployment with HTTPS, additional SSL configuration will be needed.
