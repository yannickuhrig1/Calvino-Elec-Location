import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// Map en mémoire (clé IP / action -> timestamps des requêtes)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Nettoyage périodique toutes les 5 minutes pour éviter l'accumulation mémoire
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts: number) => now - ts < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Extrait l'adresse IP client depuis les en-têtes de la requête (Vercel / Proxy / Direct)
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Vérifie et consomme un jeton de rate limit
 * @param identifier Identifiant unique (ex: IP ou IP:action)
 * @param maxRequests Nombre maximal de requêtes autorisées sur la fenêtre
 * @param windowSeconds Durée de la fenêtre glissante en secondes
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  let record = rateLimitMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Élaguer les requêtes antérieures à la fenêtre
  record.timestamps = record.timestamps.filter((ts: number) => ts > cutoff);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  // Enregistrer cette requête
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetInSeconds: windowSeconds,
  };
}
