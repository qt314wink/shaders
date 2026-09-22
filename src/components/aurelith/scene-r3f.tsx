import { useEffect, useState, type ComponentType } from "react";

/** SSR-safe loader. three.js and r3f stay out of the server bundle. */
export function SceneR3F() {
  const [Canvas, setCanvas] = useState<ComponentType | null>(null);
  useEffect(() => {
    let live = true;
    void import("./scene-r3f-canvas").then((m) => {
      if (live) setCanvas(() => m.SceneR3FCanvas);
    });
    return () => {
      live = false;
    };
  }, []);
  return <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-void">{Canvas ? <Canvas /> : null}</div>;
}
