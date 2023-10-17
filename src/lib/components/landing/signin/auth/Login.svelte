<script lang="ts">
	import GoogleSignInButton from './GoogleSignInButton.svelte';

	let count = 0;
	let email: string = '';
	let password: string = '';

	// Assuming you will replace these with actual values from server
	let isEmailCorrect = true;
	let isPasswordCorrect = true;

	// Email and password validity
	let emailValid: Boolean;
	let passwordValid: Boolean;

	const checkEmailValidity = (email: string) => {
		const emailRegEx = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
		return emailRegEx.test(email);
	};

	$: emailValid = email ? checkEmailValidity(email) : true;
	$: passwordValid = password.length > 0;

	$: emailClass =
		isEmailCorrect && emailValid ? 'border-gray-300 rounded-md' : 'border-red-500 rounded-md';
	$: passwordClass =
		isPasswordCorrect && passwordValid ? 'border-gray-300 rounded-md' : 'border-red-500 rounded-md';
</script>

<div class="relative flex h-full flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
	<div
		class="absolute inset-0 bg-[url(/img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
	/>
	<div
		class="relative bg-white px-6 pb-8 pt-10 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10"
	>
		<div class="mx-auto max-w-md justify-center items-center">
			<a href="/" class="h-8 w-auto mx-auto">
				<img src="/logo.png" class="h-8 w-auto mx-auto" alt="Source Chart Logo" />
			</a>
			<h1 class="text-3xl text-center mb-6 mt-6">Welcome Back</h1>
			<GoogleSignInButton />

			<div class="inline-flex items-center justify-center w-full">
				<hr class="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
				<span
					class="absolute px-2 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900"
					>or</span
				>
			</div>
			<form action="?/login" method="POST" class="auth-form">
				<label for="email"> Email </label>
				<input
					id="email"
					type="text"
					name="email"
					class="w-full p-2 mb-4 border {emailClass}"
					bind:value={email}
				/>
				<label for="password" class="mt-2"> Password </label>
				<input
					id="password"
					type="password"
					name="password"
					class="w-full p-2 mb-4 border {passwordClass}"
					bind:value={password}
				/>
				{#if count > 1}
					<p class="text-red-500 mt-2">Either your email or password is incorrect.</p>
				{/if}
			</form>
			<button
				type="submit"
				class="mt-4 w-full py-2 px-4 text-black rounded-md login-with-button"
				disabled={!emailValid || !passwordValid}>Log In</button
			>
		</div>
	</div>
</div>

<style>
	.login-with-button {
		transition: background-color 0.3s, box-shadow 0.3s;

		border: none;
		border-radius: 3px;
		box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.25);

		color: #757575;
		font-size: 14px;
		font-weight: 500;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

		background-color: white;
		background-repeat: no-repeat;
		background-position: 12px 11px;

		&:hover {
			box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.25);
		}

		&:active {
			background-color: #eeeeee;
		}

		&:focus {
			outline: none;
			box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.25), 0 0 0 3px #c8dafc;
		}

		&:disabled {
			filter: grayscale(100%);
			background-color: #ebebeb;
			box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.25);
			cursor: not-allowed;
		}
	}
</style>
