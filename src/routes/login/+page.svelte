<script lang="ts">
	import { Auth } from '@supabase/auth-ui-svelte';
	import { ThemeSupa } from '@supabase/auth-ui-shared';
	export let data;
</script>

<div class="flex justify-center items-center h-screen bg-gray-200">
	<div class="bg-white p-8 rounded-lg shadow-md w-96">
		<div class="flex flex-col items-center">
			<a href={data.url.concat('/', 'login')}>
				<img src="logo1.png" alt="Logo" class="mx-auto mb-4 w-52" />
			</a>
			<h1 class="text-3xl mb-4 text-center">Get Started</h1>
		</div>
		<Auth
			supabaseClient={data.supabase}
			view="magic_link"
			magicLink={true}
			showLinks={false}
			redirectTo={`${data.url}/auth/callback`}
			providers={['google']}
			appearance={{
				theme: ThemeSupa
			}}
			additionalData={{
				organization_id: data
			}}
		/>
	</div>
</div>
