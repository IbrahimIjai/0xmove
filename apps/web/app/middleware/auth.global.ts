import { useUser } from "@/composables/useUser";

export default defineNuxtRouteMiddleware(async (to) => {
	// Only run on client where wallet state exists
	if (import.meta.server) return;

	// Allow public routes without wallet connect (home, health pages, etc.)
	const publicRoutes = new Set<string>(["/", "/onboarding"]);
	const isPublic = publicRoutes.has(to.path);

	try {
		const { isConnected, userQuery } = useUser();

		if (!isConnected.value) {
			// If not connected, allow navigating anywhere; UI should prompt connect
			return;
		}

		// Ensure userQuery runs; if no user and not on onboarding, redirect
		await userQuery.refetch();
		const hasUser = Boolean(userQuery.data.value);

		if (hasUser && to.path === "/onboarding") {
			return navigateTo("/dashboard");
		}
		if (!hasUser && !isPublic) {
			return navigateTo("/onboarding");
		}
	} catch (error) {
		// If there's an error with wallet state, just allow navigation
		console.warn("Auth middleware error:", error);
		return;
	}
});
