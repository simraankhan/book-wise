import { config } from "@/lib/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(config.env.postgres.databaseUrl);

export const db = drizzle({ client: sql });
