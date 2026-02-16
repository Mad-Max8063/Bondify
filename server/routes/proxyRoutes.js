import express from 'express';
import axios from 'axios';
const router = express.Router();

/**
 * Proxy para tiles de mapas
 * Soluciona el problema de CORS/CSP bloqueando requests externos
 */
router.get('/tiles/:provider/:z/:x/:y.:ext', async (req, res) => {
  const { provider, z, x, y, ext } = req.params;

  let tileUrl;

  switch (provider) {
    case 'osm':
      tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.${ext}`;
      break;
    case 'carto':
      const subdomain = ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)];
      tileUrl = `https://${subdomain}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.${ext}`;
      break;
    default:
      return res.status(400).send('Invalid provider');
  }

  try {
    const response = await axios.get(tileUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'MiParada/1.0'
      }
    });

    res.set('Content-Type', `image/${ext}`);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache por 1 día
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching tile:', error.message);
    // Devolver tile transparente en caso de error
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    res.set('Content-Type', 'image/png');
    res.send(transparentPng);
  }
});

export default router;
