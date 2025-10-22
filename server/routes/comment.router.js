import express from "express";
import { CommentController } from "../controller/comment.controller.js";
import { applyAuthentication } from "../middleware/authorization.js";

export const commentRouter = express.Router();

// -------- PRIVATE ROUTES --------

/**
 * @swagger
 * /comments:
 * post:
 * summary: Adds a comment to a signal
 * tags: [Comments]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * testo:
 * type: string
 * example: "It's true! I saw it too"
 * segnalazioneId:
 * type: integer
 * example: 1
 * responses:
 * '201':
 * description: Comment created
 */

commentRouter.post("/", applyAuthentication, CommentController.createComment);

/**
 * @swagger
 * /comments/{id}:
 * delete:
 * summary: Delete a comment (owner only)
 * tags: [Comments]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * '200':
 * description: Comment deleted
 * '403':
 * description: Unauthorized (you are not the owner)
 * '404':
 * description: Comment not found
 */

commentRouter.delete("/:id", applyAuthentication, CommentController.deleteComment);

// -------- PUBLIC ROUTES --------

/**
 * @swagger
 * /comments/signals/{id}:
 * get:
 * summary: Returns all comments for a report
 * tags: [Comments]
 * parameters:
 * - in: path
 * name: id
 * description: Signal's ID
 * required: true
 * schema:
 * type: integer
 * responses:
 * '200':
 * description: Comments list
 */

commentRouter.get("/signals/:id", CommentController.getCommentBySignal);



