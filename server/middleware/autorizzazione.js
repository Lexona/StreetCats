import { AutenticazioneController } from "../controller/autenticazione.controller.js";

/**
 * Controlla che l'utente sia autenticato.
 * In caso negativo, viene rendirizzato al login con un messaggio di errore
 */

export function applicaAutenticazione(request, response, next) {
  const authHeader = request.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    next({status: 401, message: "Non autorizzato."});
    return;
  }

  AutenticazioneController.controlloTokenAccesso(token, (errore, tokenDecodificato) => {
    if(errore) {
      next({status: 401, message: "Non autorizzato."});
    } else {
      request.username = tokenDecodificato.user;
      next();
    }
  });
}