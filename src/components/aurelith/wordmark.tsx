import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type WordmarkProps = {
  href?: "/" | "/grammar";
  size?: "sm" | "md";
  className?: string;
};

export function Wordmark({ href = "/", size = "md", className }: WordmarkProps) {
  return (
    <Link to={href} className={cn("wordmark group min-h-11 min-w-11", className)} aria-label="AURELITH home">
      <span className={cn("wordmark-text", size === "sm" ? "text-xl" : "text-2xl md:text-3xl")}>AURELITH</span>
    </Link>
  );
}

export function ProductNav({ active }: { active: "scene" | "lookdev" }) {
  return (
    <nav className="flex rounded-md border border-border p-0.5" aria-label="Product">
      <Link
        to="/"
        className={cn(
          "inline-flex h-11 min-w-11 items-center px-3 text-sm font-medium transition-colors duration-150",
          active === "scene" ? "rounded-sm bg-fg text-bg" : "text-muted hover:text-fg",
        )}
      >
        Scene
      </Link>
      <Link
        to="/grammar"
        className={cn(
          "inline-flex h-11 min-w-11 items-center px-3 text-sm font-medium transition-colors duration-150",
          active === "lookdev" ? "rounded-sm bg-fg text-bg" : "text-muted hover:text-fg",
        )}
      >
        Lookdev
      </Link>
    </nav>
  );
}
