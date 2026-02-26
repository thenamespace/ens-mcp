import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@repo/ui/components/button";

export const Home = () => {
  return (
    <div>
      <Button>Button</Button>
    </div>
  );
};

export const Route = createFileRoute("/")({ component: Home });
