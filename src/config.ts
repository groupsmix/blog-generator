import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  aiApiKey: string;
  aiModel: string;
  databaseUrl: string;
  localStoragePath: string;
  nodeEnv: string;
  logLevel: string;
}

export function loadConfig(): AppConfig {
  return {
    aiApiKey: process.env.AI_API_KEY || "",
    aiModel: process.env.AI_MODEL || "gpt-4",
    databaseUrl: process.env.DATABASE_URL || "",
    localStoragePath: process.env.LOCAL_STORAGE_PATH || "./data",
    nodeEnv: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || "info",
  };
}
