import { customType } from "drizzle-orm/pg-core";

// Postgres has no Drizzle-native ltree type; map it to a string column.
export const ltree = customType<{ data: string }>({
  dataType: () => "ltree",
});
