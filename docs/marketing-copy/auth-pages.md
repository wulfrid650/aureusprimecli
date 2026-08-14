# Copie validée — Pages d'authentification

Statut : **validé pour intégration** (texte uniquement, code non modifié).
Sources : `src/app/register/page.tsx`, `src/app/login/page.tsx`, `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/verification-email/page.tsx` + clés `auth.*` / `emailVerification.*` dans `src/lib/i18n.tsx`.

Ces pages sont à 95% des formulaires fonctionnels (labels de champs, erreurs de validation) — non retravaillés. Seuls les titres/sous-titres et messages de statut ont une dimension "copie" et sont listés ici. Règle de style appliquée partout ailleurs sur le site (pas de point d'exclamation) — corrigée ici pour cohérence.

## Connexion (/login)
- **Titre :** Bon retour *(retire le "!" de l'original)*
- **Sous-titre :** Connectez-vous pour accéder à votre espace *(inchangé)*

## Inscription (/register)
- **Titre :** Créer un compte *(inchangé)*
- **Sous-titre :** Rejoignez-nous et profitez des meilleures offres *(inchangé)*
- Mention légale (CGU/CGV/Confidentialité) : inchangée, purement fonctionnelle.

## Mot de passe oublié (/forgot-password)
- **Titre :** Mot de passe oublié *(inchangé)*
- **Sous-titre :** Entrez votre email et nous vous enverrons un lien de réinitialisation. *(inchangé)*
- **Message de succès :** Email envoyé *(retire le "!")*

## Réinitialisation (/reset-password)
- **Titre :** Nouveau mot de passe *(inchangé)*
- **Sous-titre :** Choisissez un nouveau mot de passe sécurisé. *(inchangé)*
- **Message de succès :** Mot de passe réinitialisé *(retire le "!")*
- Texte de redirection ("Vous allez être redirigé vers la connexion...") : inchangé.

## Vérification email (/verification-email)
Purement transactionnel (états déjà vérifié / lien invalide / succès, avec redirection automatique) — non retravaillé, pas de point d'exclamation présent.
