import { timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

export const generateUniqueId = () => uuidv7();

export const timestamps = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};
