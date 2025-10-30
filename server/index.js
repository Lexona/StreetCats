import express from "express";
import cors from "cors";
import morgan from "morgan";

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import cookieParser from 'cookie-parser';

import path from 'path';
import { fileURLToPath } from "url";

import 'dotenv/config.js';
import {database} from './models/database.model.js';

import { authenticationRouter } from "./routes/authentication.router.js";
import { signalRouter } from "./routes/signal.router.js";
import { commentRouter } from "./routes/comment.router.js";

import { geocodingRouter } from "./routes/geocoding.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true, 
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(cookieParser());

app.use('/geocoding', geocodingRouter);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// error handler 
app.use((error, request, response, next) => {
  console.log(error.stack);
  response.status(error.status || 500).json({
    code: error.status || 500,
    description: error.message || "C'è stato un errore."
  });
});

// initialization of swagger-jsdoc
const swagger = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'StreetCats REST API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*Router.js'],
});

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swagger));

app.use(authenticationRouter);
app.use("/signals", signalRouter);
app.use("/comments", commentRouter);

// server synchronization and startup
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
