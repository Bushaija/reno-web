import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from "postgres";
import * as schema from '@/db/schema';
import env from "@/env";
import '@/db/schema/relations';

// current

// export const connection = postgres(env.DATABASE_URL, {
//   max: (env.DB_MIGRATING || env.DB_SEEDING) ? 1 : undefined,
//   onnotice: env.DB_SEEDING ? () => {} : undefined,
// });

// export const db = drizzle(connection, {
//   schema,
//   logger: true,
// });

// export type Database = typeof db;

// shifts-api
export const connection = postgres(env.DATABASE_URL, {
  max: (env.DB_MIGRATING || env.DB_SEEDING) ? 1 : undefined,
  onnotice: env.DB_SEEDING ? () => {} : undefined,
});

export const db = drizzle(connection, {
  schema,
  logger: true,
});

export type Database = typeof db;

export default db;



// ======== PRODUCTION ==========

// import { config } from 'dotenv';
// import * as schema from '@/db/schema/tables';
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";

// config({ path: '.env' });

// const sql = neon(process.env.DATABASE_URL_!);
// const db = drizzle({ client: sql, schema});

// export type Database = typeof db;
// export default db;


// === second option ====

// db/index.ts
// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
// import * as schema from '@/db/schema/tables';

// const sql = neon(process.env.DATABASE_URL!);

// export const db = drizzle(sql, { schema });

// export type Database = typeof db;