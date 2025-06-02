// server/middleware/assets.js
import { join } from 'path';
import { createReadStream, statSync, existsSync } from 'fs';
import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Vérifier si la requête commence par /api/assets/
    const url = new URL(event.req.url, `http://${event.req.headers.host}`);
    if (!url.pathname.startsWith('/api/assets/')) {
      return; // Laisser passer les autres requêtes
    }
    
    // Extraire l'ID de l'asset à partir de l'URL
    const assetId = url.pathname.replace('/api/assets/', '');
    if (!assetId || assetId.includes('..')) {
      return createError({
        statusCode: 400,
        message: 'ID d\'asset invalide'
      });
    }
    
    // Chemins possibles pour chercher le fichier
    const possiblePaths = [
      join(process.cwd(), 'assets/uploads', assetId),
      join(process.cwd(), '../uploads', assetId),
      join('/mmr-frontend/assets/uploads', assetId)
    ];
    
    // Chercher le fichier dans les différents chemins possibles
    let filePath = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        filePath = p;
        break;
      }
    }
    
    if (!filePath) {
      console.log(`Asset non trouvé: ${assetId}`);
      return createError({
        statusCode: 404,
        message: 'Asset non trouvé'
      });
    }
    
    // Vérifier si c'est bien un fichier
    const stat = statSync(filePath);
    if (!stat.isFile()) {
      return createError({
        statusCode: 404,
        message: 'Ce n\'est pas un fichier'
      });
    }
    
    // Déterminer le type MIME
    const ext = filePath.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'pdf': 'application/pdf'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    event.res.setHeader('Content-Type', contentType);
    
    // Envoyer le fichier
    const stream = createReadStream(filePath);
    return sendStream(event, stream);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier:', error);
    return createError({
      statusCode: 500,
      message: 'Erreur serveur lors de la lecture du fichier'
    });
  }
});