// astro.config.mts
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	site: "https://pullriku.github.io",
	base: "line-history-web",
  output: "static",
  outDir: "dist",
	integrations: [
		preact({
			// Preact のオプション
			compat: true, // React との互換モード
		}),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
