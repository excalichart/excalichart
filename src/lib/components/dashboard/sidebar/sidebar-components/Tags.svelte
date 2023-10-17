<script lang="ts">
	import { Tags } from '$lib/components/ui/tags';
	import { allCharts, clickedChartIndex } from '$lib/io/Stores';

	let tags: string[] = [];

	$: i = clickedChartIndex();
	$: if ($allCharts.length > 0 && $allCharts[$i]?.groupbyColumns) {
		tags = $allCharts[$i].groupbyColumns;
	}

	const removeItem = (item: string) => {
		tags = tags.filter((tag) => tag !== item);
		let chart = $allCharts[$i];
		chart.groupbyColumns = tags;
		$allCharts[$i] = chart;
	};
</script>

<div>
	<Tags items={tags} {removeItem} />
</div>
