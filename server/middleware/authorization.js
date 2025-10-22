import { AuthenticationController } from "../controller/authentication.controller.js";

/**
 * Check that the user is authenticated.
 * If not, you will be redirected to the login page with an error message.
 */

export function applyAuthentication(request, response, next) {
  const authHeader = request.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return next({status: 401, message: "Non autorizzato."});
  }

  AuthenticationController.checkAccessToken(token, (error, decodedToken) => {
    if(error) {
      return next({status: 401, message: "Non autorizzato."});
    } else {
      request.userId = decodedToken.id;
      request.username = decodedToken.user;     // non so se serve
      next();
    }
  });
}