import express from "express";
import { AuthenticationController } from "../controller/authentication.controller.js";

export const authenticationRouter = express.Router();

/**
 * @swagger
 *  /auth:
 *    post:
 *      description: User authentication. Returns an Access Token and sets a Refresh Token (httpOnly cookie).
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: user credentials for authentication
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
 *          description: Authenticated user, returns the Access Token
 *        401:
 *          description: Invalid credentials
 */

authenticationRouter.post("/auth", async (request, response) => {
  let utente = await AuthenticationController.checkCredentials(request, response);
  if (utente) {
    const payload = { id: utente.id, user: utente.userName };

    const accessToken = AuthenticationController.issueAccessToken(payload);
    const refreshToken = AuthenticationController.issueRefreshToken(payload);

    // Invia il Token di Aggiornamento come cookie httpOnly (PIÙ SICURO)
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Il JS del client non può leggerlo
      secure: process.env.NODE_ENV === 'production', // Solo in HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 giorni (come il token)
    });

    response.json({accessToken: accessToken});
  } else {
    response.status(401);
    response.json({error: "Credenziali non valide, riprova."});
  }
});

/**
 * @swagger
 *  /register:
 *    post:
 *      description: User registration
 *      produces:
 *        - application/json
 *      requestBody:
 *        description: user credentials for authentication
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
 *          description: Registered user
 *        500:
 *          description: The user could not be saved.
 */

authenticationRouter.post("/register", (request, response, next) => {
  AuthenticationController.createUser(request, response)
    .then((user) => {
      response.status(201).json(user);
    }).catch((error) => {
      next({status: 500, message: "Non è stato possibile salvare l'utente."});
    })
});

/**
 * @swagger
 * /refresh:
 *   post:
 *    description: Use the Refresh Token (sent as an httpOnly cookie) to obtain a new short-lived Access Token.
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: cookie
 *      name: Refresh Token
 *      description: Il Refresh Token (automatically set by the browser).
 *      required: true
 *       schema:
 *        type: string
 *    responses:
 *      '200':
 *        description: New Access Token successfully generated.
 *    content:
 *        application/json:
 *          schema:
 *            type: object
 *          properties:
 *            accessToken:
 *              type: string
 *              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 *            '401':
 *              description: Refresh token not provided, invalid, or expired.
 *     content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              errore:
 *                type: string
 *                example: "Refresh token not found."
 */

authenticationRouter.post("/refresh", (request, response) => {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return response.status(401).json({ error: "Token di Aggiornamento non trovato." });
  }

  AuthenticationController.checkRefreshToken(refreshToken, (error, payload) => {
    if (error) {
      //token scaduto o non valido
      return response.status(401).json({ error: "Token di Aggiornamento non valido o scaduto. Effettuare login." });
    }

    const newPayload = { id: payload.id, user: payload.user };
    const newAccessToken = AuthenticationController.issueAccessToken(newPayload);

    response.json({accessToken: newAccessToken});
  });
});

/**
 * @swagger
 * /logout:
 *    post:
 *      description: Invalidate the Refresh Token by deleting the cookie.
 *      responses:
 *      200:
 *        description: You have successfully logged out.
 */

authenticationRouter.post("/logout", (request, response) => {
  response.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  response.status(200).json({ message: "Logout effettuato con successo." });
});