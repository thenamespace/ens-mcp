import { Array as Arr, Option, String as Str } from "effect";
import { HttpServerRequest } from "effect/http";

import type { Chain } from "../ens/Chain.js";
import type { Toolset } from "../Toolset.js";
import { protocols } from "./options.js";

/** The server's name in the MCP Registry: `server.json`'s `name` and `package.json`'s `mcpName`. */
export const registryName = "io.github.thenamespace/ens-mcp";

/**
 * Where clients reach `/mcp` on this host. Behind proxies (`proxyHops` > 0) the scheme the client
 * used is the last `X-Forwarded-Proto` entry; the proxy speaks plain HTTP to the server.
 */
const endpointUrl = (request: HttpServerRequest.HttpServerRequest, proxyHops: number) => {
  const forwardedProto = Option.filter(
    Arr.last(Arr.map(Str.split(",")(request.headers["x-forwarded-proto"] ?? ""), Str.trim)),
    (proto) => proxyHops > 0 && Str.isNonEmpty(proto),
  );
  const scheme = Option.getOrElse(
    Option.map(forwardedProto, (proto) => `${proto}:`),
    () =>
      Option.match(HttpServerRequest.toURL(request), {
        onNone: () => "http:",
        onSome: (url) => url.protocol,
      }),
  );
  return `${scheme}//${request.headers.host ?? "localhost"}/mcp`;
};

/**
 * The server card served at `/.well-known/mcp.json`: what `server.json` says about the server, for
 * this instance, so crawlers and registries can describe it without connecting. Server cards are a
 * draft (SEP-2127); this keeps to the fields it shares with the registry's `server.json`.
 */
export const serverCard = (options: {
  readonly version: string;
  readonly chain: Chain;
  readonly toolsets: ReadonlyArray<Toolset>;
  readonly request: HttpServerRequest.HttpServerRequest;
  readonly proxyHops: number;
}) => ({
  name: registryName,
  title: "ENS",
  description:
    "ENS names: resolve, read profiles and ownership, list names, prepare registrations and changes",
  version: options.version,
  websiteUrl: "https://github.com/thenamespace/ens-mcp",
  repository: {
    url: "https://github.com/thenamespace/ens-mcp",
    source: "github",
    subfolder: "packages/ens-mcp",
  },
  remotes: [
    {
      type: "streamable-http",
      url: endpointUrl(options.request, options.proxyHops),
      supportedProtocolVersions: Arr.map(protocols, (protocol) => protocol.protocolVersion),
    },
  ],
  _meta: { "ninja.namespace/ens-mcp": { chain: options.chain, toolsets: options.toolsets } },
});
