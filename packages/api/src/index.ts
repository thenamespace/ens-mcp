import { HttpApi, OpenApi } from "@effect/platform";

import { healthGroup } from "./health";

export const api = HttpApi.make("RepoAPI")
  .add(healthGroup)
  .annotate(OpenApi.Title, "Repo API")
  .annotate(OpenApi.Description, "Repo API")
  .annotate(OpenApi.License, {
    name: "MIT",
    url: "https://opensource.org/licenses/MIT",
  });
