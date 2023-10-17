<script lang="ts">
	import GoogleSignInButton from './GoogleSignInButton.svelte';

	let email: string = '';
	let newPassword: string = '';
	let confirmedPassword: string = '';
	let passwordMatch: Boolean = false;
	let emailValid: Boolean = false;
	let passwordValid: Boolean = false;

	const checkPasswordRequirements = (password: string) => {
		const lowercase = new RegExp('(?=.*[a-z])');
		const uppercase = new RegExp('(?=.*[A-Z])');
		const numeric = new RegExp('(?=.*[0-9])');
		const minLength = new RegExp('(?=.{8,})');

		return (
			lowercase.test(password) &&
			uppercase.test(password) &&
			numeric.test(password) &&
			minLength.test(password)
		);
	};

	const checkEmailValidity = (email: string) => {
		const emailRegEx = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
		return emailRegEx.test(email);
	};

	$: passwordMatch = newPassword === confirmedPassword;
	$: passwordValid = newPassword ? checkPasswordRequirements(newPassword) : true;
	$: emailValid = email ? checkEmailValidity(email) : true;
	$: passwordMatchClass = passwordMatch
		? 'border-gray-500 rounded-md'
		: 'border-red-500 rounded-md';
	$: passwordValidClass = passwordValid
		? 'border-gray-500 rounded-md'
		: 'border-red-500 rounded-md';
	$: emailValidClass = emailValid ? 'border-gray-500 rounded-md' : 'border-red-500 rounded-md';

	// Individual password requirement checks
	$: passwordLowercase = newPassword.match(new RegExp('(?=.*[a-z])')) !== null;
	$: passwordUppercase = newPassword.match(new RegExp('(?=.*[A-Z])')) !== null;
	$: passwordNumeric = newPassword.match(new RegExp('(?=.*[0-9])')) !== null;
	$: passwordMinLength = newPassword.length >= 8;
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
			<h1 class="text-3xl text-center mb-6 mt-6">Get Started</h1>
			<GoogleSignInButton />
			<div class="inline-flex items-center justify-center w-full">
				<hr class="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
				<span
					class="absolute px-2 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900"
					>or</span
				>
			</div>
			<form action="?/signup" method="POST" class="auth-form">
				<label for="" class="rounded-md"> Email </label>
				<input type="text" name="email" bind:value={email} class={emailValidClass} />
				<label for="" class="mt-2 rounded-md"> Password </label>
				<input
					type="password"
					name="password"
					id="new-password"
					bind:value={newPassword}
					class={passwordValidClass}
				/>
				<div class="text-sm mt-2">
					<p class={passwordMinLength ? 'text-green-500' : 'text-red-500'}>
						Must be at least 8 characters
					</p>
					<p class={passwordLowercase ? 'text-green-500' : 'text-red-500'}>
						Must contain a lowercase letter
					</p>
					<p class={passwordUppercase ? 'text-green-500' : 'text-red-500'}>
						Must contain an uppercase letter
					</p>
					<p class={passwordNumeric ? 'text-green-500' : 'text-red-500'}>Must contain a number</p>
				</div>
				<label for="" class="mt-2"> Confirm Password </label>
				<input
					type="password"
					name="password"
					id="confirm-password"
					bind:value={confirmedPassword}
					class={passwordMatchClass}
				/>
			</form>
			<div class="inline-flex items-center justify-center w-full">
				<hr class="w-full h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />
				<span
					class="absolute px-2 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900"
				/>
			</div>
			<button
				type="submit"
				class="mt-4 w-full py-2 px-4 text-black rounded-md login-with-button"
				disabled={!emailValid || !passwordValid || !passwordMatch}>Sign Up</button
			>
		</div>
		<div class="pt-8 text-base font-semibold leading-7" />
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
