// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import solid from "vite-plugin-solid";

const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/**
 * A renderer for Solid 2.
 *
 * Astro's own `@astrojs/solid-js` targets Solid 1 - it imports `solid-js/web`,
 * which Solid 2 moved to `@solidjs/web` - so the two entrypoints are written
 * here, against the new package. Demos mount as `client:only` islands: a
 * drawer is pointer events and layout, and has nothing to say on a server.
 */
function solid2() {
  return {
    name: "solid-2",
    hooks: {
      "astro:config:setup": ({ addRenderer, updateConfig }) => {
        addRenderer({
          name: "solid",
          clientEntrypoint: here("./src/renderer/client.ts"),
          serverEntrypoint: here("./src/renderer/server.ts"),
        });
        updateConfig({
          vite: {
            plugins: [solid()],
            // The drawer is linked from the workspace root, which carries its
            // own copy of Solid; one page, one Solid.
            resolve: { dedupe: ["solid-js", "@solidjs/web"] },
            optimizeDeps: { exclude: ["@sinhong2011/solid-drawer"] },
          },
        });
      },
    },
  };
}

export default defineConfig({
  site: "https://sinhong2011.github.io",
  base: "/solid-drawer",
  integrations: [solid2()],
});
