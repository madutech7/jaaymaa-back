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

Dans les paramètres du projet Vercel, ajoutez **UNIQUEMENT** les variables d'environnement suivantes :

**Variables OBLIGATOIRES :**

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-netlify-app.netlify.app
```

**Variables OPTIONNELLES (si vous utilisez Google OAuth) :**

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-vercel-app.vercel.app/api/auth/google/callback
```

**Variables à NE PAS ajouter (gérées automatiquement par Vercel) :**

- ❌ `PORT` - Vercel gère le port automatiquement
- ❌ `NODE_ENV` - Vercel définit automatiquement `production` en production
- ❌ `JWT_EXPIRES_IN` - Optionnel, valeur par défaut utilisée si non défini

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

### Erreur 500 (INTERNAL_SERVER_ERROR)

Si vous voyez une erreur 500 sur Vercel :

1. **Vérifiez les logs Vercel** :
   - Allez dans votre projet Vercel
   - Cliquez sur "Functions" dans le menu
   - Ouvrez les logs pour voir l'erreur exacte

2. **Vérifiez les variables d'environnement** :
   - Allez dans "Settings" > "Environment Variables"
   - Assurez-vous que `DATABASE_URL` et `JWT_SECRET` sont définis
   - Les logs afficheront maintenant quelles variables manquent

3. **Erreurs courantes** :
   - `DATABASE_URL` manquant ou incorrect → Vérifiez votre chaîne de connexion PostgreSQL
   - `JWT_SECRET` manquant → Ajoutez une valeur secrète aléatoire
   - Timeout de connexion à la base de données → Vérifiez que votre base de données accepte les connexions externes (whitelist IP si nécessaire)

4. **Testez localement** :
   - Copiez les variables d'environnement dans un fichier `.env`
   - Testez avec `npm run start:prod` pour reproduire l'erreur
