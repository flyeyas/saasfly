import { KyselyAdapter } from "@auth/kysely-adapter";
import { db } from "@saasfly/db";
import type { Adapter } from "next-auth/adapters";

// 创建类型兼容的适配器
export function createNextAuthAdapter(): Adapter {
  const adapter = KyselyAdapter(db as any);
  return adapter as Adapter;
}