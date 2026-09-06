'use client';

import { useProductsCache } from '../../../../hooks/useProductsCache';

export function ProductsCacheLoader() {
  useProductsCache();
  return null;
}