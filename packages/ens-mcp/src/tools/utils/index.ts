import { Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { convertCoinType } from "./convertCoinType/handler.js";
import { ConvertCoinType } from "./convertCoinType/tool.js";
import { convertContentHash } from "./convertContentHash/handler.js";
import { ConvertContentHash } from "./convertContentHash/tool.js";
import { normalizeName } from "./normalizeName/handler.js";
import { NormalizeName } from "./normalizeName/tool.js";

const UtilsToolkit = Toolkit.make(NormalizeName, ConvertCoinType, ConvertContentHash);

/** The `utils` toolset: ENS name, coin type and content hash conversions, without the network. */
export const UtilsTools = McpServer.toolkit(UtilsToolkit).pipe(
  Layer.provide(
    UtilsToolkit.toLayer({
      normalize_name: normalizeName,
      convert_coin_type: convertCoinType,
      convert_content_hash: convertContentHash,
    }),
  ),
);
