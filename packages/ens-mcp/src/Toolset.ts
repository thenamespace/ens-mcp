import { Array as Arr, Schema, SchemaGetter, String as Str } from "effect";

/** A group of tools that is enabled or disabled as a whole. */
export const Toolset = Schema.Literals([
  "lookup",
  "lists",
  "register",
  "manage",
  "advanced",
  "utils",
]);
export type Toolset = typeof Toolset.Type;

/** Enabled when neither `--toolsets` nor `ENS_MCP_TOOLSETS` is set. */
export const defaultToolsets: ReadonlyArray<Toolset> = ["lookup", "lists", "register", "utils"];

const ToolsetNames = Schema.String.pipe(
  Schema.decodeTo(Schema.Array(Schema.String), {
    decode: SchemaGetter.transform((input) => {
      const names = Arr.filter(Arr.map(Str.split(",")(input), Str.trim), Str.isNonEmpty);
      return names.length === 1 && names[0] === "all" ? Toolset.literals : names;
    }),
    encode: SchemaGetter.transform(Arr.join(",")),
  }),
);

/** A comma-separated list of toolsets, such as `lookup, utils`. `all` enables every toolset. */
export const Toolsets = ToolsetNames.pipe(Schema.decodeTo(Schema.Array(Toolset)));
