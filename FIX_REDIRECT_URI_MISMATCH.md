# 🔧 Résolution de l'erreur "redirect_uri_mismatch"

## Problème
L'erreur "redirect_uri_mismatch" signifie que l'URL de redirection utilisée par votre application ne correspond pas exactement à celle configurée dans Google Cloud Console.

## Solution

### Étape 1 : Vérifier l'URL de callback dans votre code

L'URL de callback configurée dans votre backend est :
```
http://localhost:3000/api/auth/google/callback
```

### Étape 2 : Configurer dans Google Cloud Console

1. **Allez sur Google Cloud Console** : https://console.cloud.google.com

2. **Sélectionnez votre projet** (celui avec le Client ID `913815971255-c7roggppm8apreht1sisijmpjlrumce1`)

3. **Naviguez vers les identifiants** :
   - Menu latéral → **APIs & Services** → **Credentials**

4. **Cliquez sur votre Client ID OAuth 2.0** :
   - `913815971255-c7roggppm8apreht1sisijmpjlrumce1.apps.googleusercontent.com`

5. **Dans la section "Authorized redirect URIs"**, ajoutez EXACTEMENT cette URL :
   ```
   http://localhost:3000/api/auth/google/callback
   ```

   ⚠️ **IMPORTANT** : L'URL doit correspondre EXACTEMENT, caractère par caractère :
   - ✅ `http://localhost:3000/api/auth/google/callback` (correct)
   - ❌ `https://localhost:3000/api/auth/google/callback` (mauvais protocole)
   - ❌ `http://localhost:3000/auth/google/callback` (chemin incorrect)
   - ❌ `http://127.0.0.1:3000/api/auth/google/callback` (adresse différente)
   - ❌ `http://localhost:3000/api/auth/google/callback/` (slash final)

6. **Dans la section "Authorized JavaScript origins"**, ajoutez :
   ```
   http://localhost:3000
   ```

7. **Cliquez sur "SAVE"** en bas de la page

### Étape 3 : Attendre la propagation

Les changements dans Google Cloud Console peuvent prendre **quelques minutes** à se propager. Attendez 2-3 minutes avant de réessayer.

### Étape 4 : Vérifier les logs du serveur

Quand vous démarrez votre serveur backend, vous devriez voir dans la console :
```
🔐 Google OAuth Configuration:
  Client ID: 913815971255-c7roggppm8apreht1sisijmpjlrumce1.apps.googleusercontent.com
  Client Secret: ✅ SET
  Callback URL: http://localhost:3000/api/auth/google/callback
```

Si vous voyez une URL différente, vérifiez votre fichier `.env` dans le dossier `back/`.

### Étape 5 : Tester à nouveau

1. Redémarrez votre serveur backend si nécessaire
2. Essayez de vous connecter avec Google depuis votre application
3. L'erreur devrait être résolue

## Vérifications supplémentaires

### Si vous utilisez un port différent

Si votre backend tourne sur un autre port (par exemple 3001), vous devez :

1. **Mettre à jour le fichier `.env`** dans `back/` :
   ```env
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   PORT=3001
   ```

2. **Mettre à jour Google Cloud Console** avec la nouvelle URL :
   ```
   http://localhost:3001/api/auth/google/callback
   ```

### Pour la production

Quand vous déployez en production, ajoutez également l'URL de production dans Google Cloud Console :
```
https://votre-domaine.com/api/auth/google/callback
```

Et mettez à jour votre fichier `.env` de production :
```env
GOOGLE_CALLBACK_URL=https://votre-domaine.com/api/auth/google/callback
FRONTEND_URL=https://votre-domaine.com
```

## Erreurs courantes

### Erreur : "redirect_uri_mismatch" persiste après configuration
- **Solution** : Attendez 2-3 minutes pour la propagation
- **Solution** : Vérifiez qu'il n'y a pas d'espaces avant/après l'URL dans Google Cloud Console
- **Solution** : Vérifiez que vous avez bien cliqué sur "SAVE"

### Erreur : L'URL semble correcte mais l'erreur persiste
- **Solution** : Vérifiez les logs du serveur pour voir l'URL exacte utilisée
- **Solution** : Assurez-vous que le fichier `.env` est bien lu (redémarrez le serveur)
- **Solution** : Vérifiez que vous utilisez le bon projet Google Cloud

## Checklist de vérification

- [ ] URL dans Google Cloud Console : `http://localhost:3000/api/auth/google/callback`
- [ ] URL dans le fichier `.env` : `GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback`
- [ ] JavaScript origin ajouté : `http://localhost:3000`
- [ ] Bouton "SAVE" cliqué dans Google Cloud Console
- [ ] Attendu 2-3 minutes pour la propagation
- [ ] Serveur backend redémarré
- [ ] Testé la connexion Google

