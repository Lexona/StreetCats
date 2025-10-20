import { Utente } from "../models/database.model.js";
import Jwt from "jsonwebtoken";

export class AutenticazioneController {
  /**
   * Gestisce le richieste POST su /auth. Verifica che le credenziali fornite siano valide.
   * @param {http.IncomingMessage} request 
   * @param {http.ServerResponse} response 
   */
  static async controlloCredenziali(request, response) {
    let utente = new Utente({
      userName: request.body.usr,
      password: request.body.pwd
    });

    let trovato = await Utente.findOne({
      where: {
        userName: utente.userName,
        password: utente.password
      }
    });

    return trovato !== null;
  }

  // creazione di un nuovo utente
  static async creaUtente(request, response){
    let utente = new Utente({
      userName: request.body.usr,
      password: request.body.pwd
    });
    return utente.save();
  }

  /**
   * Genera un Token di Accesso (vita breve)
   * @param {object} username
   */
  static emissioneTokenAccesso(username){
    return Jwt.sign({user: username}, process.env.TOKEN_SECRET, {expiresIn: '15m'});
  }

  /**
   * Verifica un Token di Accesso
   */
  static controlloTokenAccesso(token, callback){
    Jwt.verify(token, process.env.TOKEN_SECRET, callback);
  }

  /**
   * Genera un Token di Aggiornamento (vita lunga)
   * @param {object} username
   */
  static emissioneTokenAggiornamento(username) {
    return Jwt.sign({user: username}, process.env.TOKEN_SECRET_AGGIORNAMENTO, { expiresIn: '7d' });
  }

  /**
   * Verifica un Token di Aggiornamento
   */
  static controlloTokenAggiornamento(token, callback){
    Jwt.verify(token, process.env.TOKEN_SECRET_AGGIORNAMENTO, callback);
  }
}