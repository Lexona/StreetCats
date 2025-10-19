import express from "express";
import cors from "cors";
import morgan from "morgan";

import 'dotenv/config.js';
import {database} from './models/database.model.js';


const app = express();
const PORT = 3000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// route di prova
app.get('/', (request, response) => {
  response.send("prova");
});

// gestore degli errori 
app.use((error, request, response, next) => {
  console.log(error.stack);
  response.status(error.status || 500).json({
    code: err.status || 500,
    description: err.message || "C'è stato un errore."
  });
});

// sincronizzazione e avvio del server
database.sync({alter: true})
  .then(() => {
    console.log('Database sincronizzato correttamente.');
    app.listen(PORT, () => {
      console.log(`Server in ascolto sulla porta ${PORT}`);
    });
  })
  .catch(error => {
    console.log('Errore nella sincronizzazione del database: ' + error.message);
    process.exit(1);
  });
