import {NextFunction, Request, Response} from 'express';
import dns from 'dns/promises';
import * as ipaddr from 'ipaddr.js';
import {MeasureDto} from '@he_hurbreath/kpi-models-support-main';

// Middleware per validare e trasformare l'URL senza costruire un oggetto URL
export async function validateAndSanitizeUrlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const schemesList = ['http', 'https'];
  if (req.method !== 'POST') next();
  // Supponiamo che l'URL sia fornito nel body
  const measureDto: MeasureDto = req.body;
  const userUrl = measureDto.source.uri;

  if (!userUrl) {
    return res.status(400).json({error: 'Missing URL'});
  }

  try {
    // Valida manualmente il formato dell'URL senza usare new URL()
    const urlRegex = /^(https?):\/\/([^/]+)(\/.*)?$/;
    const match = urlRegex.exec(userUrl);

    if (!match) {
      return res.status(400).json({error: 'Invalid URL format'});
    }

    const [, protocol, domain, path] = match;

    // Verifica il protocollo (solo http o https sono accettati)
    if (!schemesList.includes(protocol)) {
      return res.status(400).json({error: 'Invalid protocol'});
    }

    // Risolvi il dominio in indirizzi IP
    const addresses = await dns.lookup(domain, {all: true});

    // Verifica se uno degli indirizzi risolti è privato, loopback o locale
    const isUnsafe = addresses.some(address => {
      const ip = ipaddr.parse(address.address);
      const range = ip.range();
      return (
        range === 'private' || range === 'loopback' || range === 'linkLocal'
      );
    });

    if (isUnsafe) {
      return res.status(400).json({error: 'Unsafe URL'});
    }

    // Invece di passare l'URL, passa i componenti separati dell'URL (protocollo, dominio, percorso)
    req.body.sanitizedUrlParts = {
      protocol,
      domain,
      path,
    };

    // Prosegui verso il controller
    next();
  } catch (err) {
    console.error('Error during URL validation:', err);
    return res.status(500).json({error: 'Internal server error'});
  }
}
