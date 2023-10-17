<script lang="ts">
	import { goto } from '$app/navigation';

	let isOpen = false;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function closeMenu() {
		isOpen = false;
	}
</script>

<svelte:head>
	<title>SourceChart</title>
	<meta name="description" content="Landing page for sourcechart" />
</svelte:head>
<header class="mb-12">
	<nav class="bg-gray-100 py-3 fixed w-full z-20 top-0 left-0">
		<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 space-x-4">
			<!-- Logo on the left -->
			<a href="/" class="flex items-center space-x-2">
				<img src="/logo1.png" class="w-48" alt="Logo" />
			</a>

			<!-- Navigation Links -->
			<div class="hidden md:flex items-center space-x-4">
				<ul class="flex flex-row font-medium">
					<li>
						<a
							href="/"
							class="p-3 text-gray-900 hover:bg-gray-100 hover:text-purple-700"
							aria-current="page"
						>
							Home
						</a>
					</li>
					<li>
						<a href="#features" class="p-3 text-gray-900 hover:bg-gray-100 hover:text-purple-700">
							Features
						</a>
					</li>
					<li>
						<a href="#about" class="p-3 text-gray-900 hover:bg-gray-100 hover:text-purple-700">
							About
						</a>
					</li>
				</ul>
			</div>

			<div class="flex space-x-4 items-center">
				<!-- Login Button on the right -->
				<button
					on:click={() => {
						goto('/dashboard');
					}}
					type="button"
					class="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg md:text-lg px-6 py-2"
				>
					Login
				</button>

				<!-- Dropdown menu button for small screens -->
				<div class="md:hidden relative inline-block flex-grow-0">
					<button
						on:click={toggleMenu}
						type="button"
						class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
					>
						<span class="sr-only">Open main menu</span>
						<svg
							class="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 17 14"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M1 1h15M1 7h15M1 13h15"
							/>
						</svg>
					</button>
					<div
						class={`${
							isOpen ? '' : 'hidden'
						}  mt-1 bg-white border border-gray-200 shadow-md absolute z-10 top-full right-0 rounded-lg`}
						id="navbar-sticky"
					>
						<ul class="flex flex-col font-medium divide-y divide-gray-200">
							<li on:click={closeMenu} on:keyup={closeMenu}>
								<a
									href="/"
									class="flex p-3 text-gray-900 hover:bg-gray-100 hover:text-purple-700 justify-center"
									aria-current="page"
								>
									Home
								</a>
							</li>
							<li on:click={closeMenu} on:keyup={closeMenu}>
								<a
									href="#features"
									class="flex justify-center p-3 text-gray-900 hover:bg-gray-100 hover:text-purple-700"
								>
									Features
								</a>
							</li>
							<li on:click={closeMenu} on:keyup={closeMenu}>
								<a
									href="#about"
									class="flex justify-center p-3 text-gray-900 hover:bg-gray-100 hover:text-purple-700"
								>
									About
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</nav>
</header>

<section id="hero" class=" px-6 pt-12 bg-gray-100">
	<div class="grid max-w-screen-xl py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-0 lg:pt-16 lg:grid-cols-12">
		<div class="mr-auto place-self-center lg:col-span-7">
			<h1
				class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-zinc-900"
			>
				Cut through the
				<span class="underline underline-offset-2 decoration-8 decoration-purple-400">noise</span>
			</h1>
			<p class="max-w-2xl mb-6 font-light lg:mb-8 md:text-lg lg:text-xl text-zinc-900">
				Process and visualize gigabytes of data that moves as fast as you think. While never leaving
				your browser.
			</p>
			<button
				on:click={() => {
					goto('/dashboard');
				}}
				type="button"
				class="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg md:text-lg px-6 py-2 text-center mr-3 md:mr-0"
				>Try Now</button
			>
		</div>
		<div class="hidden lg:mt-0 lg:col-span-5 lg:flex">
			<img src="/hero2.png" width="617" height="697" alt="House" />
		</div>
	</div>
</section>

<section id="features" class="px-6 bg-white py-12">
	<h2 class="font-bold text-2xl md:text-4xl lg:text-5xl text-center text-zinc-900 mb-2">
		Features
	</h2>
	<div
		class="grid max-w-screen-xl grid-cols-1 place-items-center px-4 py-4 mx-auto gap-8 xl:gap-0 lg:py-12 md:grid-cols-3"
	>
		<div class="flex flex-col space-y-2 items-start px-6 py-3">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="55"
				height="58"
				viewBox="0 0 55 58"
				fill="none"
				class="text-indigo-500"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M45.2856 28.6429C45.2856 30.5749 46.8164 32.1469 48.6979 32.1469C49.6466 32.1469 50.4166 32.9376 50.4166 33.9119V40.2681C50.4166 45.6431 46.1587 50.0155 40.9246 50.0155H14.0777C8.84352 50.0155 4.58331 45.6431 4.58331 40.2681V33.9119C4.58331 32.9376 5.35331 32.1469 6.30206 32.1469C8.18581 32.1469 9.71665 30.5749 9.71665 28.6429C9.71665 26.7602 8.24769 25.3435 6.30206 25.3435C5.84602 25.3435 5.4106 25.1576 5.08748 24.8258C4.76435 24.494 4.58331 24.0445 4.58331 23.5786L4.5879 17.0152C4.5879 11.6403 8.84581 7.2655 14.08 7.2655H40.92C46.1541 7.2655 50.4144 11.6403 50.4144 17.0152L50.4166 23.3738C50.4166 23.8398 50.2356 24.2916 49.9148 24.6211C49.5916 24.9529 49.1562 25.1388 48.6979 25.1388C46.8164 25.1388 45.2856 26.7108 45.2856 28.6429ZM32.6607 30.1797L35.3626 27.4781C35.8324 27.0121 35.9951 26.325 35.7912 25.6896C35.5895 25.0542 35.0624 24.6024 34.4253 24.5106L30.6922 23.9505L29.0216 20.477C28.7351 19.8793 28.153 19.5075 27.5045 19.5051H27.4999C26.8537 19.5051 26.2716 19.8769 25.9805 20.4747L24.3099 23.9505L20.5837 24.5082C19.9397 24.6024 19.4126 25.0542 19.2087 25.6896C19.007 26.325 19.1697 27.0121 19.6372 27.4781L22.3391 30.1797L21.702 33.9991C21.592 34.658 21.851 35.3122 22.378 35.7052C22.676 35.9241 23.022 36.037 23.3726 36.037C23.6407 36.037 23.9112 35.9688 24.1587 35.8346L27.4999 34.032L30.8343 35.8299C31.4118 36.1476 32.097 36.0982 32.6218 35.7029C33.1512 35.3122 33.4101 34.658 33.3001 33.9991L32.6607 30.1797Z"
					fill="currentColor"
				/>
			</svg>
			<h3 class="font-bold text-lg text-zinc-800">A Single Source of Truth</h3>
			<p class="text-gray-500">
				Our platform provides an interactive visualizations of your complex data. Leading to faster
				and more effective decision making.
			</p>
		</div>
		<div class="flex flex-col space-y-2 items-start px-6 py-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="51"
				height="51"
				viewBox="0 0 51 51"
				fill="none"
				class="text-indigo-500"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M7.4375 21.6358C7.4375 12.0527 15.6057 4.30713 25.4861 4.30713C35.3943 4.30713 43.5625 12.0527 43.5625 21.6358C43.5625 26.4648 41.7711 30.948 38.8227 34.7479C35.57 38.9395 31.5608 42.5914 27.0482 45.458C26.0153 46.1205 25.0832 46.1705 23.9497 45.458C19.4113 42.5914 15.4022 38.9395 12.1773 34.7479C9.22671 30.948 7.4375 26.4648 7.4375 21.6358ZM19.5377 22.1754C19.5377 25.3857 22.2098 27.9106 25.4861 27.9106C28.7645 27.9106 31.4622 25.3857 31.4622 22.1754C31.4622 18.9901 28.7645 16.3422 25.4861 16.3422C22.2098 16.3422 19.5377 18.9901 19.5377 22.1754Z"
					fill="currentColor"
				/>
			</svg>
			<h3 class="font-bold text-lg text-zinc-800">Your data is yours</h3>
			<p class="text-gray-500">
				Data never leaves your computer. This ensures that your data stays private and everything is
				right where you would expect it to be.
			</p>
		</div>
		<div class="flex flex-col space-y-2 items-start px-6 py-6">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="42"
				height="42"
				viewBox="0 0 42 42"
				fill="none"
				class="text-indigo-500"
			>
				<path
					d="M20.6679 0.65332C16.1173 14.2562 8.26773 31.1598 0 41.6277L20.6679 33.3768L41.3844 41.6277C33.1182 31.1598 25.263 14.2562 20.6679 0.65332Z"
					fill="currentColor"
				/>
			</svg>
			<h3 class="font-bold text-lg text-zinc-800">Process gigabytes of data</h3>
			<p class="text-gray-500">
				Our platform is designed to handle large amounts of data. We are able to process gigabytes
				of data in seconds.
			</p>
		</div>
	</div>
</section>
<section id="about" class="px-6 bg-gray-100 py-6">
	<h2 class="font-bold text-2xl md:text-4xl lg:text-5xl text-center text-zinc-900">About</h2>
	<div
		class="grid max-w-screen-xl grid-cols-1 place-items-center p-4 mx-auto gap-8 xl:gap-0 lg:py-12 md:grid-cols-1"
	>
		<div class="flex flex-col space-y-2 items-center px-6 py-2 text-center">
			<p class="text-gray-500 mb-2">
				Most dashboards are designed for data visualization and monitoring purposes. SourceChart is
				designed to find insights using in browser databases. That way your data stays secure, and
				your browser doesn't run out of memory
			</p>
			<div class="flex justify-center items-center rounded-lg overflow-hidden">
				<video autoplay loop muted class="max-w-full h-auto">
					<source src="demoMP4.mp4" type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			</div>
		</div>
	</div>
</section>

<section id="contact" class="px-6 py-12 bg-white">
	<div class="flex justify-center items-center h-full max-w-screen-xl mx-auto">
		<div class="text-center">
			<h3 class="font-bold text-4xl text-purple-800 mb-4">Ready to Dive In?</h3>
			<p class="font-medium text-lg py-2 text-gray-600 mb-4">
				Discover the difference. Join our community today.
			</p>
			<button
				on:click={() => {
					goto('/dashboard');
				}}
				type="button"
				class="w-48 text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-lg px-6 py-3 text-center shadow-lg transform transition hover:scale-105"
			>
				Get Started
			</button>
		</div>
	</div>
</section>

<footer class="bg-[#001246]">
	<div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
		<div class="md:flex md:justify-between">
			<div class="mb-6 md:mb-0">
				<a href="/" class="flex items-center space-x-2">
					<img src="/logo1.png" class="w-60" alt="Logo" />
				</a>
			</div>

			<div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-2">
				<div>
					<h2 class="mb-6 text-sm font-semibold uppercase text-white">Legal</h2>
					<ul class=" text-gray-400 font-medium">
						<li class="mb-4">
							<a href="/privacy-policy" class="hover:underline">Privacy Policy</a>
						</li>
						<li>
							<a href="/terms-and-conditions" class="hover:underline">Terms &amp; Conditions</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
		<hr class="my-6 sm:mx-auto border-gray-700 lg:my-8" />
		<div class="sm:flex sm:items-center sm:justify-between">
			<span class="text-sm sm:text-center text-gray-400"
				>© 2023 <a href="disclaimer" class="hover:underline">SourceChart™</a>. All Rights Reserved.
			</span>
		</div>
	</div>
</footer>
