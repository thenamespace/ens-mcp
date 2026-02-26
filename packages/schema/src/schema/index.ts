import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-orm/effect-schema";
import { pgTable, text } from "drizzle-orm/pg-core";

import { generateUniqueId, timestamps } from "./common";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(generateUniqueId),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  ...timestamps,
});

export const UserSelectSchema = createSelectSchema(users);
export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = createUpdateSchema(users);

export type User = typeof UserSelectSchema.Type;
export type UserInsert = typeof UserInsertSchema.Type;
export type UserUpdate = typeof UserUpdateSchema.Type;
