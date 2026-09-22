import { createFileRoute } from "@tanstack/react-router";
import { AurelithShell } from "@/components/aurelith/shell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AurelithShell />;
}
