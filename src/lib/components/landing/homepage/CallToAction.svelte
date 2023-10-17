<script lang="ts">
	export let videoWebm: string;
	export let videoMp4: string;
	import { goto } from '$app/navigation';

	const enterFree = () => {
		goto('/dashboard');
	};
</script>

<section class="relative w-full h-0 pb-fluid-video">
	<video class="absolute top-0 left-0 w-full h-full" playsinline autoplay muted loop>
		<source src={videoWebm} type="video/webm" />
		<source src={videoMp4} type="video/mp4" />
		Your browser does not support HTML5 video.
	</video>
	<div class="absolute mb-9 left-6 w-full h-full flex items-center pl-32 pt-10">
		<div class="max-w-4xl">
			<h1
				class="text-black bg-zinc-800 font-bold text-2xl xs:text-base sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
			>
				Large Data Visualizations without the Cloud
			</h1>
			<p
				class="text-black max-w-xl font-semibold text-sm sm:text-base md:text-md lg:text-lg xl:text-xl"
			>
				Revolutionize the way your business interacts with data. Start your journey with
				SourceChart.io today and watch your data come alive.
			</p>
			<button
				on:click={enterFree}
				class="try-now-button inline-block text-xl font-bold px-4 py-2 leading-none border rounded-md text-white bg-red-600 border-black hover:border-transparent hover:text-white hover:bg-black mobile"
			>
				Try Now
			</button>
		</div>
		<div class="mb-20" />
	</div>
</section>

<style>
	.pb-fluid-video {
		padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
	}
	@media screen and (max-width: 1000px) {
		.try-now-button {
			display: none;
		}
	}
</style>
