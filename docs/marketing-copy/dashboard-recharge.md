# Copie validée — Page Recharge (/dashboard/recharge)

Statut : **validé pour intégration** (texte uniquement, code non modifié).
Source : `src/app/dashboard/recharge/page.tsx` + clés `recharge.*` dans `src/lib/i18n.tsx`.

⚠️ **Constat important** : PayPal est actuellement désactivé sur cet écran ("Momentanément indisponible"). Seul Moneroo (Mobile Money : MTN, Orange, Moov, Wave) est actif. Toute la copie marketing déjà validée dans les autres fichiers a été corrigée en conséquence (retrait des mentions PayPal tant qu'il n'est pas réactivé) — voir `accueil.md` et `dashboard-accueil.md`.

- **Titre :** Recharger mon wallet
- **Sous-titre :** MTN, Orange, Moov ou Wave — crédité en quelques secondes.
- **Libellé sous Moneroo (mobileMoneyHint) :** MTN, Orange, Moov, Wave — crédit instantané
- **Taux :** 1 XAF = 1 Auri *(inchangé)*
- **Bouton d'action :** Créditer {montant} Auri *(inchangé)*
- Reste (labels erreurs, montant libre, PayPal "Momentanément indisponible") : inchangé.
