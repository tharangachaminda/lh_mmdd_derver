/**
 * MongoDB Database Configuration
 *
 * Handles MongoDB connection setup and configuration
 */

import mongoose from "mongoose";

export class DatabaseConfig {
    private static instance: DatabaseConfig;
    private isConnected: boolean = false;

    private constructor() {}

    static getInstance(): DatabaseConfig {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig();
        }
        return DatabaseConfig.instance;
    }

    /**
     * Connect to MongoDB database
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            console.log("Already connected to MongoDB");
            return;
        }

        try {
            const mongoUri =
                process.env.MONGODB_URI ||
                "mongodb://localhost:27017/learning-hub";

            await mongoose.connect(mongoUri, {
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            });

            this.isConnected = true;
            console.log("Successfully connected to MongoDB");

            // Handle connection events
            mongoose.connection.on("error", (error) => {
                console.error("MongoDB connection error:", error);
                this.isConnected = false;
            });

            mongoose.connection.on("disconnected", () => {
                console.warn("MongoDB disconnected");
                this.isConnected = false;
            });

            mongoose.connection.on("reconnected", () => {
                console.log("MongoDB reconnected");
                this.isConnected = true;
            });
        } catch (error) {
            console.error("Failed to connect to MongoDB:", error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Disconnect from MongoDB
     */
    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Error disconnecting from MongoDB:", error);
            throw error;
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus(): boolean {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    /**
     * Get MongoDB connection info
     */
    getConnectionInfo(): {
        isConnected: boolean;
        readyState: number;
        host?: string;
        port?: number;
        name?: string;
    } {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
        };
    }
}
