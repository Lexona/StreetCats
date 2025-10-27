import { Signal, User, Comment } from "../models/database.model.js";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SignalController {

  /**
   * Create a new Signal with file input
   * Requires authentication
   */

  static async createSignal(request, response, next){
    try {
      const {title, latitude, longitude} = request.body;

      // Validation of required fields
      if (!title || !latitude || !longitude) {
        return next({status: 400, message: 'Titolo, latitudine e longitudine sono obbligatori.'});
      }

      // check that a photo has been uploaded
      if (!request.file) {
        return next({status: 400, message: "La foto è obbligatoria"});
      }

      // Build the URL for the photo
      const photo_url = `/uploads/signals/${request.file.filename}`;

      // Create signal
      const newSignal = await Signal.create({
        title: title, 
        description: request.body.description || '',
        photo_url: photo_url,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        UserId: request.userId
      });

      // Retrieve the report with the user's data
      const signalWithUser = await Signal.findByPk(newSignal.id, {
        include: [{
          model: User,
          attributes: ['id', 'userName']
        }]
      });

      response.status(201).json(signalWithUser);
    } catch (error) {
      console.error('Errore nella creazione della segnalazione: ', error);
      next({status: 500, message: 'Errore nella creazione della segnalazione.'});
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
        }],
        order: [['createdAt', 'DESC']]
      });
      response.status(200).json(signals);
    } catch (error) {
      next({status: 500, message: 'Errore nel recupero delle segnalazioni.'});
    }
  }

  /**
   * Get a specific signal
   * Public
   */

  static async getSignalById(request, response, next) {
    try {
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
      next({status: 500, message: 'Errore nel recupero della segnalazione.'});
    }
  }

  /**
   * Delete a signal
   * Requires authentication and authorization
   */

  static async deleteSignal(request, response, next) {
    try {
      const signal = await Signal.findByPk(request.params.id);

      if (!signal) {
        next({ status: 404, message: "Segnalazione non trovata." });
      }

      // Verify that the user is the owner
      if (signal.UserId !== request.userId) {
        return next({ status: 403, message: "Non hai i permessi per eliminare questa segnalazione." });
      }

      // Delete the image file if it exists
      if (signal.photo_url) {
        const filePath = path.join(__dirname, '..', signal.photo_url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await signal.destroy();
      response.status(200).json({message: "Segnalazione eliminata con successo."});
    } catch (error) {
      next({status: 500, message: 'Errore nell\'eliminazione della segnalazione.'});
    }
  }
}