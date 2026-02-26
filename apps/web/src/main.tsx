import ReactDOM from "react-dom/client";

import { createRouter, RouterProvider } from "@tanstack/react-router";

import "@repo/ui/globals.css";

import { routeTree } from "./route-tree.gen";

const router = createRouter({
  defaultPreload: "intent",
  routeTree,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: needed for types
  interface Register {
    router: typeof router;
  }
}

// biome-ignore lint/style/noNonNullAssertion: safe
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
