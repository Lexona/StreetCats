import { Signal, User, Comment } from "../models/database.model.js";

export class SignalController {

  /**
   * Create a new Signal
   * Requires authentication
   */

  static async createSignal(request, response, next){
    try {
      const {title, description, photo_url, latitude, longitude} = request.body;

      const userId = request.userId;

      if (!title || !latitude || !longitude || !photo_url) {
        return next({ status: 400, message: "Titolo, latitudine, longitudine e la foto sono obbligatori."});
      }

      const newSignal = await Signal.create({
        title: title, 
        description: description,
        photo_url: photo_url,
        latitude: latitude,
        longitude: longitude,
        UserId: userId
      });

      response.status(202).json(newSignal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all signals
   * Public
   */

  static async getSignals(request, response, next) {
    try {
      const signals = await Signal.findAll({
        include: [{
          model: User,
          attributes: ['userName']
        }]
      });
      response.status(200).json(signals);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific signal
   * Public
   */

  static async getSignalById(request, response, next) {
    try {
      const id = request.params.id;
      const signal = await Signal.findByPk(id, {
        include: [
          {model: User, attributes: ['userName']},
          {model: Comment}
        ]
      });

      if (!signal) {
        next({ status: 404, message: "Segnalazione non trovata." });
      }

      response.status(200).json(signal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a signal
   * Requires authentication and authorization
   */

  static async deleteSignal(request, response, next) {
    try {
      const id = request.params.id;
      const userId = request.userId;

      const signal = await Signal.findByPk(id);

      if (!signal) {
        next({ status: 404, message: "Segnalazione non trovata." });
      }

      // check authorization
      if (signal.UserId !== userId) {
        return next({ status: 403, message: "Non hai i permessi per eliminare questa segnalazione." });
      }

      await signal.destroy();
      response.status(200).json({message: "Segnalazione eliminata con successo."});
    } catch (error) {
      next(error);
    }
  }
}