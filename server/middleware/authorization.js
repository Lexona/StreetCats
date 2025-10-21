import { AuthenticationController } from "../controller/authentication.controller.js";

/**
 * Check that the user is authenticated.
 * If not, you will be redirected to the login page with an error message.
 */

export function applyAuthentication(request, response, next) {
  const authHeader = request.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    next({status: 401, message: "Non autorizzato."});
    return;
  }

  AuthenticationController.checkAccessToken(token, (errore, decodedToken) => {
    if(errore) {
      next({status: 401, message: "Non autorizzato."});
    } else {
      request.username = decodedToken.user;
      next();
    }
  });
}