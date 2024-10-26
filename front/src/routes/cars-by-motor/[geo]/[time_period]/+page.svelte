<script>
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';

	let API_ASB = '/api/v2/cars-by-motor';

	if (dev) {
		API_ASB = 'http://localhost:8080' + API_ASB;
	}
	let showForm = false;
	let car = {};
	let cars = {};
	let geo = $page.params.geo;
	let time_period = $page.params.time_period;
	let errorMsg = '';
	let successMsg = '';

	onMount(() => {
		getCar(geo, time_period);
	});

	async function getCar(geo, time_period) {
		try {
			let response = await fetch(API_ASB + '/' + geo + '/' + time_period, {
				method: 'GET'
			});

			if (response.status == 200) {
				let resp = await response.json();
				car = resp;
			} else {
				if (response.status == 400) {
					errorMsg = 'Error en la estructura de los datos';
					alert(errorMsg);
				} else if (response.status == 409) {
					errorMsg = 'Ya existe una entrada con ese país y año';
					alert(errorMsg);
				} else if (response.status == 404) {
					errorMsg = 'Dato no encontrado';
					alert(errorMsg);
				}
			}
			console.log('Datos Originales: ' + JSON.stringify(car));
		} catch (e) {
			errorMsg = e;
		}
	}

	async function modifyCar() {
		try {
			let response = await fetch(API_ASB + '/' + geo + '/' + time_period, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(car)
			});

			if (response.status == 200) {
				cars = JSON.stringify(car);
				showForm = false;
				successMsg = 'Dato modificado correctamente';
				await getCar(geo, time_period);
			} else {
				if (response.status == 400) {
					errorMsg = 'No se puede cambiar pais ni año';
				} else if (response.status == 409) {
					errorMsg = 'Ya existe una entrada con ese país y año';
				} else if (response.status == 404) {
					errorMsg = 'Dato no encontrado';
				}
			}
			console.log('Datos Modificados: ' + JSON.stringify(cars));
		} catch (e) {
			errorMsg = e;
		}
	}

	// async function modifyCar() {
	// 	try {
	// 		let response = await fetch(
	// 			API_ASB + '/' + geo +'/' + time_period,
	// 			{
	// 				method: 'PUT',
	// 				headers: {
	// 					'Content-Type': 'application/json'
	// 				},
	// 				body: JSON.stringify(car)
	// 			}
	// 		);
	// 		if (response.status == 200) {
	//             cars = JSON.stringify(car);
	//             showForm = false;
	// 			await getCar(geo,time_period);
	// 			successMsg = 'Dato actualizado correctamente';
	// 		} else {
	// 			errorMsg = 'Error al actualizar el dato';
	// 		}
	// 	} catch (e) {
	// 		errorMsg = e;
	// 	}
	// }
</script>

<h2>Ubicación: {geo} Año:{time_period}</h2>

{#if !showForm}
	<!-- Vista de detalles del vehículo -->
	{#if Object.keys(car).length > 0}
		<div class="container">
			<div class="card">
				<table>
					<tbody>
						{#each Object.entries(car) as [key, value]}
							<tr>
								<td class="attribute">{key}:</td>
								<td class="value">
									{#if typeof value === 'object'}
										{JSON.stringify(value)}
									{:else}
										{value}
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div
					style="text-align:center ;margin-top: 20px; display: flex; justify-content: space-between;"
				>
					<button
						style="background-color: #8bc34a; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
						on:click={() => {
							showForm = true;
						}}
					>
						Modificar Entrada
					</button>
				</div>
			</div>
		</div>
	{:else}
		<p class="container">No hay datos disponibles</p>
	{/if}
{:else}
	<!-- Formulario para modificar la entrada -->
	<div class="container">
		<div class="card">
			<h2 style="color: #000000;">Modificar Entrada</h2>
			<form on:submit|preventDefault={modifyCar}>
				<table>
					<tbody>
						{#each Object.entries(car) as [key, value]}
							<tr>
								<td class="attribute">{key}:</td>
								<td class="value">
									{#if key === 'geo' || key === 'time_period'}
										<input
											type="text"
											bind:value={car[key]}
											readonly
											style="background-color: #d6ffc9; border: 1px solid #9c27b0; color: #000000;"
										/>
									{:else}
										<input
											type="text"
											bind:value={car[key]}
											style="background-color: #d6ffc9; border: 1px solid #9c27b0; color: #000000;"
										/>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div style="margin-top: 20px; display: flex; justify-content: space-between;">
					<button
						type="submit"
						style="text-align:center ;background-color: #49b027; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
						on:submit={() => {
							showForm = false;
							modifyCar();
						}}
					>
						Guardar Cambios
					</button>
					<button
						style="background-color: #ef5350; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
						on:click={() => {
							showForm = false;
						}}
					>
						Cancelar
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if errorMsg != ''}
	<hr />
	ERROR: {errorMsg}
{:else if successMsg != ''}
	<hr />
	EXITO: {successMsg}
{/if}

<style>
	.card {
		background-color: #fff;
		border: 1px solid #49b027;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: 20px;
		max-width: 600px;
		margin: 0 auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: left;
	}
	.container {
		width: 80%;
		margin: 50px auto;
		background-color: #ffffff;
		border: 1px solid #a4caef;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		padding: 20px;
	}

	input[type='text'] {
		width: 100%;
		padding: 8px;
		border: 1px solid #ddd;
		border-radius: 5px;
	}

	button[type='submit'] {
		margin-top: 10px;
	}
</style>
