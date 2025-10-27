import express from "express";
import { SignalController } from "../controller/signal.controller.js";
import { applyAuthentication } from "../middleware/authorization.js";
import { upload } from "../middleware/upload.middleware.js";

export const signalRouter = express.Router();

// PUBLIC ROUTES

/**
 * @swagger
 * /signals:
 * get:
 * summary: Returns all signals
 * tags: [Signals]
 * responses:
 * '200':
 * description: List of all signals
 */

signalRouter.get("/", SignalController.getSignals);

/**
 * @swagger
 * /signals/{id}:
 *  get:
 * summary: Returns a specific signal
 * tags: [Signals]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * '200':
 * description: Details of the signal
 * '404':
 * description: Signal not found
 */

signalRouter.get("/:id", SignalController.getSignalById);

// PRIVATE ROUTES

/**
 * @swagger
 * /signals:
 * post:
 * summary: Create a new signal with image upload
 * tags: [Signals]
 * security:
 * - bearerAuth: [] # Indicates that the Bearer Token is required
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * titolo:
 * type: string
 * descrizione:
 * type: string
 * lat:
 * type: number
 * lng:
 * type: number
 * responses:
 * '201':
 * description: Signal created
 * '400':
 * description: Invalid input
 */

signalRouter.post("/", applyAuthentication, upload.single('photo'), SignalController.createSignal);

/**
 * @swagger
 * /segnalazioni/{id}:
 * delete:
 * summary: Delete a signal (owner only)
 * tags: [Signals]
 * security:
 * - bearerAuth: [] # Indicates that the Bearer Token is required
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * '200':
 * description: Signal deleted
 * '403':
 * description: Non autorizzato (non sei il proprietario)
 * '404':
 * description: Report not found
 */

signalRouter.delete("/:id", applyAuthentication, SignalController.deleteSignal);