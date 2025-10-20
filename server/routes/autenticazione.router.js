import express from "express";
import { AutenticazioneController } from "../controller/autenticazione.controller.js";

export const autenticazioneRouter = express.Router();

/**
 * @swagger
 *  /auth:
 *    post:
 *      description: Autenticazione utente. Restituisce un Token di Acesso e imposta un Token di Aggiornamento (cookie httpOnly).
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: credenziali utente per l'autenticazione
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                usr:
 *                  type: string
 *                  example: Marta
 *                pwd:
 *                  type: string
 *                  example: p4ssw0rd
 *      responses:
 *        200:
 *          description: Utente autenticato, restituisce il Token di Accesso
 *        401:
 *          description: Credenziali non valide
 */

autenticazioneRouter.post("/auth", async (request, response) => {
  let utente = await AutenticazioneController.controlloCredenziali(request, response);
  if (utente) {
    const payload = { id: utente.id, user: utente.userName };

    const tokenAccesso = AutenticazioneController.emissioneTokenAccesso(payload);
    const tokenAggiornamento = AutenticazioneController.emissioneTokenAggiornamento(payload);

    // Invia il Token di Aggiornamento come cookie httpOnly (PIÙ SICURO)
    response.cookie('tokenAggiornamento', tokenAggiornamento, {
      httpOnly: true, // Il JS del client non può leggerlo
      secure: process.env.NODE_ENV === 'production', // Solo in HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni (come il token)
    });

    response.json({accessToken: tokenAccesso});
  } else {
    response.status(401);
    response.json({errore: "Credenziali non valide, riprova."});
  }
});

/**
 * @swagger
 *  /iscrizione:
 *    post:
 *      description: Iscrizione utente
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: credenziali utente per l'autenticazione
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                usr:
 *                  type: string
 *                  example: Marta
 *                pwd:
 *                  type: string
 *                  example: p4ssw0rd
 *      responses:
 *        201:
 *          description: Utente iscritto
 *        500:
 *          description: Non è stato possibile salvare l'utente
 */

autenticazioneRouter.post("/iscrizione", (request, response, next) => {
  AutenticazioneController.creaUtente(request, response)
    .then((utente) => {
      response.status(201).json(utente);
    }).catch((errore) => {
      next({status: 500, message: "Non è stato possibile salvare l'utente."});
    })
});

/**
 * @swagger
 * /refresh:
 *   post:
 *    description: Usa il Token di Aggiornamento (inviato come cookie httpOnly) per ottenere un nuovo Access Token a vita breve.
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: cookie
 *      name: Token di Aggiornamento
 *      description: Il Token di Aggiornamento (impostato automaticamente dal browser).
 *      required: true
 *       schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: Nuovo Access Token generato con successo.
 *    content:
 *        application/json:
 *          schema:
 *            type: object
 *          properties:
 *            accessToken:
 *              type: string
 *              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *            '401':
 *              description: Token di Aggiornamento non fornito, non valido o scaduto.
 *     content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              errore:
 *                type: string
 *                example: "Token di Aggiornamento non trovato."
 */

autenticazioneRouter.post("/aggiornamento", (request, response) => {
  const tokenAggiornamento = request.cookies.tokenAggiornamento;

  if (!tokenAggiornamento) {
    return response.status(401).json({ errore: "Token di Aggiornamento non trovato." });
  }

  AutenticazioneController.controlloTokenAggiornamento(tokenAggiornamento, (errore, payload) => {
    if (errore) {
      //token scaduto o non valido
      return response.status(401).json({ errore: "Token di Aggiornamento non valido o scaduto. Effettuare login." });
    }

    const nuovoPayload = { id: payload.id, user: payload.user };
    const nuovoTokenAccesso = AutenticazioneController.emissioneTokenAccesso(nuovoPayload);

    response.json({accessToken: nuovoTokenAccesso});
  });
});

/**
 * @swagger
 * /logout:
 *    post:
 *      description: Invalida il Refresh Token cancellando il cookie.
 *      responses:
 *      200:
 *        description: Logout effettuato con successo.
 */

autenticazioneRouter.post("/logout", (request, response) => {
  response.clearCookie('tokenAggiornamento', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  response.status(200).json({ message: "Logout effettuato con successo." });
});