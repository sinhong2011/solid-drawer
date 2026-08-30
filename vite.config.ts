import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/**
 * `vp pack` builds the publishable copy: ESM compiled by Solid's own
 * compiler, and declarations. The `solid` export condition still hands
 * Solid-aware bundlers the source, so their compiler sees the JSX itself.
 */
export default defineConfig({
  plugins: solid(),
  pack: {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    platform: "browser",
    plugins: solid(),
    deps: { neverBundle: ["solid-js", "@solidjs/web"] },
  },
  test: {
    /*
     * Vitest resolves packages the way a server would, and Solid's server
     * build is deliberately inert: effects never run and stores refuse
     * writes. The drawer tests opt into jsdom per file and need the client
     * build a browser gets, so it is named outright.
     */
    alias: [
      { find: /^solid-js$/, replacement: here("./node_modules/solid-js/dist/dev.js") },
      { find: /^@solidjs\/web$/, replacement: here("./node_modules/@solidjs/web/dist/dev.js") },
    ],
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
