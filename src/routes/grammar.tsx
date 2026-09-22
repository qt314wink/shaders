import { createFileRoute } from "@tanstack/react-router";
import { NacreAtelier } from "@/components/atelier/shell";

export const Route = createFileRoute("/grammar")({ component: GrammarPage });

function GrammarPage() {
  return <NacreAtelier />;
}
