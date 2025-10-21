import { User } from "../models/database.model.js";
import Jwt from "jsonwebtoken";

export class AuthenticationController {
  /**
   * Handles POST requests on /auth. Verifies that the credentials provided are valid.
   * @param {http.IncomingMessage} request 
   * @param {http.ServerResponse} response 
   */
  static async checkCredentials(request, response) {
    let user = new User({
      userName: request.body.usr,
      password: request.body.pwd
    });

    let found = await User.findOne({
      where: {
        userName: user.userName,
        password: user.password
      }
    });

    return found;
  }

  // creation of a new user
  static async createUser(request, response){
    let user = new User({
      userName: request.body.usr,
      password: request.body.pwd
    });
    return user.save();
  }

  /**
   * Generate an Access Token (short-lived)
   * @param {object} username
   */
  static issueAccessToken(payload){
    return Jwt.sign({user: payload}, process.env.TOKEN_SECRET, {expiresIn: '15m'});
  }

  /**
   * Verify an Access Token
   */
  static checkAccessToken(token, callback){
    Jwt.verify(token, process.env.TOKEN_SECRET, callback);
  }

  /**
   * Generate a Refresh Token (long life)
   * @param {object} username
   */
  static issueRefreshToken(payload) {
    return Jwt.sign({user: payload}, process.env.TOKEN_SECRET_AGGIORNAMENTO, { expiresIn: '7d' });
  }

  /**
   * Verify a Refresh Token
   */
  static checkRefreshToken(token, callback){
    Jwt.verify(token, process.env.TOKEN_SECRET_AGGIORNAMENTO, callback);
  }
}