import express, { response } from "express";
import bodyParser from "body-parser";

import { API_ASB_v1 } from "./backend/api-ASB_v1.js";
import { API_ASB_v2 } from "./backend/api-ASB_v2.js";

//neDB
import dataStore from "nedb";
let db_ASB = new dataStore();

//Adaptador Svelte
import { handler } from "./front/build/handler.js";
import cors from "cors";
import request from "request";


console.log("B");
let app = express();
const PORT = process.env.PORT || 8081;

//Activar CORS 
const whitelist = [
    'http://127.0.0.1:8080',
    'https://car-api2.p.rapidapi.com/api/vin/1GTG6CEN0L1139305'
];



app.use(cors({
    "origin": "*",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));


console.log("C");
app.listen(PORT);
app.use(bodyParser.json());

API_ASB_v1(app, db_ASB);
API_ASB_v2(app, db_ASB);

//Crear ruta estática para poder mostrar vídeos
app.use('/videos', express.static('videos'))


//Hacemos uso de proxy

app.use("/proxyASB1", function (req, res) {
    console.log("/proxyASB1 --> se accede a ruta");
    const url = 'https://algobook-stock-api.p.rapidapi.com/api/v1/stocks?tickers=AMZN,AAPL,MSFT,GOOGL,KO,MCD';
    const options = {
        url: url,
        headers: {
            'X-RapidAPI-Key': '1ae5868997msh0a3205e591a7ed8p195ba3jsn5cbea63c1c53',
			'X-RapidAPI-Host': 'algobook-stock-api.p.rapidapi.com'
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            res.status(500).send(error);
        } else {
            console.log(response.statusCode);
            console.log(body);
            res.send(body);
        }
    });
})


app.use("/proxyASB3", function (req, res) {
    console.log("/proxyASB3 --> se accede a ruta");
    const url = 'https://mineable-coins.p.rapidapi.com/coins';
    const options = {
        url: url,
        headers: {
            'X-RapidAPI-Key': '1ae5868997msh0a3205e591a7ed8p195ba3jsn5cbea63c1c53',
            'X-RapidAPI-Host': 'mineable-coins.p.rapidapi.com'
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            res.status(500).send(error);
        } else {
            console.log(response.statusCode);
            console.log(body);
            res.send(body);
        }
    });
})

app.use("/proxyASB4", function (req, res) {
    console.log("/proxyASB4 --> se accede a ruta");
    const url = 'https://mmo-games.p.rapidapi.com/games';
    const options = {
        url: url,
        headers: {
            'X-RapidAPI-Key': '1ae5868997msh0a3205e591a7ed8p195ba3jsn5cbea63c1c53',
            'X-RapidAPI-Host': 'mmo-games.p.rapidapi.com'
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            res.status(500).send(error);
        } else {
            console.log(response.statusCode);
            console.log(body);
            res.send(body);
        }
    });
})

//Uso del handler
app.use(handler);

// Establecemos subdirectorios de la web
import path from "path";
//const path = require('path');
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use("/", express.static("./public"));
console.log(`Server listening on port ${PORT}`);


