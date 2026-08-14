# Copie validée — Services & Souscriptions (dashboard)

Statut : **validé pour intégration** (texte uniquement, code non modifié).
Sources : `src/lib/i18n.tsx` — blocs `services`, `serviceDetail`, `subscriptions`. `checkout` et `serviceDetail` sont majoritairement transactionnels/fonctionnels — non retravaillés (résumé de commande, erreurs, statuts de paiement).

## Page /dashboard/services (catalogue interne)
- **Titre :** Tous les services
- **Description :** Le catalogue complet Aureus Prime. Souscrivez directement depuis votre wallet.
  *(remplace "Découvrez notre catalogue complet de services premium. Souscrivez en un clic depuis votre portefeuille !" — retire le point d'exclamation et la promesse "en un clic" non vérifiable)*
- Reste (compteurs, erreurs de chargement, "Voir plus") : inchangé.

## Page /dashboard/souscriptions
- **Titre :** Mes abonnements *(inchangé)*
- **En-tête :** Mes accès
- **Sous-titre :** Services actifs, échéances et renouvellements, en un seul endroit.
- Reste (onglets En cours/Actifs/À renouveler/Historique, cartes cadeaux, gestion du renouvellement auto) : inchangé — contenu fonctionnel.

## Page checkout (/dashboard/checkout/[id])
Purement transactionnel (résumé de commande, statuts de paiement, KYC, erreurs) — non retravaillé.
