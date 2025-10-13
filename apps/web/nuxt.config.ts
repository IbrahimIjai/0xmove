// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	devtools: { enabled: true },
	future: {
		compatibilityVersion: 4,
	},
	runtimeConfig: {
		public: {
			projectId: process.env.NUXT_PROJECT_ID,
			// Base URL for backend API (e.g., http://localhost:8787 if using wrangler dev)
			apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
		},
	},
	modules: [
		"@nuxt/ui",
		"@nuxtjs/seo",
		"@nuxt/eslint",
		"@vueuse/nuxt",
		"@nuxt/image",
		"motion-v/nuxt",
		"@wagmi/vue/nuxt",
	],
	ui: {
		theme: {
			colors: ["primary", "secondary", "success", "info", "warning", "error"],
			transitions: true,
		},
	},

	app: {
		head: {
			title: "0Xmove",
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "description", content: "0Xmove" },
			],
			link: [
				{
					id: "favicon",
					rel: "icon",
					href: "/favicon-dark.png",
					media: "(prefers-color-scheme: light)",
				},
				{
					id: "favicon",
					rel: "icon",
					href: "/favicon.png",
					media: "(prefers-color-scheme: dark)",
				},
			],
		},
	},
	colorMode: {
		preference: "dark",
		fallback: "dark",
	},

	imports: {
		autoImport: true,
	},
	site: {
		url: "https://distant.finance",
	},
	css: ["~/assets/css/main.css"],
	compatibilityDate: "2025-01-03",
});
