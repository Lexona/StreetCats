import {Comment, User } from "../models/database.model.js";

export class CommentController {
  /**
   * Create a new comment for a signal
   * Requires authentication
   */

  static async createComment(request, response, next) {
    try {
      const { text, signalId } = request.body;
      const userId = request.userId;
      
      if (!text || !signalId) {
        return next({status: 400, message: "Il testo e l'ID della segnalazione sono obbligatori"});
      }

      const newComment = await Comment.create({
        text: text,
        SignalId: signalId,
        UserId: userId   // Associate the comment with the logged-in user
      });

      // Retrieve the comment just created, including user data
      const fullComment = await Comment.findByPk(newComment.id, {
        include: [{
          model: User, 
          attributes: ['id', 'userName']
        }]
      });

      response.status(201).json(fullComment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Found all the comments of a specific signal
   * Public
   */

  static async getCommentBySignal(request, response, next) {
    try {
      const signalId = request.params.id;

      const comments = await Comment.findAll({
        where: { SignalId: signalId},
        include: [{
          model: User,
          attributes: ['userName']     // it includes the comment's author
        }]
      });

      response.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment
   * Requires authentication and authorization
   */

  static async deleteComment(request, response, next) {
    try {
      const commentId = request.params.id;
      const userId = request.userId;

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return next({status: 404, message: "Commento non trovato."});
      }

      // --- AGGIUNGI QUESTO PER IL DEBUG ---
      console.log('--- DEBUG CANCELLAZIONE ---');
      console.log('ID dal DB (commento.UtenteId):', comment.UserId, typeof comment.UserId);
      console.log('ID dal Token (utenteId):', userId, typeof userId);

      // check authorization
      if (comment.UserId !== userId) {
        return next({status: 403, message: "Non hai i permessi per eliminare questo commento."});
      }

      await comment.destroy();
      response.status(200).json({message: "Commento eliminato con successo."});
    } catch (error) {
      next(error);
    }
  }

}