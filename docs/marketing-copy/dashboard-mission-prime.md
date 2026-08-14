# Copie validée — Mission Prime (accueil dashboard + /dashboard/missions)

Statut : **validé pour intégration** (texte uniquement, code non modifié).
Source : `src/components/dashboard/mission-prime-card.tsx`, `src/app/dashboard/missions/page.tsx` + clés `missionPrime.*` et `dashboard.missionPrimeTeaser*` dans `src/lib/i18n.tsx`.

Note : les libellés purement fonctionnels (Retour, Actualiser, Réessayer, Fermer, Continuer, Voir les détails, Étape X/Y, etc.) ne sont pas repris ici — inchangés.

## Teaser sur l'accueil dashboard (utilisateur sans accès Mission Prime)
- **Badge :** Bientôt disponible *(inchangé)*
- **Eyebrow :** Programme de fidélité *(inchangé)*
- **Titre :** Débloquez des récompenses en étant fidèle
- **Description :** Accumulez des Points Prime à chaque achat et échangez-les contre des Auri ou des abonnements offerts.

## Page /dashboard/missions

**Parcours terminé :**
- Titre : Félicitations, parcours terminé !
- Texte : Vous avez complété toutes les missions de cette série. De nouvelles missions arrivent bientôt.

**Titres de sections :**
- Missions restantes → **Prochaines missions**
- Vue d'ensemble progression → **Votre progression**

**Bloc Aureus+ (niveau Prime Elite) :**
- Titre "Prochaine évolution" *(inchangé)*
- Utilisateur déjà Prime Elite : Vous êtes au sommet du programme Prime. Aureus+ vous sera proposé en priorité dès son lancement.
- Utilisateur pas encore Elite (aureusPlusComingSoon) *(inchangé)* : Aureus+ est en préparation. Bientôt disponible.

**Conditions de la récompense Prime Elite :**
Cette récompense est offerte une seule fois, personnelle, non remboursable et ne se renouvelle pas automatiquement.

**Statuts de la récompense** *(inchangés)* :
- Votre abonnement de {days} jours est actif.
- Votre abonnement est en cours d'activation.
- L'activation nécessite l'intervention du support.
- Un abonnement éligible sera sélectionné prochainement.
