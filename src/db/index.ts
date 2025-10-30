import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[DB] DATABASE_URL is not defined. Make sure it is available before importing the database module.",
  );
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

let isClosed = false;

export async function closeDbConnection() {
  if (isClosed) {
    return;
  }

  isClosed = true;
  await client.end({ timeout: 5 });
}
