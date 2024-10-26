import bodyParser from "body-parser";
import express from "express";
const app = express();
const API_BASE = "/api/v1"
app.use(bodyParser.json());



function API_ASB_v1 (app,db_ASB){
    //GET

    app.get(API_BASE + "/cars-by-motor/docs", (req, res) => {
      const documentationURL = 'https://documenter.getpostman.com/view/33057699/2sA2xpRU3f';

      // Redirigir al portal de documentación
      res.redirect(documentationURL);
  });

  app.get(API_BASE + "/cars-by-motor", (req, res) => {
      const queryParams = req.query; // Obtener los parámetros de consulta de la solicitud

      //Parseo
      const numericAttributes = ["pgeo", "limit", "offset"]; // Añadir cualquier parámetro numérico adicional aquí
      numericAttributes.forEach(attr => {
          if (queryParams[attr]) {
              queryParams[attr] = parseInt(queryParams[attr]);
              if (isNaN(queryParams[attr])) {
                  return res.status(400).send("Bad Request");
              }
          }
      });

      // Paginación
      const pgeo = queryParams.pgeo || 1; // Página predeterminada: 1
      const limit = queryParams.limit || 10; // Límite predeterminado: 10
      const offset = (pgeo - 1) * limit; // Calcular el número de documentos a saltar

      // Objeto para almacenar parámetros de consulta parseados
      const parsedQueryParams = {};

      // Especificación de tipos de datos
      const dataTypes = {
        'id':'number',
        'dataflow': 'string',
        'last_update': 'string',
        'freq': 'string',
        'unit': 'string',
        'mot_nrg': 'string',
        'geo': 'string',
        'time_period': 'number',
        'obs_value': 'number',
        'obs_flag': 'string',
        'millions_of_passenger_per_kilometres': 'number',
        'road_deaths_per_million_inhabitants': 'number'
      };

      // Eliminar parámetros de paginación de queryParams
      delete queryParams.pgeo;
      delete queryParams.limit;
      delete queryParams.offset;

      // Parsear los valores de los parámetros de consulta según el tipo de dato especificado
      for (const key in queryParams) {
          const value = queryParams[key];
          const dataType = dataTypes[key];

          if (dataType === 'number') {
              parsedQueryParams[key] = parseFloat(value);
          } else {
              parsedQueryParams[key] = value;
          }
      }

      // Realizar la búsqueda en la base de datos con los parámetros de consulta parseados y ordenados por ID, con paginación
      db_ASB.find(parsedQueryParams).sort({ id: 1 }).skip(offset).limit(limit).exec((err, data) => {
          if (err) {
              // Si hay un error en la base de datos, enviar error 500 Internal Server Error
              return res.status(500).send("Internal Error");
          }
          if (data.length === 0) {
              // Si no se encontraron datos, enviar error 404 Not Found
              return res.status(404).send("Data not found");
          }

          // Eliminar el campo 'id' de cada objeto en el array 'data'
          const responseData = data.map(item => {
              const { _id, ...rest } = item;
              return rest;
          });

          // Si se encontraron datos, enviar los resultados en formato JSON sin el campo 'id'
          res.json(responseData);
      });
  });

  app.get(API_BASE + "/cars-by-motor/:geo/:time_period", (req, res) => {
    const geo = req.params.geo;
    const time_period = parseInt(req.params.time_period);

    // Verificar time_period válido
    if (isNaN(time_period)) {
        return res.sendStatus(400).send("Bad Request");
    }

    // Aplica el filtro de geo y time_period
    db_ASB.find({ geo: geo, time_period: time_period }, { _id: 0, id: 0 })
        .exec((err, data) => {
            if (err) {
                return res.sendStatus(500).send("Internal Error");
            }

            if (data.length === 0) {
                return res.sendStatus(404).send("Not Found");
            }

            res.status(200).json(data[0]);
        });
});



  
  app.get(API_BASE + "/cars-by-motor/loadInitialData", (req, res) => {
    // Comprobar si la base de datos está vacía
    db_ASB.find({}, (err, dato) => {
        if (err) {
            res.sendStatus(500, "Internal Error");
        }
        if (dato.length === 0) {
            // Insertar los datos iniciales solo si la base de datos está vacía
            db_ASB.insert(datosBU, (err, newDocs) => {
                if (err) {
                    res.sendStatus(500, "Internal Error");
                }
                res.sendStatus(200, "OK");
            });
        } else {

            res.sendStatus(200, "OK");
        }
    });
});
    //POST

    app.post(API_BASE + "/cars-by-motor", (req, res) => {
      const nuevosDatos = req.body;

      // Validar el JSON recibido
      const expectedKeys = ['dataflow', 'last_update', 'freq', 'unit', 'motor_nrg', 'geo', 'time_period', 
        'obs_value', 'obs_flag', 'millions_of_passenger_per_kilometres', 'road_deaths_per_million_inhabitants'];
      const actualKeys = Object.keys(nuevosDatos);
      const isValidJson = expectedKeys.every(key => actualKeys.includes(key));

      if (!isValidJson || actualKeys.length !== expectedKeys.length) {
          // El JSON no tiene la estructura esperada
          return res.status(400).send("Bad Request: JSON has invalid structure");
      }

      // Obtener el último ID y calcular el nuevo ID
      db_ASB.findOne({ geo: nuevosDatos.geo, time_period: nuevosDatos.time_period }, (err, existingEntry) => {
        if (err) {
            // Si hay un error en la base de datos, enviar error 500 Internal Server Error
            return res.status(500).send("Internal Error");
        }

        if (existingEntry) {
            // Si ya existe un elemento con los mismos valores para 'geo' y 'time_period', devolver error 409 Conflict
            return res.status(409).send("Conflict: Element with same 'geo' and 'time_period' already exists");
        }

        // Obtener el último ID y calcular el nuevo ID
        db_ASB.find({}).sort({ id: -1 }).limit(1).exec((err, lastEntry) => {
            if (err) {
                // Si hay un error en la base de datos, enviar error 500 Internal Server Error
                return res.status(500).send("Internal Error");
            }

            const newId = lastEntry.length === 0 ? 1 : lastEntry[0].id + 1;
            nuevosDatos.id = newId;

            // Insertar el nuevo dato en la base de datos
            db_ASB.insert(nuevosDatos, (err, newDoc) => {
                if (err) {
                    // Si hay un error en la base de datos, enviar error 500 Internal Server Error
                    return res.status(500).send("Internal Error");
                }
                // Enviar respuesta con código 201 Created
                res.status(201).send("Created");
            });
        });
    });
  });
  //DELETE
  app.delete(API_BASE + "/cars-by-motor", (req, res) => {
    db_ASB.remove({}, { multi: true }, (err, numRemoved) => {
        if (err) {
            // Si hay un error en la base de datos, enviar error 500 Internal Server Error
            return res.status(500).send("Internal Error");
        }
        // Enviar respuesta con código 200 OK
        res.status(200).send("Deleted all -> Datos ASB");
    });
});

app.delete(API_BASE + "/cars-by-motor/:geo", (req, res) => {
    const geoToDelete = req.params.geo;

    // Eliminar datos que coincidan con la edad especificada
    db_ASB.remove({ geo: geoToDelete }, { multi: true }, (err, numRemoved) => {
        if (err) {
            // Si hay un error en la base de datos, enviar error 500 Internal Server Error
            return res.status(500).send("Internal Error");
        }
        if (numRemoved === 0) {
            // Si no se encontraron datos para eliminar, enviar error 404 Not Found
            return res.status(404).send("Not Found: No data found with geo " + geoToDelete);
        }
        // Enviar respuesta con código 200 OK
        res.status(200).send("Deleted data with geo: " + geoToDelete);
    });
});

app.delete(API_BASE + "/cars-by-motor/:geo/:time_period", (req, res) => {
  const geoToDelete = req.params.geo;
  const timePeriodToDelete = parseInt(req.params.time_period);

  // Verificar si time_period es un número válido
  if (isNaN(timePeriodToDelete)) {
      return res.sendStatus(400, );
  }

  // Eliminar datos que coincidan con el geo y time_period especificados
  db_ASB.remove({ geo: geoToDelete, time_period: timePeriodToDelete }, { multi: true }, (err, numRemoved) => {
      if (err) {
          // Si hay un error en la base de datos, enviar error 500 Internal Server Error
          return res.status(500).send("Internal Error");
      }
      if (numRemoved === 0) {
          // Si no se encontraron datos para eliminar, enviar error 404 Not Found
          return res.status(404).send("Not Found: No data found with geo " + geoToDelete + " and time_period " + timePeriodToDelete);
      }
      // Enviar respuesta con código 200 OK
      res.status(200).send("Deleted data with geo: " + geoToDelete + " and time_period: " + timePeriodToDelete);
  });
});

    //PUT
  app.put(API_BASE + "/cars-by-motor/:geo/:time_period", (req, res) => {
    const geo = req.params.geo;
    const time_periodN = parseInt(req.params.time_period);
    const updatedTourism = req.body;

    // Verificar time_period 
    if (isNaN(time_periodN)) {
        return res.sendStatus(400);
    }

    // Verificar todos los parámetros 
    const expectedKeys = ['dataflow', 'last_update', 'freq', 'unit', 'motor_nrg', 'geo', 'time_period', 
    'obs_value', 'obs_flag', 'millions_of_passenger_per_kilometres', 'road_deaths_per_million_inhabitants'];
    const receivedKeys = Object.keys(updatedTourism);
    const missingKeys = expectedKeys.filter(key => !receivedKeys.includes(key));
    if (missingKeys.length > 0) {
        return res.sendStatus(400);
    }

    // Verificar geo y time_period
    if (geo !== updatedTourism.geo || time_periodN !== updatedTourism.time_period) {
        return res.sendStatus(400);
    }

    // Buscar el registro de turismo por geo y time_period y actualizarlo
    db_ASB.findOne({ geo: geo, time_period: time_periodN }, (err, existingTourism) => {
        if (err) {
            return res.sendStatus(500);
        }
        if (!existingTourism) {
            return res.sendStatus(404);
        }

        // Actualizar el turismo en la base de datos
        db_ASB.update({ geo: geo, time_period: time_periodN }, updatedTourism, {}, (err, numReplaced) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (numReplaced === 0) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    });
});


app.put(API_BASE + "/cars-by-motor", (req, res) => {
    res.sendStatus(405, "METHOD NOT ALLOWED");
});

  // Manejar todos los otros métodos no permitidos
    app.all(API_BASE + "/cars-by-motor/*", (req, res) => {
        res.sendStatus(405);
    });

    let backup_datos = [
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'AT',
          time_period: 2015,
          obs_value: 10125,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 90630,
          road_deaths_per_million_inhabitants: 479
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'AT',
          time_period: 2016,
          obs_value: 14459,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 93090,
          road_deaths_per_million_inhabitants: 432
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'AT',
          time_period: 2017,
          obs_value: 20180,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 94757,
          road_deaths_per_million_inhabitants: 414
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'BE',
          time_period: 2013,
          obs_value: 18859,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 132615,
          road_deaths_per_million_inhabitants: 764
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'BG',
          time_period: 2020,
          obs_value: 352488,
          obs_flag: 's',
          millions_of_passenger_per_kilometres: 8952700,
          road_deaths_per_million_inhabitants: 463
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'BG',
          time_period: 2021,
          obs_value: 374094,
          obs_flag: 's',
          millions_of_passenger_per_kilometres: 4803,
          road_deaths_per_million_inhabitants: 561
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'CZ',
          time_period: 2016,
          obs_value: 15885,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 87257,
          road_deaths_per_million_inhabitants: 611
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'CZ',
          time_period: 2017,
          obs_value: 18321,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 90049,
          road_deaths_per_million_inhabitants: 577
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'CZ',
          time_period: 2018,
          obs_value: 128315,
          obs_flag: 'b',
          millions_of_passenger_per_kilometres: 94193,
          road_deaths_per_million_inhabitants: 656
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'DE',
          time_period: 2020,
          obs_value: 749305,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 866646,
          road_deaths_per_million_inhabitants: 2719
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'DE',
          time_period: 2021,
          obs_value: 1042733,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 881373,
          road_deaths_per_million_inhabitants: 2562
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'DE',
          time_period: 2022,
          obs_value: 1431375,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 922440,
          road_deaths_per_million_inhabitants: 2788
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'DK',
          time_period: 2020,
          obs_value: 32140,
          obs_flag:    '',
          millions_of_passenger_per_kilometres: 69077,
          road_deaths_per_million_inhabitants: 163
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'DK',
          time_period: 2021,
          obs_value: 66926,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 71852,
          road_deaths_per_million_inhabitants: 130
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'DK',
          time_period: 2022,
          obs_value: 112952,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 76657,
          road_deaths_per_million_inhabitants: 154
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'ES',
          time_period: 2014,
          obs_value: 8059,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 350393,
          road_deaths_per_million_inhabitants: 1680
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'ES',
          time_period: 2015,
          obs_value: 13290,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 366092,
          road_deaths_per_million_inhabitants: 1689
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'FI',
          time_period: 2018,
          obs_value: 12688,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 75961,
          road_deaths_per_million_inhabitants: 239
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'FI',
          time_period: 2019,
          obs_value: 19106,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 75861,
          road_deaths_per_million_inhabitants: 211
        },
        {
          dataflow: 'ESTAT:ROAD_EQS_CARPDA(1.0)',
          last_update: '16/01/24 23:00:00',
          freq: 'A',
          unit: 'NR',
          mot_nrg: 'ALT',
          geo: 'FI',
          time_period: 2020,
          obs_value: 27694,
          obs_flag: '',
          millions_of_passenger_per_kilometres: 72061,
          road_deaths_per_million_inhabitants: 223
        }]
        const datosBU = backup_datos.map((entry, index) => {
            const { dataflow, last_update, ...rest } = entry;
            return { id: index + 1, ...rest };
      });
};  

export {API_ASB_v1};