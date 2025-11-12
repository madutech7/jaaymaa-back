# Guide de Déploiement - Backend sur Vercel

Ce guide vous explique comment déployer le backend NestJS sur Vercel (version gratuite).

## Prérequis

1. Un compte Vercel (gratuit) : https://vercel.com
2. Un compte GitHub/GitLab/Bitbucket pour le repository
3. Une base de données PostgreSQL (Supabase gratuit ou autre)

## Étapes de Déploiement

### 1. Préparer le Repository

Assurez-vous que votre code est poussé sur GitHub/GitLab/Bitbucket.

### 2. Créer un Projet sur Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository
4. Sélectionnez le dossier `back` comme Root Directory

### 3. Configuration du Build

Dans les paramètres du projet Vercel :

- **Framework Preset**: Other
- **Root Directory**: `back`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Variables d'Environnement

Dans les paramètres du projet Vercel, ajoutez toutes les variables d'environnement nécessaires :

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-netlify-app.netlify.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-vercel-app.vercel.app/api/auth/google/callback
PORT=3000
NODE_ENV=production
```

### 5. Important : Mettre à jour Google OAuth

Dans Google Cloud Console, ajoutez l'URL de callback Vercel :

- **Authorized redirect URIs**: `https://your-vercel-app.vercel.app/api/auth/google/callback`
- **Authorized JavaScript origins**: `https://your-vercel-app.vercel.app`

### 6. Déployer

1. Vercel détectera automatiquement les changements
2. Le déploiement se fera automatiquement à chaque push sur la branche principale
3. Vous recevrez une URL comme : `https://your-app.vercel.app`

### 7. Tester l'API

Une fois déployé, testez l'API :

- API Base: `https://your-app.vercel.app/api`
- Swagger Docs: `https://your-app.vercel.app/api/docs`

## Limitations de la Version Gratuite

- **Fonctions Serverless**: 100 GB-heures/mois
- **Bandwidth**: 100 GB/mois
- **Builds**: Illimités
- **Timeout**: 10 secondes pour les fonctions serverless (Hobby plan)

## Notes Importantes

1. **Base de données**: Vercel ne fournit pas de base de données. Utilisez Supabase (gratuit) ou une autre solution.
2. **Cold Start**: Les fonctions serverless peuvent avoir un "cold start" de quelques secondes.
3. **CORS**: Assurez-vous que `FRONTEND_URL` pointe vers votre URL Netlify.

## Dépannage

### Erreur de Build

- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez que le build fonctionne localement : `npm run build`

### Erreur CORS

- Vérifiez que `FRONTEND_URL` est correctement configuré
- Vérifiez les headers CORS dans `api/index.ts`

### Erreur de Base de Données

- Vérifiez que `DATABASE_URL` est correct
- Vérifiez que votre base de données accepte les connexions externes
