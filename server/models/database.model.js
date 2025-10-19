import {Sequelize} from "sequelize";
import {createModel as createUserModel} from "./utente.model.js";
import {createModel as createCatModel} from "./gatto.model.js";
import {createModel as createCommentModel} from "./commento.model.js";
import 'dotenv/config.js';

// connessione al database
export const database = new Sequelize (
  process.env.DB_NOME,
  process.env.DB_UTENTE,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORTA,
    dialect: 'postgres',
    logging: false    // false perché usiamo già Morgan per i log HTTP
  }
);

createUserModel(database);
createCatModel(database);
createCommentModel(database);

export const {Utente, Gatto, Commento} = database.models;

// associazioni
Utente.hasMany(Gatto);
Gatto.belongsTo(Utente);

Gatto.hasMany(Commento);
Commento.belongsTo(Gatto);

Utente.hasMany(Commento);
Commento.belongsTo(Utente);