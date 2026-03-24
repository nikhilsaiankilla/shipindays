import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

export function getDb() {
    if (db) return db;
    const url = process.env.DATABASE_URL;

    if (!url) {
        throw new Error("DATABASE_URL is not set");
    }

    try {
        client = postgres(url, {
            prepare: false,
            max: 1, // IMPORTANT: avoid connection storms
        });

        db = drizzle(client, { schema });

        return db;
    } catch (err) {
        console.error("[db] failed to connect", err);
        throw err; // bubble up intentionally
    }
}