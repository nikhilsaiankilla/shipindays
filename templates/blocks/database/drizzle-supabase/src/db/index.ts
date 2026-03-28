import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// cached instances to avoid reconnecting on every call
let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb() {
    // reuse existing db instance
    if (db) return db;

    const url = process.env.DATABASE_URL;

    // fail fast if env is missing
    if (!url) {
        throw new Error("DATABASE_URL is not set");
    }

    try {
        // create postgres client (single connection)
        client = postgres(url, {
            prepare: false,
            max: 1, // prevent connection explosion (serverless safe)
        });

        // initialize drizzle with schema
        db = drizzle(client, { schema });

        return db;
    } catch (err) {
        // log once and rethrow
        console.error("[db] failed to connect", err);
        throw err;
    }
}