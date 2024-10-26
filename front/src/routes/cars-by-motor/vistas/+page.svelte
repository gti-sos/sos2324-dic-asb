<script>
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';

	let API_ASB = '/api/v2/cars-by-motor';
	let errMsg = '';
	let errorMsg = '';
	let exitoMsg = '';

	if (dev) {
		API_ASB = 'http://localhost:8080' + API_ASB;
	}

	async function getInitialCars(){
        try{
           
            if(gdp.length === 0){

                let response = await fetch(API_ASB+"/loadInitialData",{
                                      method: "GET"
                });

                if(response.ok){
                    exitoMsg = "Datos cargados correctamente";
                    errorMsg = "";
                } else {
                    errorMsg = "Ya existen datos en la base de datos";
                }
            } else {
                errorMsg = "Ya existen datos en la base de datos";
            }
            
        } catch(e){
            errorMsg = e;
        }
        
    }
	async function getCars() {
		try {
			await getInitialCars();
			let response = await fetch(`${API_ASB}?limit=10000`, {
				method: 'GET'
			});

			if (response.ok) {
				let data = await response.json();
				getGrafica1(data);
				getGrafica2(data);
				getGrafica3(data);
				return data;
			} else {
				if (response.status == 404) {
					errMsg = 'No hay datos en la base de datos';
				} else {
					errMsg = `Error ${response.status}: ${response.statusText}`;
				}
			}
		} catch (e) {
			errMsg = e;
		}
	}
	async function getGrafica1(data) {
		try {
			const parsedData = parseData(data); // Parsear los datos del backend
			createDynamicChart(parsedData); // Crear el gráfico dinámico con los datos parseados
		} catch (error) {
			console.error('Error al procesar los datos:', error);
		}
	}

	function parseData(data) {
		// Crear un objeto para almacenar los valores acumulados por motor_nrg
		const motorData = {};

		// Iterar sobre los datos y acumular los valores por motor_nrg
		data.forEach((item) => {
			const motorName = item.motor_nrg; // Nombre del motor_nrg
			const obsValue = item.obs_value; // Valor asociado (obs_value)

			// Si el motor_nrg ya existe en el objeto, acumular el valor
			if (motorData.hasOwnProperty(motorName)) {
				motorData[motorName] += obsValue;
			} else {
				// Si el motor_nrg no existe en el objeto, inicializarlo con el valor
				motorData[motorName] = obsValue;
			}
		});

		// Convertir el objeto acumulado en un array de objetos para Highcharts
		const parsedData = Object.keys(motorData).map((motorName) => {
			return {
				name: motorName,
				y: motorData[motorName]
			};
		});

		return parsedData;
	}

	function createDynamicChart(data) {
		// Aquí creas el gráfico dinámico utilizando Highcharts.chart y los datos parseados.
		Highcharts.chart('container', {
			chart: {
				type: 'pie'
			},
			title: {
				text: 'Coches por energía del motor',
				align: 'center'
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
			},
			accessibility: {
				point: {
					valueSuffix: '%'
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					borderWidth: 2,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						format: '<b>{point.name}</b><br>{point.percentage}%',
						distance: 20
					}
				}
			},
			series: [
				{
					// Disable mouse tracking on load, enable after custom animation
					enableMouseTracking: false,
					animation: {
						duration: 2000
					},
					colorByPoint: true,
					data: data // Aquí pasas los datos parseados
				}
			]
		});
	}

	async function getGrafica2(data) {
		try {
			const parsedData = parseData2(data); // Parsear los datos del backend
			createDynamicChart2(parsedData); // Crear el gráfico dinámico con los datos parseados
		} catch (error) {
			console.error('Error al procesar los datos:', error);
		}
	}

	function parseData2(data) {
		// Crear un objeto para almacenar los valores de road_deaths_per_million_inhabitants por país
		const countryData = {};

		// Iterar sobre los datos y acumular los valores por país
		data.forEach((item) => {
			const countryName = item.geo; // Nombre del país
			const roadDeaths = item.road_deaths_per_million_inhabitants; // Valor de road_deaths_per_million_inhabitants

			// Si el país ya existe en el objeto, acumular el valor de roadDeaths
			if (countryData.hasOwnProperty(countryName)) {
				countryData[countryName] += roadDeaths;
			} else {
				// Si el país no existe en el objeto, inicializarlo con el valor de roadDeaths
				countryData[countryName] = roadDeaths;
			}
		});

		// Convertir el objeto acumulado en un array de objetos para Highcharts
		const parsedData = Object.keys(countryData).map((countryName) => {
			return {
				name: countryName,
				y: countryData[countryName]
			};
		});

		return parsedData;
	}

	function createDynamicChart2(data) {
		// Aquí creas el gráfico dinámico utilizando Highcharts.chart y los datos parseados.
		Highcharts.chart('container2', {
			chart: {
				type: 'cylinder',
				options3d: {
					enabled: true,
					alpha: 15,
					beta: 15,
					depth: 50,
					viewDistance: 25
				}
			},
			title: {
				text: 'Road Deaths per Million Inhabitants by Country'
			},
			xAxis: {
				categories: data.map((item) => item.name), // Países en el eje X
				title: {
					text: 'Countries'
				},
				labels: {
					skew3d: true
				}
			},
			yAxis: {
				title: {
					margin: 20,
					text: 'Road Deaths per Million Inhabitants'
				},
				labels: {
					skew3d: true
				}
			},
			tooltip: {
				headerFormat: '<b>Country: {point.x}</b><br>',
				pointFormat: 'Road Deaths per Million Inhabitants: <b>{point.y}</b>'
			},
			plotOptions: {
				series: {
					depth: 25,
					colorByPoint: true
				}
			},
			series: [
				{
					data: data, // Datos parseados con nombres de países y valores de muertes en carretera
					name: 'Road Deaths per Million Inhabitants',
					showInLegend: false
				}
			]
		});
	}

	async function getGrafica3(data) {
		try {
			const parsedData = parseData3(data); // Parsear los datos del backend
			createDynamicChart3(parsedData); // Crear el gráfico dinámico con los datos parseados
		} catch (error) {
			console.error('Error al procesar los datos:', error);
		}
	}

	function parseData3(data) {
		// Crear un objeto para almacenar los valores de millions_of_passenger_per_kilometres por país
		const countryData = {};

		// Iterar sobre los datos y acumular los valores por país
		data.forEach((item) => {
			const countryName = item.geo; // Nombre del país
			const passengerKilometres = item.millions_of_passenger_per_kilometres; // Valor de millions_of_passenger_per_kilometres

			// Si el país ya existe en el objeto, acumular el valor de passengerKilometres
			if (countryData.hasOwnProperty(countryName)) {
				countryData[countryName] += passengerKilometres;
			} else {
				// Si el país no existe en el objeto, inicializarlo con el valor de passengerKilometres
				countryData[countryName] = passengerKilometres;
			}
		});

		// Convertir el objeto acumulado en un array de objetos para Highcharts
		const parsedData = Object.keys(countryData).map((countryName) => {
			return {
				name: countryName,
				y: countryData[countryName]
			};
		});

		return parsedData;
	}

	function createDynamicChart3(data) {
		var chart = JSC.chart('container3', {
			debug: true,
			defaultSeries_type: 'column',
			legend_visible: false,
			defaultPoint_label_visible: true,
			yAxis_visible: false,
			xAxis_defaultTick: {
				placement: 'outside',
				label_style: {
					color: '#000',
					fontWeight: 'bold'
				}
			},
			title_label_text: '<span class="chart-title">Million of passenger per KM</span>',
			title_label_align: 'center',
			series: [
				{
					name: 'Country',
					palette: 'default',
					points: data.map((item) => {
						return {
							name: item.name,
							y: item.y
						};
					})
				}
			]
		});
	}

	onMount(async () => {
		await getInitialCars();
		await getCars();
	});
</script>

<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-3d.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <script src="https://code.highcharts.com/modules/cylinder.js"></script>

    <script src="https://code.jscharting.com/latest/jscharting.js"></script>
    <script src="https://code.jscharting.com/latest/modules/types.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
            color: #333;
            margin: 0;
            padding: 0;
        }

        #container,
        #container2,
        #container3 {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-title {
            font-size: 20px;
            font-weight: bold;
        }
    </style>
</svelte:head>

<div id="container" style="width:100%; height:400px;"></div>
<div id="container2" style="width:100%; height:400px;"></div>
<div id="container3" style="width:100%; height:400px;"></div>
