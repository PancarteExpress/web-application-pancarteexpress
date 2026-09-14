/**
 * Configuration des cookies de session
 */
export const SESSION_COOKIE_CONFIG = {
  name: 'session',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
} as const;

/**
 * Durée de session (en secondes)
 */
export const SESSION_DURATION = {
  default: undefined, // Expire quand navigateur ferme
  rememberMe: 30 * 24 * 60 * 60, // 30 jours
} as const;

/**
 * Configuration JWT
 */
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key', // À passer en .env
  expiresIn: '7d', // Durée du token
} as const;

/**
 * Messages d'erreur standardisés
 */
export const AUTH_ERRORS = {
  CSRF_TOKEN_MISSING: 'Token CSRF manquant',
  CSRF_TOKEN_INVALID: 'Token CSRF invalide',
  MISSING_CREDENTIALS: 'Email et mot de passe requis',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_NOT_VERIFIED: 'Email non vérifié. Vérifiez votre email d\'abord.',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  SERVER_ERROR: 'Erreur serveur',
} as const;