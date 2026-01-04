# Instructions Simples pour Convertir en WebP

## 🎯 Méthode Recommandée : Squoosh (Le Plus Simple)

### Étape par étape :

1. **Ouvrez votre navigateur** et allez sur : **https://squoosh.app/**
   
2. **Glissez-déposez** le fichier `images/arrière plan.jpeg` dans la page web

3. **Dans le panneau de droite**, cliquez sur **"WebP"**

4. **Ajustez la qualité** :
   - Déplacez le curseur vers **80-85** (pour garantir < 350 ko)
   - Surveillez la taille du fichier en bas à droite
   - Objectif : **< 350 ko**

5. **Cliquez sur "Télécharger"** (bouton en bas)

6. **Renommez le fichier** téléchargé en : `arrière plan.webp`

7. **Déplacez le fichier** dans le dossier `images/` de votre projet

8. **Vérifiez** que vous avez maintenant :
   ```
   images/
   ├── arrière plan.jpeg  (fichier original - 118K)
   └── arrière plan.webp  (nouveau fichier - < 350 ko)
   ```

---

## ✅ Vérification

Après avoir créé le fichier `.webp`, ouvrez `index.html` dans votre navigateur et :
1. Ouvrez les DevTools (F12 ou Cmd+Option+I)
2. Onglet **Network**
3. Filtrez par **Img**
4. Rechargez la page
5. Vous devriez voir que `arrière plan.webp` est chargé (et non `.jpeg`)

---

## 🔄 Alternative : Installation des Outils (Optionnel)

Si vous préférez convertir depuis le terminal à l'avenir :

### Installer Homebrew (si pas déjà installé) :
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Installer les outils WebP :
```bash
brew install webp
```

### Convertir l'image :
```bash
cd "/Users/guest123/Desktop/Teranga Bio"
cwebp -q 80 "images/arrière plan.jpeg" -o "images/arrière plan.webp"
```

### Vérifier la taille :
```bash
ls -lh "images/arrière plan.webp"
```

---

## 📝 Note

Le code HTML est déjà configuré ! Il suffit de créer le fichier `.webp` et tout fonctionnera automatiquement. Les navigateurs modernes chargeront le `.webp`, les anciens chargeront le `.jpeg`.

