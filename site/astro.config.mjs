// @ts-check
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";

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
            // `ssr`: the server bundle gets server code even though every island is
            // `client:only` - the modules are still imported there.
            plugins: [solid({ ssr: true }), tailwindcss()],
            // The drawer is linked from the workspace root, which carries its
            // own copy of Solid; one page, one Solid.
            resolve: { dedupe: ["solid-js", "@solidjs/web"] },
            optimizeDeps: {
              exclude: ["@sinhong2011/solid-drawer"],
              include: ["clsx", "tailwind-merge"],
            },
          },
        });
      },
    },
  };
}

export default defineConfig({
  // Served from the root: home is `/`, the docs `/docs`. Links are built from
  // `import.meta.env.BASE_URL`, so a base can be put back here if needed.
  site: "https://sinhong2011.github.io",
  integrations: [solid2(), mdx()],
  markdown: {
    // Both themes are emitted; the site's CSS picks one by the page's theme.
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" }, defaultColor: false },
  },
});
