<template>
	<Html :lang="seo.lang">
		<UApp>
			<NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />
			<NuxtLayout>
				<ClientOnly>
					<Toaster position="bottom-right" close-button />
				</ClientOnly>
				<SiteHeader />
				<div class="min-h-[calc(100dvh-150px)] pt-[105px]"><NuxtPage /></div>
				<Footer />
			</NuxtLayout>
		</UApp>
	</Html>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";

const colorMode = useColorMode();

const color = computed(() =>
	colorMode.value === "dark" ? "#020618" : "white",
);

const { seo } = useAppConfig();

useHead({
	meta: [
		{ charset: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1" },
		{ key: "theme-color", name: "theme-color", content: color },
	],
	link: [{ rel: "icon", href: "/favicon.png" }],
	htmlAttrs: {
		lang: "en",
	},
});

useSeoMeta({
	titleTemplate: "0xMove",
	ogImage:
		"https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3BvcnRmb2xpby10ZW1wbGF0ZS5udXh0LmRldiIsImlhdCI6MTc0NTkzNDczMX0.XDWnQoyVy3XVtKQD6PLQ8RFUwr4yr1QnVwPxRrjCrro.jpg?theme=light",
	twitterImage:
		"https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3BvcnRmb2xpby10ZW1wbGF0ZS5udXh0LmRldiIsImlhdCI6MTc0NTkzNDczMX0.XDWnQoyVy3XVtKQD6PLQ8RFUwr4yr1QnVwPxRrjCrro.jpg?theme=light",
	twitterCard: "summary_large_image",
});
</script>
