# Audit routes front client - Aureus Prime

Date: 2026-05-24

## Etat de deploiement API

- API deployee par FTP avec le script `api.aureusprime.com/scripts/ftp-deploy.sh`.
- Paquet production-only sans `vendor`, conforme a `DEPLOY_UPLOAD_VENDOR=0`.
- Smoke test production OK:
  - `GET /api/v1/config`
  - `GET /api/v1/products`
  - `GET /api/v1/products/categories`
  - CORS depuis `https://app.aureusprime.com`
  - frontend accessible.

## Routes backend client disponibles

### Public

- `GET /api/v1/config`
- `GET /api/v1/products`
- `GET /api/v1/products/categories`
- `GET /api/v1/products/{slug}`
- `GET /api/v1/products/{slug}/variants`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/email/verify/{id}/{hash}`
- `GET /api/v1/kyc/documents/{kyc}/view` avec URL signee

### Client authentifie

- `POST /api/v1/auth/logout`
- `POST /api/v1/email/resend`
- `GET /api/v1/me`
- `PUT|PATCH /api/v1/me/profile`
- `POST /api/v1/me/password`
- `GET /api/v1/me/orders`
- `GET /api/v1/me/orders/{id}`
- `GET /api/v1/me/wallet`
- `GET /api/v1/me/wallet/transactions`
- `POST /api/v1/wallet/topup`
- `POST /api/v1/checkout`
- `POST /api/v1/checkout/paypal/capture`
- `POST /api/v1/checkout/moneroo/verify`
- `POST /api/v1/coupon/validate`
- `GET /api/v1/me/assignments`
- `GET /api/v1/me/subscriptions`
- `GET /api/v1/me/subscriptions/{id}`
- `POST /api/v1/me/subscriptions/{id}/renew`
- `POST /api/v1/me/subscriptions/{id}/cancel`
- `POST /api/v1/subscriptions`
- `GET /api/v1/invoices`
- `GET /api/v1/invoices/{id}`
- `GET /api/v1/invoices/{id}/summary`
- `GET /api/v1/invoices/{id}/view`
- `GET /api/v1/invoices/{id}/download`
- `GET /api/v1/me/invoices`
- `GET /api/v1/me/invoices/{id}`
- `GET /api/v1/me/invoices/{id}/download`
- `GET /api/v1/me/security/overview`
- `GET /api/v1/me/security/devices`
- `GET /api/v1/me/security/login-history`
- `POST /api/v1/me/security/not-me`
- `GET /api/v1/me/legal-acceptance/status`
- `POST /api/v1/me/legal-acceptance/accept`
- `POST /api/v1/kyc/student`
- `GET /api/v1/me/gift-cards`
- `POST /api/v1/gift-cards/redeem`
- `GET /api/v1/me/referral-code`
- `GET /api/v1/me/referrals`
- `GET /api/v1/me/referrals/stats`

## Routes consommees par le front actuellement

- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
  - `POST /api/v1/email/resend`
- Catalogue:
  - `GET /api/catalog/products` proxy Next vers `GET /api/v1/products`
  - `GET /api/catalog/products/{slug}` proxy Next vers `GET /api/v1/products/{slug}`
  - fallback direct `GET /api/v1/products`
  - fallback direct `GET /api/v1/products/{slug}`
- Dashboard client:
  - `GET /api/v1/me`
  - `PATCH /api/v1/me/profile`
  - `POST /api/v1/me/password`
  - `GET /api/v1/me/wallet`
  - `GET /api/v1/me/gift-cards`
  - `GET /api/v1/me/subscriptions`
  - `GET /api/v1/me/subscriptions/{id}`
  - `POST /api/v1/me/subscriptions/{id}/renew`
  - `GET /api/v1/me/security/overview`
  - `GET /api/v1/me/security/login-history`
  - `POST /api/v1/me/security/not-me`
  - `POST /api/v1/kyc/student`
- Checkout et recharge:
  - `POST /api/v1/checkout`
  - `POST /api/v1/checkout/paypal/capture`
  - `POST /api/v1/checkout/moneroo/verify`
  - `POST /api/v1/wallet/topup`
- Parrainage:
  - `GET /api/v1/me/referral-code`
  - `GET /api/v1/me/referrals`
  - `GET /api/v1/me/referrals/stats`

## Routes backend client non exploitees ou a verifier

Priorite haute:

- `GET /api/v1/me/orders`
- `GET /api/v1/me/orders/{id}`
- `GET /api/v1/me/assignments`
- `GET /api/v1/me/wallet/transactions`
- `POST /api/v1/me/subscriptions/{id}/cancel`
- `GET /api/v1/me/security/devices`
- `GET /api/v1/me/legal-acceptance/status`
- `POST /api/v1/me/legal-acceptance/accept`
- `GET /api/v1/me/invoices`
- `GET /api/v1/me/invoices/{id}`
- `GET /api/v1/me/invoices/{id}/download`

Priorite moyenne:

- `GET /api/v1/products/categories`
- `GET /api/v1/products/{slug}/variants`
- `POST /api/v1/coupon/validate`
- `POST /api/v1/gift-cards/redeem`
- `POST /api/v1/auth/logout`
- `GET /api/v1/invoices/*` alias hors `/me`

## Points a corriger cote front client

- La page wallet appelle seulement `GET /api/v1/me/wallet?per_page=100`; il faut verifier si l'historique vient vraiment de cette route ou basculer vers `GET /api/v1/me/wallet/transactions`.
- Les commandes client ne semblent pas avoir d'ecran dedie branche sur `GET /api/v1/me/orders`.
- Les credentials/assignments client doivent etre audites contre `GET /api/v1/me/assignments` et les donnees abonnement modernes.
- Les factures client existent cote API mais ne sont pas encore clairement exposees dans l'espace client.
- Le logout frontend doit appeler `POST /api/v1/auth/logout` avant suppression locale du token.
- Les categories/variants publics existent cote API mais le front privilegie surtout les `display_*` et `purchase_options` des produits.

## Commandes de validation utilisees

```bash
cd api.aureusprime.com
php artisan test
./scripts/test-production-deploy.sh

cd ../aureusprime-admin
flutter test

cd ../aureusprime-front
npm run lint
```
