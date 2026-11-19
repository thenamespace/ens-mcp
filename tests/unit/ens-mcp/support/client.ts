import { Effect, Layer, Schema } from "effect";
import { McpTest } from "effect/ai";

import type { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";
import { protocols } from "@thenamespace/ens-mcp/internal/server/options";
import { registrations } from "@thenamespace/ens-mcp/internal/server/registrations";
import { Toolset, type Toolset as ToolsetName } from "@thenamespace/ens-mcp/internal/Toolset";

/** An in-memory MCP client of the server with `toolsets` (default all), reading ENS through `ens`. */
export const mcpClient = <E>(options: {
  readonly ens: Layer.Layer<Ens, E>;
  readonly toolsets?: ReadonlyArray<ToolsetName>;
}) =>
  McpTest.makeClient(
    registrations(options.toolsets ?? Toolset.literals).pipe(Layer.provide(options.ens)),
    { protocols },
  );

type Client = Effect.Success<ReturnType<typeof mcpClient>>;

/** The text of the resource at `uri`. */
export const readText = (client: Client, uri: string) =>
  Effect.map(client.readResource({ uri }), ({ contents }) => {
    const [content] = contents;
    return content !== undefined && "text" in content ? content.text : "";
  });

/** The resource at `uri`, parsed as JSON. */
export const readJson = (client: Client, uri: string) =>
  Effect.flatMap(readText(client, uri), Schema.decodeEffect(Schema.fromJsonString(Schema.Unknown)));
