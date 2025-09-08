// import { createKysely } from "@vercel/postgres-kysely";

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { DB } from "./prisma/types";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types";
export * from "./prisma/enums";

// export const db = createKysely<DB>();

// 创建 PostgreSQL 连接池
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// 创建 Kysely 实例
export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool,
    }),
});
