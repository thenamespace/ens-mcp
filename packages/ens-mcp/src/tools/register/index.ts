import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { checkAvailability } from "./checkAvailability/handler.js";
import { CheckAvailability } from "./checkAvailability/tool.js";
import { getPrice } from "./getPrice/handler.js";
import { GetPrice } from "./getPrice/tool.js";
import { registerName } from "./registerName/handler.js";
import { RegisterName } from "./registerName/tool.js";
import { renewNames } from "./renewNames/handler.js";
import { RenewNames } from "./renewNames/tool.js";

const RegisterToolkit = Toolkit.make(CheckAvailability, GetPrice, RegisterName, RenewNames);

/** The `register` toolset: availability, prices, and registrations and renewals to sign. */
export const RegisterTools = McpServer.toolkit(RegisterToolkit).pipe(
  Layer.provide(
    RegisterToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return {
          check_availability: checkAvailability(ens),
          get_price: getPrice(ens),
          register_name: registerName(ens),
          renew_names: renewNames(ens),
        };
      }),
    ),
  ),
);
