/**
 * Messages standardisés pour les commandes
 */
export const ORDER_MESSAGES = {
  CREATED_SUCCESS: 'Commande créée avec succès',
  CANCELED_SUCCESS: 'Commande annulée',
  MARKED_PAID_SUCCESS: 'Commande marquée comme payée',
  NOT_FOUND: 'Commande introuvable',
  ALREADY_PAID: 'Cette commande est déjà payée',
  CANNOT_CANCEL: 'Impossible d\'annuler cette commande',
  SERVER_ERROR: 'Erreur lors du traitement de la commande',
} as const;

/**
 * Numéro de commande - séquence
 * (pour générer orderNumber unique et incrémental)
 */
export const ORDER_COUNTER_KEY = 'order_counter' as const;

/**
 * Valeurs par défaut
 */
export const ORDER_DEFAULTS = {
  shippingAddress: '2160 rue léger', // Adresse par défaut si pas de shipping
} as const;