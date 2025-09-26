import fs from "fs/promises";
import { CurriculumContent } from "../models/curriculum.js";

/**
 * Loads curriculum data from a JSON file
 * @param filePath - Absolute path to the JSON file
 * @returns Promise resolving to CurriculumContent object
 */
export async function loadCurriculumFromJSON(filePath: string): Promise<CurriculumContent> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        // Convert date strings to Date objects if they exist
        if (jsonData.createdAt) {
            jsonData.createdAt = new Date(jsonData.createdAt);
        }
        if (jsonData.updatedAt) {
            jsonData.updatedAt = new Date(jsonData.updatedAt);
        }
        
        return jsonData as CurriculumContent;
    } catch (error) {
        if (error instanceof Error && (error.message.includes('ENOENT') || (error as any).code === 'ENOENT')) {
            throw new Error("File not found or invalid JSON");
        }
        throw new Error(`Failed to load curriculum JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Validates that a JSON file contains valid curriculum data structure
 * @param filePath - Absolute path to the JSON file to validate
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function validateCurriculumData(filePath: string): Promise<boolean> {
    try {
        const data = await loadCurriculumFromJSON(filePath);
        
        // Basic structure validation
        const requiredFields = ['id', 'grade', 'subject', 'topic', 'concept', 'difficulty', 'questionTypes'];
        const hasAllRequired = requiredFields.every(field => field in data && data[field as keyof CurriculumContent] != null);
        
        if (!hasAllRequired) {
            return false;
        }
        
        // Validate concept structure
        if (!data.concept || !data.concept.id || !data.concept.name || !data.concept.description) {
            return false;
        }
        
        // Validate sample questions if they exist
        if (data.sampleQuestions && Array.isArray(data.sampleQuestions)) {
            for (const question of data.sampleQuestions) {
                if (!question.id || !question.question || question.answer === undefined || !question.type) {
                    return false;
                }
            }
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Processes multiple curriculum items from a JSON array file
 * @param filePath - Absolute path to JSON file containing array of curriculum items
 * @returns Promise resolving to array of curriculum IDs that were processed
 */
export async function processCurriculumBatch(filePath: string): Promise<string[]> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        if (!Array.isArray(jsonData)) {
            throw new Error("JSON file must contain an array of curriculum items");
        }
        
        const processedIds: string[] = [];
        
        for (const item of jsonData) {
            // Convert date strings to Date objects
            if (item.createdAt) {
                item.createdAt = new Date(item.createdAt);
            }
            if (item.updatedAt) {
                item.updatedAt = new Date(item.updatedAt);
            }
            
            // Validate each item
            const isValid = await validateCurriculumItem(item);
            if (isValid) {
                processedIds.push(item.id);
            } else {
                console.warn(`Skipping invalid curriculum item with ID: ${item.id || 'unknown'}`);
            }
        }
        
        return processedIds;
    } catch (error) {
        // Check for file not found errors
        const isFileNotFound = error instanceof Error && (
            error.message.includes('ENOENT') || 
            (error as any).code === 'ENOENT' ||
            error.message.includes('no such file or directory')
        );
        
        if (isFileNotFound) {
            throw new Error("File not found or invalid JSON");
        }
        throw new Error(`Failed to process curriculum batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Validates a single curriculum item object
 * @param item - The curriculum item to validate
 * @returns boolean indicating if the item is valid
 */
async function validateCurriculumItem(item: any): Promise<boolean> {
    try {
        const requiredFields = ['id', 'grade', 'subject', 'topic', 'concept', 'difficulty', 'questionTypes'];
        const hasAllRequired = requiredFields.every(field => field in item && item[field] != null);
        
        if (!hasAllRequired) {
            return false;
        }
        
        // Validate concept structure
        if (!item.concept || !item.concept.id || !item.concept.name || !item.concept.description) {
            return false;
        }
        
        return true;
    } catch {
        return false;
    }
}