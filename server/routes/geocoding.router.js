import express from 'express';
import axios from 'axios';

export const geocodingRouter = express.Router();

/**
 * @swagger
 * /geocoding/search:
 * get:
 * summary: Search for addresses using Nominatim
 * tags: [Geocoding]
 * parameters:
 * - in: query
 * name: q
 * required: true
 * schema:
 * type: string
 * description: Address to search
 * responses:
 * 200:
 * description: List of geocoding results
 * 400:
 * description: Missing query parameter
 * 500:
 * description: Geocoding service error
 */

geocodingRouter.get('/search', async (request, response, next) => {
  try {
    const {q} = request.query;

    if (!q) {
      return next({status: 400, message: 'Il parametro \'q\' è obbligatorio.'});
    }

    // call to Nominatim from the backend
    const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: q,
        format: 'json',
        limit: 5,
        addressdetails: 1
      }, 
      headers: {
        'User-Agent': 'StreetCats/1.0 (marta.pagliuso@hotmail.com)' 
      },
      timeout: 5000
    });

    // Transform the results into the format expected by the frontend
    const results = nominatimResponse.data.map(result => ({
      lat: result.lat, 
      lng: result.lon,
      display_name: result.display_name
    }));

    response.json(results);
  } catch (error) {
    console.error('Geocoding error: ', error.message);

    if (error.response?.status === 429) {
      return next({status: 429, message: 'Troppe richieste al servizio di geocoding. Riprova tra qualche minuto.'});
    }

    next({status: 500, message: 'Errore nella ricerca dell\'indirizzo.'});
  }
});