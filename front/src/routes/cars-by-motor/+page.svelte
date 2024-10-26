<script>
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';

	let API_ASB = '/api/v2/cars-by-motor';

	if (dev) {
		API_ASB = 'http://localhost:8080' + API_ASB;
	}

	let showForm = false;
	let cars = [];
	let newCar = {
		// dataflow: '',
		// last_update: '',
		freq: '',
		unit: '',
		motor_nrg: '',
		geo: '',
		time_period: '',
		obs_value: '',
		obs_flag: '',
		millions_of_passenger_per_kilometres: '',
		road_deaths_per_million_inhabitants: ''
	};
	let errorMsg = '';
	let successMsg = '';

	let searchCriteria = {
		freq: '',
		unit: '',
		motor_nrg: '',
		geo: '',
		time_period: '',
		obs_value: '',
		obs_flag: '',
		millions_of_passenger_per_kilometres: '',
		road_deaths_per_million_inhabitants: ''
	};

	let showSearchForm = false;

	let currentPage = 1;
	let totalItems = 0;
	let pageSize = 10;

	onMount(async () => {
		await loadInitialData();
		await getCars();
	});

	async function loadInitialData() {
		try {
			if (cars.length === 0) {
				let response = await fetch(API_ASB + '/loadInitialData', {
					method: 'GET'
				});

				if (response.status == 200) {
					getCars();
					alert('Datos Cargados Correctamente');
				} else {
					errorMsg = 'La base de datos no está vacía';
				}
			} else {
				errorMsg = 'La base de datos no está vacía';
			}
		} catch (error) {
			errorMsg = error;
		}
	}

	async function getCarsTotal() {
		try {
			let response = await fetch(API_ASB + '?limit=100', {
				method: 'GET'
			});
			let dataT = await response.json();
			totalItems = dataT.length;
		} catch (e) {
			errorMsg = e;
		}
	}

	async function getCars() {
		await getCarsTotal();
		try {
			let offset = (currentPage - 1) * pageSize;
			let response = await fetch(`${API_ASB}?limit=${pageSize}&offset=${offset}`, {
				method: 'GET'
			});
			if (response.ok) {
				let data = await response.json();
				cars = data;
				console.log(data);
				//totalItems = data.length;
				errorMsg = '';
			} else {
				if (response.status == 404) {
					errorMsg = 'No hay datos en la base de datos';
				} else {
					errorMsg = `Error ${response.status}: ${response.statusText}`;
				}
			}
		} catch (e) {
			errorMsg = e;
		}
	}

	async function nextPage() {
		if (currentPage * pageSize < totalItems) {
			currentPage++;
			getCars();
		}
	}

	async function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			getCars();
		}
	}

	async function createCar() {
		try {
			let response = await fetch(API_ASB, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newCar)
			});
			if (response.status == 201) {
				showForm = false;
				successMsg = 'Dato creado correctamente';
				errorMsg = '';
				await getCars();
			} else {
				if (response.status == 400) {
					errorMsg = 'Todos los datos deben ser introducidos';
				} else if (response.status == 405) {
					errorMsg = 'Método no permitido';
				} else if (response.status == 409) {
					errorMsg = 'Elemento ya existente';
				}
			}
		} catch (e) {
			errorMsg = e;
		}
	}

	async function deleteCars() {
		try {
			let response = await fetch(API_ASB, {
				method: 'DELETE'
			});
			if (response.ok) {
				await getCars();
				successMsg = 'Todos los datos fueron eliminados';
				errorMsg = '';
				cars = [];
			} else {
				if (response.status == 404) {
					errorMsg = 'No existen datos en la base de datos';
				}
			}
		} catch (e) {
			errorMsg = e;
		}
	}

	async function deleteCar(geo, time_period) {
		try {
			let response = await fetch(API_ASB + '/' + geo + '/' + time_period, {
				method: 'DELETE'
			});
			if (response.status == 200) {
				await getCars();

				if (cars.length === 0) {
					errorMsg = 'No hay datos disponibles';
				}

				successMsg = 'Dato eliminado correctamente';
				errorMsg = '';
			} else {
				if (response.status == 400) {
					errorMsg = 'Fallo en el dato';
				} else if (response.status == 404) {
					errorMsg = 'Dato no existente en la base de datos';
				} else if (response.status == 409) {
					errorMsg = 'Ya existe una entrada con ese país y año';
				}
			}
		} catch (e) {
			errorMsg = e;
		}
	}

	async function searchCars() {
		try {
			// Construye la URL de búsqueda a partir de los filtros proporcionados
			let searchParams = new URLSearchParams();
			for (const key in searchCriteria) {
				if (searchCriteria[key] !== '') {
					searchParams.append(key, searchCriteria[key]);
				}
			}
			let searchUrl = `${API_ASB}?${searchParams.toString()}`;
			console.log(searchUrl);
			// Realiza la petición GET a la API con la URL de búsqueda generada
			let response = await fetch(searchUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			// Manejo de la respuesta de la API
			let status = response.status;
			console.log(`Response status: ${status}`);

			if (response.ok) {
				// Actualiza los datos después de una búsqueda exitosa
				successMsg = 'Mostrando los datos solicitados';
				showSearchForm = false;
				let data = await response.json();
				cars = data;
				console.log(data);
			} else {
				// Manejo de errores
				if (response.status == 404) {
					errorMsg = 'No se encontraron datos';
				} else {
					errorMsg = `Error ${response.status}: ${response.statusText}`;
				}
			}
			showSearchForm = false;
		} catch (error) {
			errorMsg = error;
			console.log(error);
		}
	}
</script>

<title> cars-by-motor</title>

{#if cars && cars.length > 0}
	<div style="margin-top: 20px; display: flex; justify-content: space-between;">
		<button
			style="background-color: #A9CCE3; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
			on:click={() => prevPage()}
			>Anterior
		</button>
		<span>Página {currentPage}</span>
		<button
			style="background-color: #A9CCE3; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
			on:click={() => nextPage()}
		>
			Siguiente
		</button>
	</div>
	<div class="container">
		<div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
			<div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
				<button
					class="search-button"
					on:click={() => {
						showSearchForm = true;
					}}
				>
					<span class="material-icons">Filtros</span>
				</button>
			</div>
			{#if showSearchForm}
				{#if showSearchForm}
					<div class="search-form-container">
						<div class="search-form">
							<!-- Formulario de búsqueda -->
							<form on:submit|preventDefault={searchCars}>
								<label>
									Freq:
									<input
										type="text"
										bind:value={searchCriteria.freq}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Unit:
									<input
										type="text"
										bind:value={searchCriteria.unit}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Motor NRG:
									<input
										type="text"
										bind:value={searchCriteria.motor_nrg}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Geo:
									<input type="text" bind:value={searchCriteria.geo} style="margin-bottom: 10px;" />
								</label>
								<label>
									Time Period:
									<input
										type="number"
										bind:value={searchCriteria.time_period}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Obs Value:
									<input
										type="number"
										bind:value={searchCriteria.obs_value}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Obs Flag:
									<input
										type="text"
										bind:value={searchCriteria.obs_flag}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Millions of Passengers per Kilometre:
									<input
										type="number"
										bind:value={searchCriteria.millions_of_passenger_per_kilometres}
										style="margin-bottom: 10px;"
									/>
								</label>
								<label>
									Road Deaths per Million Inhabitants:
									<input
										type="number"
										bind:value={searchCriteria.road_deaths_per_million_inhabitants}
										style="margin-bottom: 10px;"
									/>
								</label>
								<button
									style="background-color: #FFB728; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
									type="submit">Aplicar</button
								>
								<button
									style="background-color: #E55454; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
									class="close-button"
									on:click={() => (showSearchForm = false)}
								>
									<span class="material-icons">X</span>
								</button>
							</form>
						</div>
						<!-- Controlador de eventos para cerrar el formulario cuando se hace clic fuera de él -->
						<div class="overlay" on:click={() => (showSearchForm = false)}></div>
					</div>
				{/if}

				<!-- <div>
					<form on:submit|preventDefault={searchCars}>
						<label>
							Freq:
							<input type="text" bind:value={searchCriteria.freq} style="margin-bottom: 10px;" />
						</label>
						<label>
							Unit:
							<input type="text" bind:value={searchCriteria.unit} style="margin-bottom: 10px;" />
						</label>
						<label>
							Motor NRG:
							<input
								type="text"
								bind:value={searchCriteria.motor_nrg}
								style="margin-bottom: 10px;"
							/>
						</label>
						<label>
							Geo:
							<input type="text" bind:value={searchCriteria.geo} style="margin-bottom: 10px;" />
						</label>
						<label>
							Time Period:
							<input
								type="number"
								bind:value={searchCriteria.time_period}
								style="margin-bottom: 10px;"
							/>
						</label>
						<label>
							Obs Value:
							<input
								type="number"
								bind:value={searchCriteria.obs_value}
								style="margin-bottom: 10px;"
							/>
						</label>
						<label>
							Obs Flag:
							<input
								type="text"
								bind:value={searchCriteria.obs_flag}
								style="margin-bottom: 10px;"
							/>
						</label>
						<label>
							Millions of Passengers per Kilometre:
							<input
								type="number"
								bind:value={searchCriteria.millions_of_passenger_per_kilometres}
								style="margin-bottom: 10px;"
							/>
						</label>
						<label>
							Road Deaths per Million Inhabitants:
							<input
								type="number"
								bind:value={searchCriteria.road_deaths_per_million_inhabitants}
								style="margin-bottom: 10px;"
							/>
						</label>
						<button
							style="background-color: #FFB728; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
							type="submit">Aplicar</button
						>
					</form>
				</div> -->
			{/if}
			<table>
				<thead>
					<tr>
						<!-- <th>id</th> Aquí colocamos primero la columna del ID -->
						{#each Object.keys(cars[0]) as key}
							{#if key !== 'id'}
								<!-- Evitamos mostrar la columna ID nuevamente -->
								<th>{key}</th>
							{/if}
						{/each}
						<th>modificar</th>
						<!-- Nuevo encabezado para el botón Modificar -->
						<th>eliminar</th>
					</tr>
				</thead>
				<tbody>
					{#each cars as car}
						<tr>
							<!-- <td>{car.id}</td> Aquí mostramos primero el ID -->
							{#each Object.entries(car) as [key, value]}
								<!-- Usamos Object.entries para mantener el orden de las propiedades -->
								{#if key !== 'id'}
									<!-- Evitamos mostrar la columna ID nuevamente -->
									<td>
										{value}
									</td>
								{/if}
							{/each}
							<td>
								<!-- <button
                                
                                    style="background-color: #007bff; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
                                    on:click={() => modifyCar(car.geo, car.time_period)}>Modificar</button> -->
								<a
									href="/cars-by-motor/{car.geo}/{car.time_period}"
									style="background-color: #007bff; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none;"
									>Modificar</a
								>
							</td>
							<td>
								<button
									style="background-color: #E85A4F; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
									on:click={() => deleteCar(car.geo, car.time_period)}>Eliminar</button
								>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div style="margin-top: 20px; display: flex; justify-content: space-between;">
			<button
				style="background-color: #33BF30; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
				on:click={() => {
					showForm = true;
				}}>Agregar Nuevo</button
			>
			<button
				style="background-color: #FF0000; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
				on:click={() => {
					deleteCars();
				}}>Eliminar Todo</button
			>
		</div>
	</div>
	{#if showForm}
		<div class="custom-modal">
			<div class="modal-content">
				<span
					class="close"
					on:click={() => {
						showForm = false;
					}}>&times;</span
				>
				<h2 style="color: #33BF30;">Agregar Nueva Entrada</h2>
				<form on:submit|preventDefault={createCar}>
					<label>
						Freq:
						<input type="text" bind:value={newCar.freq} style="margin-bottom: 10px;" required />
					</label>
					<label>
						Unit:
						<input type="text" bind:value={newCar.unit} style="margin-bottom: 10px;" required />
					</label>
					<label>
						Motor NRG:
						<input
							type="text"
							bind:value={newCar.motor_nrg}
							style="margin-bottom: 10px;"
							required
						/>
					</label>
					<label>
						Geo:
						<input type="text" bind:value={newCar.geo} style="margin-bottom: 10px;" required />
					</label>
					<label>
						Time Period:
						<input
							type="number"
							bind:value={newCar.time_period}
							style="margin-bottom: 10px;"
							required
						/>
					</label>
					<label>
						Obs Value:
						<input
							type="number"
							bind:value={newCar.obs_value}
							style="margin-bottom: 10px;"
							required
						/>
					</label>
					<label>
						Obs Flag:
						<input type="text" bind:value={newCar.obs_flag} style="margin-bottom: 10px;" required />
					</label>
					<label>
						Millions of Passengers per Kilometre:
						<input
							type="number"
							bind:value={newCar.millions_of_passenger_per_kilometres}
							style="margin-bottom: 10px;"
							required
						/>
					</label>
					<label>
						Road Deaths per Million Inhabitants:
						<input
							type="number"
							bind:value={newCar.road_deaths_per_million_inhabitants}
							style="margin-bottom: 10px;"
							required
						/>
					</label>
					<button
						type="submit"
						style="background-color: #33BF30; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;"
						>Agregar</button
					>
				</form>
			</div>
		</div>
	{/if}
{:else}
	<button
		style="background-color: #33BF30; color: white; padding: 5px 20px; border: none; border-radius: 5px; cursor: pointer;"
		on:click={() => loadInitialData()}
	>
		Cargar datos
	</button>
	<p class="container">No hay datos disponibles</p>
{/if}

{#if errorMsg != ''}
	<hr />
	ERROR: {errorMsg}
{:else if successMsg != ''}
	<hr />
	EXITO: {successMsg}
{/if}

<style>
	/* Estilo para el formulario de búsqueda */
	.search-form {
		position: absolute; /* Posición absoluta para que el formulario sea flotante */
		top: 50%; /* Centrar verticalmente */
		left: 50%; /* Centrar horizontalmente */
		transform: translate(-50%, -50%); /* Centrar el formulario */
		background-color: #f8f9fa; /* Color de fondo */
		padding: 20px; /* Espaciado interno */
		border-radius: 8px; /* Bordes redondeados */
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Sombra */
		z-index: 1000; /* Asegurar que esté en la parte superior */
		width: 300px; /* Ancho del formulario */
	}

	/* Estilo para el botón de cierre */
	.close-button {
		position: absolute; /* Posición absoluta */
		top: 10px; /* Alineación desde arriba */
		right: 10px; /* Alineación desde la derecha */
		background: none; /* Fondo transparente */
		border: none; /* Sin borde */
		cursor: pointer; /* Cursor de puntero */
		font-size: 20px; /* Tamaño del ícono */
		color: #495057; /* Color del icono */
	}

	/* Estilo para el botón de búsqueda */
	.search-button {
		display: block; /* Mostrar como bloque */
		width: 100%; /* Ancho completo */
		padding: 10px 0; /* Espaciado interno arriba y abajo */
		margin-top: 20px; /* Espacio superior */
		background-color: #007bff; /* Color de fondo */
		color: #fff; /* Color del texto */
		border: none; /* Sin borde */
		border-radius: 4px; /* Bordes redondeados */
		cursor: pointer; /* Cursor de puntero */
		font-size: 16px; /* Tamaño de fuente */
		transition: background-color 0.3s; /* Transición suave */
	}

	/* Estilo para el botón de búsqueda al pasar el ratón por encima */
	.search-button:hover {
		background-color: #0056b3; /* Cambio de color al pasar el ratón por encima */
	}

	/* Estilo para los campos de entrada */
	input[type='text'],
	input[type='number'] {
		width: calc(100% - 20px); /* Ancho completo menos el espacio del borde */
		padding: 10px; /* Espaciado interno */
		margin: 10px 0; /* Margen superior e inferior */
		border: 1px solid #ced4da; /* Borde */
		border-radius: 4px; /* Bordes redondeados */
		font-size: 14px; /* Tamaño de fuente */
	}
	.search-button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		margin-right: 10px; /* Espacio entre el botón y otros elementos */
	}

	.search-button .material-icons {
		font-size: 24px; /* Tamaño del ícono */
		color: #007bff; /* Color del ícono */
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

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		background-color: #70d0a2;
	}

	td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: justify;
	}

	.modal-content {
		background-color: #fefefe;
		margin: 15% auto;
		padding: 20px;
		border: 1px solid #888;
		width: 50%;
		border-radius: 5px;
		box-shadow:
			0 4px 8px 0 rgba(0, 0, 0, 0.2),
			0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}
</style>
