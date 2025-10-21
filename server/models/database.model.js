import {Sequelize} from "sequelize";
import {createModel as createUserModel} from "./user.model.js";
import {createModel as createSignalModel} from "./signal.model.js";
import {createModel as createCommentModel} from "./comment.model.js";
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
createSignalModel(database);
createCommentModel(database);

export const {User, Signal, Comment} = database.models;

// associazioni
User.hasMany(Signal);
Signal.belongsTo(User);

Signal.hasMany(Comment);
Comment.belongsTo(Signal);

User.hasMany(Comment);
Comment.belongsTo(User);