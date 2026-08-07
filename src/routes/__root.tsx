import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Activity } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { inDevelopment } from "@/constants";
import BaseLayout from "@/layouts/base-layout";

function Root() {
  return (
    <BaseLayout>
      <AppShell />
      <Activity mode={inDevelopment ? "visible" : "hidden"}>
        <TanStackRouterDevtools />
      </Activity>
    </BaseLayout>
  );
}

export const Route = createRootRoute({
  component: Root,
});
