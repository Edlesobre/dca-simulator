# DCA Simulator — Bitcoin, Ethereum, Solana

Simulateur de stratégie DCA (Dollar-Cost Averaging) avec suivi de portefeuille personnel. Données en temps réel via CoinGecko.

## Fonctionnalités

- **Simulateur DCA** : testez différents montants, durées et fréquences d'investissement sur BTC, ETH, SOL
- **Mon Portfolio** : enregistrez vos vrais achats, suivez votre P&L en temps réel
- **Données réelles** : prix historiques et actuels via l'API CoinGecko
- **Persistance** : vos investissements sont sauvegardés en localStorage

## Déployer sur Vercel

### Option 1 — Via GitHub (recommandé)

1. Créez un repo GitHub et pushez ce dossier :
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/VOTRE_USERNAME/dca-simulator.git
   git push -u origin main
   ```

2. Allez sur [vercel.com](https://vercel.com) → **New Project** → importez votre repo GitHub

3. Vercel détecte automatiquement Next.js → cliquez **Deploy**

### Option 2 — Via Vercel CLI

```bash
npm install -g vercel
npm install
vercel
```

## Développement local

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Stack

- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Chart.js** + react-chartjs-2
- **CoinGecko API** (gratuit, sans clé)
- **Vercel** pour l'hébergement

## Notes

- Les données CoinGecko sont mises en cache (1h pour l'historique, 1min pour les prix actuels) via `next: { revalidate }` pour rester dans les limites de l'API gratuite.
- Le portfolio est stocké en `localStorage` (côté client uniquement).
