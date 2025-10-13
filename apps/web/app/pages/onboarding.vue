<script setup lang="ts">
import { ref, computed } from "vue";
import { useUser } from "@/composables/useUser";
import { useRouter } from "#imports";

const { address, isConnected, userQuery, createUser } = useUser();
const router = useRouter();

const email = ref("");
const username = ref("");

const canSubmit = computed(
	() =>
		!!email.value &&
		!!username.value &&
		isConnected.value &&
		!createUser.isPending.value,
);

async function onSubmit(): Promise<void> {
	if (!canSubmit.value) return;
	try {
		await createUser.mutateAsync({
			email: email.value,
			username: username.value,
		});
		await userQuery.refetch();
		await router.push("/dashboard");
	} catch (e: any) {
		// handled via UI state
		console.error(e);
	}
}
</script>

<template>
	<UContainer class="py-10 max-w-xl mx-auto">
		<div class="space-y-6">
			<div class="text-center">
				<h1 class="text-2xl font-semibold">Create your account</h1>
				<p class="text-sm opacity-75 mt-1">
					Connected address:
					<span class="font-mono">{{ address || "Not connected" }}</span>
				</p>
			</div>

			<UForm :state="{ email, username }" @submit.prevent="onSubmit">
				<div class="space-y-4">
					<UFormGroup label="Email" name="email">
						<UInput
							v-model="email"
							type="email"
							placeholder="you@example.com"
							required />
					</UFormGroup>
					<UFormGroup label="Username" name="username">
						<UInput v-model="username" placeholder="satoshi" required />
					</UFormGroup>
					<div class="flex gap-3">
						<UButton
							:disabled="!canSubmit"
							:loading="createUser.isPending.value"
							type="submit"
							color="primary">
							Create account
						</UButton>
						<UButton to="/" variant="ghost">Cancel</UButton>
					</div>
					<p v-if="createUser.error.value" class="text-red-500 text-sm">
						{{ String(createUser.error.value) }}
					</p>
				</div>
			</UForm>
		</div>
	</UContainer>
</template>

<style scoped></style>
