<script>
	// `current` is updated whenever the prop value changes...
	export let things;
	export let thing_component
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function do_display(event) {
		let tid = event.currentTarget.id
		dispatch('message', {
			type: 'click',
			text: ('click ' + tid)
		});
	}

	function show_titles(event) {
		let tid = event.currentTarget.id
		dispatch('message', {
			type: 'over',
			text: ('over ' + tid)
		});
	}

	let grid_container_class = "grid-container"
	let element_poster_class = "element-poster"

</script>

<div class={grid_container_class} >
	{#each things as thing (thing.id)}
		<div id="xy_{thing.id}" class={element_poster_class} on:click={do_display} on:mouseover="{show_titles}">
			<svelte:component this={thing_component} {...thing} />
		</div>
	{/each}
</div>

<style>
	.grid-container {
		display: grid;
		grid-column-gap: 25px;
		grid-row-gap: 10px;
		grid-template-columns: auto auto auto;
		background-color: rgb(250, 250, 242);
		padding: 10px;
	}
	.element-poster {
		padding: 4px;
		border: solid 1px darkgrey;
		background-color: white;
		height: 170px;
		box-shadow: 5px 7px #888888;
		cursor:pointer;
	}

	@media (min-width: 1500px) { 
		.grid-container {
			display: grid;
			grid-column-gap: 25px;
			grid-row-gap: 10px;
			grid-template-columns: auto auto auto auto;
			background-color:  rgb(250, 250, 242);
			padding: 10px;
		}
	}

	@media (max-width: 900px) { 
		.grid-container {
			display: grid;
			grid-column-gap: 25px;
			grid-row-gap: 10px;
			grid-template-columns: auto auto;
			background-color: rgb(250, 250, 242);
			padding: 10px;
		}
	}

	@media (max-width: 600px) { 
		.grid-container {
			display: grid;
			grid-column-gap: 25px;
			grid-row-gap: 10px;
			grid-template-columns: auto;
			background-color: rgb(250, 250, 242);
			padding: 10px;
		}
	}

</style>
