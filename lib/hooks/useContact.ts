'use client';

import { useCallback, useState } from 'react';
import { useLocale } from 'next-intl';

export interface UseContactState {
  prenom: string;
  nom: string;
  telephone: string;
  bureau: string;
  entreprise: string;
  courriel: string;
  raison: string;
  error: string | null;
  success: string | null;
  loading: string | null;
}

export interface UseContactActions {
  setPrenom: (value: string) => void;
  setNom: (value: string) => void;
  setTelephone: (value: string) => void;
  setBureau: (value: string) => void;
  setEntreprise: (value: string) => void;
  setCourriel: (value: string) => void;
  setRaison: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useContact(): [UseContactState, UseContactActions] {
  const locale = useLocale();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [bureau, setBureau] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [courriel, setCourriel] = useState('');
  const [raison, setRaison] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      // Validation
      if (!prenom.trim()) {
        setError('Prénom requis');
        return;
      }
      if (!nom.trim()) {
        setError('Nom requis');
        return;
      }
      if (!telephone.trim()) {
        setError('Téléphone requis');
        return;
      }
      if (!courriel.trim()) {
        setError('Courriel requis');
        return;
      }
      if (!raison.trim()) {
        setError('Raison requise');
        return;
      }

      setLoading('Envoi du message...');

      try {
        const clientEmailHTML = `
          <h2>Bonjour ${prenom} ${nom},</h2>
          <p>Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.</p>
          <p><strong>Raison :</strong> ${raison}</p>
          <br/>
          <p>L'équipe Pancarte Express</p>
        `;

        const adminEmailHTML = `
          <h2>Nouvelle demande de contact</h2>
          <p><strong>Nom :</strong> ${prenom} ${nom}</p>
          <p><strong>Téléphone :</strong> ${telephone}</p>
          ${bureau ? `<p><strong>Bureau :</strong> ${bureau}</p>` : ''}
          <p><strong>Courriel :</strong> ${courriel}</p>
          ${entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ''}
          <p><strong>Raison :</strong> ${raison}</p>
        `;

        const res = await fetch(`/api/${locale}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: courriel,
            clientEmailHTML,
            adminEmailHTML,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Erreur envoi');
          return;
        }

        setSuccess('Message envoyé avec succès');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
      } finally {
        setLoading(null);
      }
    },
    [prenom, nom, telephone, bureau, courriel, entreprise, raison, locale]
  );

  const state: UseContactState = {
    prenom,
    nom,
    telephone,
    bureau,
    entreprise,
    courriel,
    raison,
    error,
    success,
    loading,
  };

  const actions: UseContactActions = {
    setPrenom,
    setNom,
    setTelephone,
    setBureau,
    setEntreprise,
    setCourriel,
    setRaison,
    handleSubmit,
  };

  return [state, actions];
}