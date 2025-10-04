import { OpenSearchService } from './src/services/opensearch.service.js';

async function recreateIndex() {
    const service = new OpenSearchService();

    console.log('Deleting existing index...');
    try {
        await service.client.indices.delete({ index: 'enhanced_questions' });
        console.log('✅ Index deleted successfully');
    } catch (error) {
        console.log('Index may not exist or deletion failed:', error.message);
    }

    console.log('Recreating index with correct dimensions...');
    await service.initializeEnhancedIndex();
    console.log('✅ Index recreated successfully');

    // Test the index
    const info = await service.getIndexInfo();
    console.log('Index info:', JSON.stringify(info, null, 2));
}

recreateIndex().catch(console.error);