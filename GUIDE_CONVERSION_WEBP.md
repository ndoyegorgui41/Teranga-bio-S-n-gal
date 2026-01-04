# 🎨 Guide Rapide : Convertir l'Image en WebP

## ⚡ Méthode la Plus Simple (2 minutes)

### 1️⃣ Ouvrez Squoosh
👉 **https://squoosh.app/** dans votre navigateur

### 2️⃣ Glissez-déposez votre image
- Glissez `images/arrière plan.jpeg` dans la page
- Ou cliquez "Select an image"

### 3️⃣ Choisissez WebP
- Dans le panneau de **droite**, cliquez sur **"WebP"**

### 4️⃣ Ajustez la qualité
- **Qualité : 80-85** (recommandé)
- Surveillez la taille en bas à droite
- **Objectif : < 350 ko** ✅

### 5️⃣ Téléchargez
- Cliquez sur le bouton **"Download"** en bas
- Le fichier sera téléchargé

### 6️⃣ Renommez et placez
- Renommez le fichier téléchargé : `arrière plan.webp`
- Placez-le dans : `images/arrière plan.webp`

---

## ✅ Résultat Final

Votre dossier `images/` devrait contenir :
```
images/
├── arrière plan.jpeg  (118K - original)
├── arrière plan.webp  (< 350 ko - optimisé) ✅
└── logo1.jpeg
```

---

## 🧪 Test Rapide

1. Ouvrez `index.html` dans Chrome
2. F12 → Network → Filtrez "Img"
3. Rechargez la page
4. Vérifiez que `arrière plan.webp` est chargé (et non `.jpeg`)

---

## 📊 Comparaison Attendu

| Format | Taille | Avantage |
|--------|--------|----------|
| JPEG | 118K | Qualité |
| **WebP** | **~80-90K** | **-25% de taille, même qualité** ✅ |

---

## 💡 Astuce

Si la taille dépasse 350 ko, réduisez la qualité à 75-78 dans Squoosh et testez à nouveau.

---

**C'est tout ! Le code HTML est déjà configuré. Il suffit de créer le fichier `.webp` et tout fonctionnera automatiquement.** 🚀

