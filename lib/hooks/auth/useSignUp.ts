'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { signUpSchema } from '@/lib/validations/auth';

export interface UseSignUpState {
  // Form fields
  isGroup: boolean;
  groupName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  password: string;
  confirmPassword: string;
  needsPickup: boolean;
  pickupAddress: string;

  // UI states
  error: string | null;
  success: string | null;
  isLoading: boolean;
  csrfToken: string | null;
}

export interface UseSignUpActions {
  setIsGroup: (value: boolean) => void;
  setGroupName: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPhone: (value: string) => void;
  setEmail: (value: string) => void;
  setCompanyName: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setNeedsPickup: (value: boolean) => void;
  setPickupAddress: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<{ success: boolean; email?: string; redirect?: string }>;
}

export function useSignUp(): [UseSignUpState, UseSignUpActions] {
  const locale = useLocale();

  // Form fields
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [needsPickup, setNeedsPickup] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/csrf`);
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('[useSignUp] Erreur récupération CSRF:', err);
        setError('Erreur sécurité: impossible de charger le token');
      }
    };

    fetchCsrfToken();
  }, [locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ success: boolean; email?: string; redirect?: string }> => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      // Validation password confirmation
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return { success: false };
      }

      if (!csrfToken) {
        setError('Erreur sécurité: token manquant');
        return { success: false };
      }

      try {
        setIsLoading(true);

        // Valider avec Zod
        const validatedInput = signUpSchema.parse({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
          companyName: companyName.trim() || undefined,
          isGroup,
          groupName: isGroup ? groupName.trim() : undefined,
        });

        // Appeler l'API
        const response = await fetch(`/api/${locale}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify(validatedInput),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur lors de la création du compte');
          return { success: false };
        }

        setSuccess(data.message || 'Compte créé avec succès');
        
        return { 
          success: true, 
          email: email.trim().toLowerCase(),
          redirect: data.redirect 
        };

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [
      firstName,
      lastName,
      phone,
      email,
      password,
      confirmPassword,
      companyName,
      isGroup,
      groupName,
      csrfToken,
      locale,
    ]
  );

  const state: UseSignUpState = {
    isGroup,
    groupName,
    firstName,
    lastName,
    phone,
    email,
    companyName,
    password,
    confirmPassword,
    needsPickup,
    pickupAddress,
    error,
    success,
    isLoading,
    csrfToken,
  };

  const actions: UseSignUpActions = {
    setIsGroup,
    setGroupName,
    setFirstName,
    setLastName,
    setPhone,
    setEmail,
    setCompanyName,
    setPassword,
    setConfirmPassword,
    setNeedsPickup,
    setPickupAddress,
    handleSubmit,
  };

  return [state, actions];
}