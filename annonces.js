// ============================================
// GESTION DES ANNONCES - TERANGA BIO SÉNÉGAL
// ============================================

// Charger le script des campagnes
let campagnesActives = [];

// Structure de données d'exemple (sera remplacée par Supabase plus tard)
let annonces = [
    {
        id: 1,
        format: 'video',
        mediaUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
        location: 'Dakar, Sénégal',
        product: 'Fruits',
        contact: '77 123 45 67',
        dateCreated: new Date().toISOString().split('T')[0], // Aujourd'hui
        isSponsored: false,
        views: 156
    },
    {
        id: 2,
        format: 'audio',
        mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        location: 'Thiès, Sénégal',
        product: 'Légumes',
        contact: '77 234 56 78',
        dateCreated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Il y a 2 jours
        isSponsored: false,
        views: 43
    },
    {
        id: 3,
        format: 'video',
        mediaUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
        location: 'Saint-Louis, Sénégal',
        product: 'Céréales',
        contact: '77 345 67 89',
        dateCreated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Il y a 10 jours
        isSponsored: true, // Annonce partenaire
        views: 892
    }
];

let currentPage = 0;
const itemsPerPage = 5;
let isLoading = false;
let currentCategorieFilter = null;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que le scroll est restauré au chargement
    document.body.style.overflow = '';
    
    // Charger le footer
    if (typeof loadFooter === 'function') {
        loadFooter();
    } else {
        // Charger le footer manuellement si la fonction n'existe pas
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            fetch('footer.html')
                .then(response => response.text())
                .then(html => {
                    footerPlaceholder.innerHTML = html;
                })
                .catch(err => console.error('Erreur lors du chargement du footer:', err));
        }
    }
    
    // Vérifier si un filtre de catégorie est présent dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const categorieFilter = urlParams.get('categorie');
    currentCategorieFilter = categorieFilter;
    
    // Le modal est maintenant géré par modal-publication.js
    
    // Charger les annonces
    loadAnnonces(categorieFilter);
    setupInfiniteScroll();
    setupMediaInteraction();
    
    // Afficher un indicateur de filtre actif si une catégorie est sélectionnée
    if (categorieFilter) {
        displayCategoryFilter(categorieFilter);
    }
    
});

// ============================================
// CHARGEMENT DES ANNONCES
// ============================================

function loadAnnonces(categorieFilter = null) {
    const feed = document.getElementById('annonces-feed');
    const loading = document.getElementById('annonces-loading');
    
    if (!feed) return;
    
    isLoading = true;
    
    // Charger les campagnes actives
    if (typeof getCampagnesActives === 'function') {
        campagnesActives = getCampagnesActives();
    }
    
    // Charger les annonces depuis localStorage ET le tableau statique
    const annoncesLocales = JSON.parse(localStorage.getItem('annonces_locales') || '[]');
    
    // Filtrer uniquement les annonces publiées (statut = 'publiee')
    const annoncesPubliees = annoncesLocales.filter(a => a.statut === 'publiee');
    
    // Combiner avec les annonces statiques (qui sont toujours considérées comme publiées)
    // Convertir les annonces statiques au bon format si nécessaire
    const annoncesStatiques = annonces.map(a => ({
        ...a,
        statut: 'publiee', // Les annonces statiques sont toujours publiées
        dateCreated: a.dateCreated || new Date().toISOString()
    }));
    
    // Combiner toutes les annonces publiées
    let annoncesToDisplay = [...annoncesStatiques, ...annoncesPubliees];
    
    // Trier par date (plus récentes en premier)
    annoncesToDisplay.sort((a, b) => {
        const dateA = new Date(a.dateCreated || a.dateCreation || 0);
        const dateB = new Date(b.dateCreated || b.dateCreation || 0);
        return dateB - dateA;
    });
    
    console.log('📢 Annonces chargées pour affichage:', annoncesToDisplay.length, annoncesToDisplay);
    
    // Filtrer les annonces par catégorie si un filtre est présent
    if (categorieFilter) {
        // Mapping des catégories (ID vers valeurs possibles stockées dans annonce.product)
        // Les annonces peuvent avoir product = "fruits", "légumes", etc. (avec accents maintenant)
        // ou "Fruits", "Légumes", etc. (texte du bouton)
        const categoryMapping = {
            'legumes': ['legumes', 'légumes', 'Légumes', 'Légumes'],
            'fruits': ['fruits', 'Fruits'],
            'cereales': ['cereales', 'céréales', 'Céréales', 'Céréales & légumineuses'],
            'transformes': ['transformes', 'produits transformés', 'Produits transformés'],
            'epices': ['epices', 'épices', 'Épices & condiments', 'épices & condiments'],
            'elevage': ['elevage', 'élevage', 'Produits d\'élevage', 'produits d\'élevage'],
            'semences': ['semences', 'Semences & plants', 'semences & plants'],
            'artisanaux': ['artisanal', 'artisanaux', 'Produits artisanaux bio', 'produits artisanaux bio'],
            'artisanal': ['artisanal', 'artisanaux', 'Produits artisanaux bio', 'produits artisanaux bio'],
            'autres': ['autre', 'Autre', 'Autres produits bio', 'autres produits bio'],
            'autre': ['autre', 'Autre', 'Autres produits bio', 'autres produits bio']
        };
        
        const categoryNames = categoryMapping[categorieFilter] || [categorieFilter];
        
        annoncesToDisplay = annoncesToDisplay.filter(annonce => {
            if (!annonce.product) return false;
            
            const productValue = String(annonce.product).toLowerCase().trim();
            
            // Vérifier si le produit correspond à l'une des variantes de la catégorie
            const matches = categoryNames.some(catName => {
                const catNameLower = String(catName).toLowerCase().trim();
                // Correspondance exacte ou partielle
                return productValue === catNameLower || 
                       productValue.includes(catNameLower) || 
                       catNameLower.includes(productValue);
            });
            
            if (matches) {
                console.log('✅ Annonce correspond à la catégorie:', annonce.product, '→', categorieFilter);
            }
            
            return matches;
        });
        
        console.log('🔍 Filtre catégorie:', categorieFilter, '→', categoryNames);
        console.log('📋 Annonces filtrées:', annoncesToDisplay.length, 'sur', annoncesToDisplay.length + (annoncesStatiques.length + annoncesPubliees.length - annoncesToDisplay.length));
    }
    
    // Réinitialiser la page si on change de filtre
    if (categorieFilter && currentPage === 0) {
        feed.innerHTML = '';
        currentPage = 0;
    }
    
    // Simuler un délai de chargement
    setTimeout(() => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const annoncesToLoad = annoncesToDisplay.slice(startIndex, endIndex);
        
        if (annoncesToLoad.length === 0) {
            if (loading) loading.style.display = 'none';
            if (currentPage === 0) {
                const emptyMessage = categorieFilter 
                    ? `<div class="annonces-empty"><p>Aucune annonce dans cette catégorie pour le moment.</p></div>`
                    : `<div class="annonces-empty"><p>Aucune annonce pour le moment. Soyez le premier à publier !</p></div>`;
                feed.innerHTML = emptyMessage;
            }
            isLoading = false;
            return;
        }
        
        if (loading) loading.style.display = 'none';
        
        // Intégrer les campagnes dans le feed : 1 campagne toutes les 6-8 annonces
        // Compter le nombre total d'annonces déjà affichées (pour éviter deux campagnes consécutives)
        const existingAnnonces = feed.querySelectorAll('.annonce-card').length;
        let annonceCount = existingAnnonces;
        let lastCampagneIndex = -1; // Pour éviter deux campagnes consécutives
        
        annoncesToLoad.forEach((annonce, index) => {
            const card = createAnnonceCard(annonce);
            feed.appendChild(card);
            annonceCount++;
            
            // Insérer une campagne toutes les 6-8 annonces (aléatoire entre 6 et 8)
            // Vérifier qu'on n'a pas déjà inséré une campagne juste avant
            const shouldInsertCampagne = annonceCount % 7 === 0 && campagnesActives.length > 0;
            
            if (shouldInsertCampagne) {
                // Choisir une campagne différente de la précédente
                let campagneIndex = Math.floor(Math.random() * campagnesActives.length);
                if (campagneIndex === lastCampagneIndex && campagnesActives.length > 1) {
                    campagneIndex = (campagneIndex + 1) % campagnesActives.length;
                }
                
                const campagne = campagnesActives[campagneIndex];
                if (campagne && typeof createCampagneCard === 'function') {
                    const campagneCard = createCampagneCard(campagne, 'feed');
                    feed.appendChild(campagneCard);
                    lastCampagneIndex = campagneIndex;
                }
            }
        });
        
        currentPage++;
        isLoading = false;
    }, 500);
}

// Normaliser le nom du produit pour l'affichage (corriger l'orthographe)
function normalizeProductName(product) {
    if (!product) return '';
    
    const productLower = product.toLowerCase().trim();
    const productMapping = {
        'legumes': 'Légumes',
        'légumes': 'Légumes',
        'fruits': 'Fruits',
        'cereales': 'Céréales',
        'céréales': 'Céréales',
        'transformes': 'Produits transformés',
        'produits transformés': 'Produits transformés',
        'autre': 'Autre',
        'epices': 'Épices & condiments',
        'épices': 'Épices & condiments',
        'elevage': 'Produits d\'élevage',
        'élevage': 'Produits d\'élevage',
        'semences': 'Semences & plants',
        'artisanal': 'Produits artisanaux bio',
        'artisanaux': 'Produits artisanaux bio'
    };
    
    // Si on trouve une correspondance exacte, l'utiliser
    if (productMapping[productLower]) {
        return productMapping[productLower];
    }
    
    // Sinon, capitaliser la première lettre et retourner
    return product.charAt(0).toUpperCase() + product.slice(1);
}

// Afficher un indicateur de filtre de catégorie actif
function displayCategoryFilter(categorieFilter) {
    const feed = document.getElementById('annonces-feed');
    if (!feed) return;
    
    const categoryMapping = {
        'legumes': 'Légumes',
        'fruits': 'Fruits',
        'cereales': 'Céréales & légumineuses',
        'transformes': 'Produits transformés',
        'epices': 'Épices & condiments',
        'elevage': 'Produits d\'élevage',
        'semences': 'Semences & plants',
        'artisanaux': 'Produits artisanaux bio'
    };
    
    const categoryName = categoryMapping[categorieFilter] || categorieFilter;
    
    const filterBanner = document.createElement('div');
    filterBanner.className = 'category-filter-banner';
    filterBanner.innerHTML = `
        <div class="filter-banner-content">
            <span class="filter-icon">🔍</span>
            <span class="filter-text">Filtre actif : ${categoryName}</span>
            <a href="annonces.html" class="filter-close" aria-label="Retirer le filtre">×</a>
        </div>
    `;
    
    feed.insertBefore(filterBanner, feed.firstChild);
}

// Fonction pour formater le nombre de vues
function formatViews(count) {
    if (count < 1000) {
        return count.toString();
    } else if (count < 1000000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
        return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
}

function createAnnonceCard(annonce) {
    const card = document.createElement('div');
    card.className = 'annonce-card';
    card.dataset.annonceId = annonce.id;
    
    // Déterminer le format (video, audio, ou image)
    const format = annonce.format || annonce.type;
    const isVideo = format === 'video' || annonce.type === 'video';
    const isAudio = format === 'audio' || annonce.type === 'audio';
    const isImage = format === 'image' || annonce.type === 'image' || annonce.type === 'image_only';
    
    let typeIcon = '📢';
    let typeText = 'Annonce';
    if (isVideo) {
        typeIcon = '🎥';
        typeText = 'Vidéo';
    } else if (isAudio) {
        typeIcon = '🎙';
        typeText = 'Audio';
    } else if (isImage) {
        typeIcon = '🖼️';
        typeText = 'Image';
    }
    
    // Calculer les indicateurs
    const dateCreated = new Date(annonce.dateCreated || annonce.dateCreation || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now - dateCreated);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const isRecent = diffDays <= 7; // Récente si moins de 7 jours
    const isSponsored = annonce.isSponsored || false;
    
    // Texte de la date relative
    let dateText = '';
    if (diffDays === 0) {
        dateText = "Publié aujourd'hui";
    } else if (diffDays === 1) {
        dateText = 'Publié il y a 1 jour';
    } else {
        dateText = `Publié il y a ${diffDays} jours`;
    }
    
    // Déterminer l'URL du média
    let mediaUrl = annonce.mediaUrl;
    if (isImage) {
        // Pour les images, utiliser imageUrl (base64) si disponible, sinon essayer avec le nom
        mediaUrl = annonce.imageUrl || annonce.mediaUrl || (annonce.image ? `images/annonces/${annonce.image}` : null);
    } else if (isVideo) {
        // Pour les vidéos, utiliser videoUrl (base64) si disponible, sinon mediaUrl, sinon essayer avec le nom
        mediaUrl = annonce.videoUrl || annonce.mediaUrl || (annonce.video ? `videos/annonces/${annonce.video}` : null);
    } else if (isAudio) {
        // Pour les audios, utiliser audioUrl (base64) si disponible, sinon mediaUrl, sinon essayer avec le nom
        mediaUrl = annonce.audioUrl || annonce.mediaUrl || (annonce.audio ? `audio/annonces/${annonce.audio}` : null);
    }
    
    // Construire le HTML du média selon le type
    let mediaHTML = '';
    if (isImage) {
        // Pour les images, afficher directement l'image
        mediaHTML = `
            <div class="annonce-media-container image-only" data-media-url="${mediaUrl || ''}" data-format="image">
                ${mediaUrl ? 
                    `<img src="${mediaUrl}" alt="Annonce image" style="width: 100%; height: auto; border-radius: 10px; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="annonce-media-placeholder image" style="display: none;">
                         <div class="annonce-media-placeholder-icon">${typeIcon}</div>
                         <div class="annonce-media-placeholder-text">${typeText}</div>
                         <div class="annonce-media-placeholder-hint">Image non disponible</div>
                     </div>` :
                    `<div class="annonce-media-placeholder image">
                         <div class="annonce-media-placeholder-icon">${typeIcon}</div>
                         <div class="annonce-media-placeholder-text">${typeText}</div>
                         <div class="annonce-media-placeholder-hint">Image</div>
                     </div>`
                }
            </div>
        `;
    } else {
        // Pour vidéo et audio, utiliser le système de chargement à la demande
        mediaHTML = `
            <div class="annonce-media-container ${!isVideo ? 'audio-only' : ''}" data-media-url="${mediaUrl || ''}" data-format="${format}">
                <div class="annonce-media-placeholder ${!isVideo ? 'audio' : ''}">
                    <div class="annonce-media-placeholder-icon">${typeIcon}</div>
                    <div class="annonce-media-placeholder-text">${typeText}</div>
                    <div class="annonce-media-placeholder-hint">Cliquez pour charger</div>
                </div>
                ${isVideo ? `<video controls playsinline style="display: none;"></video>` : `<audio controls style="display: none;"></audio>`}
            </div>
        `;
    }
    
    card.innerHTML = `
        ${mediaHTML}
        <div class="annonce-type-badge">
            <span>${typeIcon}</span>
            <span>${typeText}</span>
        </div>
        <div class="annonce-views-badge">
            <span class="views-icon">👁️</span>
            <span class="views-count">${formatViews(annonce.views || 0)}</span>
        </div>
        <div class="annonce-indicators">
            ${isRecent ? '<span class="annonce-indicator annonce-indicator-recent">🟢 Annonce récente</span>' : ''}
            <span class="annonce-indicator annonce-indicator-date">🕒 ${dateText}</span>
            ${isSponsored ? '<span class="annonce-indicator annonce-indicator-sponsored">⭐ Annonce partenaire</span>' : ''}
        </div>
        <div class="annonce-content">
            <div class="annonce-info">
                <div class="annonce-info-item">
                    <span class="annonce-info-item-icon">📍</span>
                    <span class="annonce-info-item-text">${annonce.location}</span>
                </div>
                <div class="annonce-info-item">
                    <span class="annonce-info-item-icon">🧺</span>
                    <span class="annonce-info-item-text">${normalizeProductName(annonce.product)}</span>
                </div>
            </div>
            <button class="annonce-contact-btn" onclick="contacterVendeur('${annonce.contact}')">
                <span>📞</span>
                <span>Contacter le vendeur</span>
            </button>
        </div>
    `;
    
    return card;
}

// ============================================
// INTERACTION AVEC LES MÉDIAS
// ============================================

function setupMediaInteraction() {
    document.addEventListener('click', function(e) {
        const mediaContainer = e.target.closest('.annonce-media-container');
        if (mediaContainer && !mediaContainer.classList.contains('loaded')) {
            loadMedia(mediaContainer);
        }
    });
}

function loadMedia(container) {
    const mediaUrl = container.dataset.mediaUrl;
    const format = container.dataset.format;
    const placeholder = container.querySelector('.annonce-media-placeholder');
    
    // Pour les images, pas besoin de chargement à la demande, elles sont déjà affichées
    if (format === 'image') {
        return;
    }
    
    const media = container.querySelector(format === 'video' ? 'video' : 'audio');
    
    if (!media || !mediaUrl) return;
    
    // Récupérer l'ID de l'annonce pour incrémenter les vues
    const card = container.closest('.annonce-card');
    const annonceId = card ? parseInt(card.dataset.annonceId) : null;
    
    // Afficher un indicateur de chargement
    if (placeholder) {
        placeholder.querySelector('.annonce-media-placeholder-hint').textContent = 'Chargement...';
    }
    
    // Charger le média
    // Vérifier si c'est une URL base64 (commence par data:)
    if (mediaUrl && mediaUrl.startsWith('data:')) {
        // C'est une URL base64, l'utiliser directement
        media.src = mediaUrl;
        media.load();
    } else if (mediaUrl && (mediaUrl.startsWith('video_') || mediaUrl.startsWith('audio_'))) {
        // C'est une référence IndexedDB, récupérer le blob
        if (window.getBlobFromIndexedDB) {
            window.getBlobFromIndexedDB(mediaUrl).then(blob => {
                const url = URL.createObjectURL(blob);
                media.src = url;
                media.load();
                
                // Nettoyer l'URL blob quand le média est chargé
                media.addEventListener('loadeddata', () => {
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                    media.style.display = 'block';
                }, { once: true });
            }).catch(error => {
                console.error('❌ Erreur chargement depuis IndexedDB:', error);
                if (placeholder) {
                    placeholder.querySelector('.annonce-media-placeholder-hint').textContent = 'Média non disponible';
                }
            });
        } else {
            console.error('❌ getBlobFromIndexedDB non disponible');
            if (placeholder) {
                placeholder.querySelector('.annonce-media-placeholder-hint').textContent = 'Erreur de chargement';
            }
        }
    } else if (mediaUrl) {
        // C'est une URL normale
        media.src = mediaUrl;
        media.load();
    } else {
        console.error('❌ Aucune URL média disponible pour l\'annonce');
        if (placeholder) {
            placeholder.querySelector('.annonce-media-placeholder-hint').textContent = 'Média non disponible';
        }
        return;
    }
    
    let hasPlayed = false;
    
    media.addEventListener('loadeddata', function() {
        container.classList.add('loaded');
        if (placeholder) placeholder.style.display = 'none';
        media.style.display = 'block';
        media.classList.add('loaded');
    });
    
    media.addEventListener('error', function() {
        if (placeholder) {
            placeholder.querySelector('.annonce-media-placeholder-hint').textContent = 'Erreur de chargement';
        }
    });
    
    // Incrémenter les vues quand le média commence à jouer
    media.addEventListener('play', function() {
        container.classList.add('playing');
        
        // Incrémenter les vues une seule fois
        if (!hasPlayed && annonceId) {
            hasPlayed = true;
            incrementViews(annonceId);
        }
    });
    
    media.addEventListener('pause', function() {
        container.classList.remove('playing');
    });
    
    // Pause quand le média se termine
    media.addEventListener('ended', function() {
        container.classList.remove('playing');
    });
}

// Fonction pour incrémenter le compteur de vues
function incrementViews(annonceId) {
    // Trouver l'annonce dans le tableau
    const annonce = annonces.find(a => a.id === annonceId);
    if (annonce) {
        annonce.views = (annonce.views || 0) + 1;
        
        // Mettre à jour l'affichage du badge de vues
        const card = document.querySelector(`.annonce-card[data-annonce-id="${annonceId}"]`);
        if (card) {
            const viewsBadge = card.querySelector('.annonce-views-badge .views-count');
            if (viewsBadge) {
                viewsBadge.textContent = formatViews(annonce.views);
            }
        }
        
        // Ici, on enverrait la mise à jour à Supabase
        // Exemple: updateAnnonceViews(annonceId, annonce.views);
    }
}

// ============================================
// INFINITE SCROLL
// ============================================

function setupInfiniteScroll() {
    let ticking = false;
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                checkScrollPosition();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function checkScrollPosition() {
    if (isLoading) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Charger plus d'annonces quand on approche du bas (200px avant la fin)
    if (scrollPosition >= documentHeight - 200) {
        loadAnnonces();
    }
}

// ============================================
// CONTACT VENDEUR
// ============================================

function contacterVendeur(contact) {
    // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
    const cleanNumber = contact.replace(/\s+/g, '').replace(/-/g, '');
    
    // Créer le lien WhatsApp
    const whatsappUrl = `https://wa.me/221${cleanNumber}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

// ============================================
// LOGIQUE DU MODAL (réutilisée depuis index.html)
// ============================================

let modalLogicInitialized = false;

function initModalLogic() {
    // Éviter l'initialisation multiple
    if (modalLogicInitialized) {
        return;
    }
    
    // S'assurer que tous les éléments du modal existent
    const modalOverlay = document.getElementById('modal-publication');
    if (!modalOverlay) {
        console.warn('Modal overlay non trouvé');
        return;
    }
    
    modalLogicInitialized = true;
    
    let currentStep = 1;
    let selectedMode = null;
    let selectedFormat = null;
    let mediaRecorder = null;
    let recordedBlob = null;
    let stream = null;
    let timerInterval = null;
    let recordingTime = 0;
    const MAX_RECORDING_TIME = 90;
    
    const formData = {
        mode: null,
        format: null,
        media: null,
        location: null,
        product: null,
        contact: null
    };
    
    // ÉTAPE 1 : Choix du mode de publication
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectedMode = this.dataset.mode;
            formData.mode = selectedMode;
            
            if (selectedMode === 'record-video') {
                selectedFormat = 'video';
            } else if (selectedMode === 'record-audio') {
                selectedFormat = 'audio';
            } else if (selectedMode === 'import') {
                selectedFormat = null;
            }
            
            formData.format = selectedFormat;
            
            // Mettre en évidence le bouton sélectionné
            document.querySelectorAll('.format-btn').forEach(b => {
                b.style.borderColor = '#e0e0e0';
                b.style.background = '#f8f9fa';
            });
            
            if (selectedMode === 'record-video') {
                this.style.borderColor = '#1e6b3a';
                this.style.background = 'rgba(30, 107, 58, 0.1)';
            } else if (selectedMode === 'record-audio') {
                this.style.borderColor = '#FF8C00';
                this.style.background = 'rgba(255, 140, 0, 0.1)';
            } else {
                this.style.borderColor = '#2d8f4f';
                this.style.background = 'rgba(45, 143, 79, 0.1)';
            }
            
            setTimeout(() => {
                showStep(2);
                if (selectedMode === 'import') {
                    setupImport();
                } else {
                    setupRecording();
                }
            }, 300);
        });
    });
    
    // ÉTAPE 2 : Configuration
    function setupRecording() {
        const recordingSection = document.getElementById('recording-section');
        const importSection = document.getElementById('import-section');
        if (recordingSection) recordingSection.style.display = 'block';
        if (importSection) importSection.style.display = 'none';
        
        const videoPreview = document.getElementById('video-preview');
        const audioPreview = document.getElementById('audio-preview');
        const placeholder = document.getElementById('recording-placeholder');
        
        if (selectedFormat === 'video') {
            if (videoPreview) videoPreview.style.display = 'block';
            if (audioPreview) audioPreview.style.display = 'none';
            if (placeholder) placeholder.style.display = 'none';
        } else {
            if (videoPreview) videoPreview.style.display = 'none';
            if (audioPreview) audioPreview.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        }
    }
    
    function setupImport() {
        const recordingSection = document.getElementById('recording-section');
        const importSection = document.getElementById('import-section');
        if (recordingSection) recordingSection.style.display = 'none';
        if (importSection) importSection.style.display = 'block';
    }
    
    // Gestion de l'importation
    const fileInput = document.getElementById('file-input');
    const btnSelectFile = document.getElementById('btn-select-file');
    const btnChangeFile = document.getElementById('btn-change-file');
    
    if (btnSelectFile) {
        btnSelectFile.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }
    
    if (btnChangeFile) {
        btnChangeFile.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const isVideo = file.type.startsWith('video/');
            const isAudio = file.type.startsWith('audio/');
            
            if (!isVideo && !isAudio) {
                alert('Format non supporté. Veuillez choisir un fichier vidéo (MP4, MOV) ou audio (MP3, M4A).');
                return;
            }
            
            selectedFormat = isVideo ? 'video' : 'audio';
            formData.format = selectedFormat;
            
            recordedBlob = file;
            formData.media = recordedBlob;
            
            const fileURL = URL.createObjectURL(file);
            const importedVideoPreview = document.getElementById('imported-video-preview');
            const importedAudioPreview = document.getElementById('imported-audio-preview');
            const importPreview = document.getElementById('import-preview');
            const fileInfo = document.getElementById('file-info');
            
            if (isVideo && importedVideoPreview) {
                importedVideoPreview.src = fileURL;
                importedVideoPreview.style.display = 'block';
                if (importedAudioPreview) importedAudioPreview.style.display = 'none';
            } else if (isAudio && importedAudioPreview) {
                importedAudioPreview.src = fileURL;
                importedAudioPreview.style.display = 'block';
                if (importedVideoPreview) importedVideoPreview.style.display = 'none';
            }
            
            if (fileInfo) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                fileInfo.textContent = `Fichier: ${file.name} (${fileSizeMB} MB)`;
            }
            
            if (importPreview) importPreview.style.display = 'block';
            if (btnSelectFile) btnSelectFile.style.display = 'none';
            
            setTimeout(() => {
                showStep(3);
            }, 1000);
        });
    }
    
    // ÉTAPE 3 : Informations
    const btnContinue = document.getElementById('btn-continue-step3');
    if (btnContinue) {
        btnContinue.addEventListener('click', function() {
            const locationInput = document.getElementById('location-input');
            const locationText = document.getElementById('location-text');
            const contactInput = document.getElementById('contact-input');
            
            if (locationInput && locationInput.style.display !== 'none' && locationInput.value.trim()) {
                formData.location = locationInput.value.trim();
            } else if (locationText && locationText.textContent !== 'Utiliser ma position actuelle') {
                formData.location = locationText.textContent;
            }
            
            const selectedProduct = document.querySelector('.product-btn.selected');
            if (selectedProduct) {
                formData.product = selectedProduct.dataset.product;
            }
            
            if (contactInput && contactInput.value.trim()) {
                formData.contact = contactInput.value.trim();
            }
            
            if (!formData.location || !formData.product || !formData.contact) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Mettre à jour la prévisualisation
            const previewLocation = document.getElementById('preview-location');
            const previewProduct = document.getElementById('preview-product');
            const previewContact = document.getElementById('preview-contact');
            
            if (previewLocation) previewLocation.textContent = formData.location;
            if (previewProduct) previewProduct.textContent = selectedProduct ? selectedProduct.textContent : '-';
            if (previewContact) previewContact.textContent = formData.contact;
            
            updateFinalPreview();
            showStep(4);
        });
    }
    
    // Boutons de localisation et produits
    const btnLocation = document.getElementById('btn-location');
    const locationInput = document.getElementById('location-input');
    const locationText = document.getElementById('location-text');
    
    if (btnLocation) {
        btnLocation.addEventListener('click', function() {
            if (navigator.geolocation) {
                if (locationText) locationText.textContent = 'Localisation en cours...';
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        formData.location = `${lat}, ${lng}`;
                        if (locationText) locationText.textContent = 'Position actuelle utilisée';
                        if (btnLocation) {
                            btnLocation.style.background = 'rgba(30, 107, 58, 0.1)';
                            btnLocation.style.borderColor = '#1e6b3a';
                        }
                    },
                    function(error) {
                        if (locationText) locationText.textContent = 'Utiliser ma position actuelle';
                        if (locationInput) locationInput.style.display = 'block';
                        if (btnLocation) btnLocation.style.display = 'none';
                    }
                );
            } else {
                if (locationInput) locationInput.style.display = 'block';
                if (btnLocation) btnLocation.style.display = 'none';
            }
        });
    }
    
    document.querySelectorAll('.product-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.product-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // ÉTAPE 4 : Prévisualisation
    const btnModify = document.getElementById('btn-modify');
    const btnPublish = document.getElementById('btn-publish');
    
    if (btnModify) {
        btnModify.addEventListener('click', function() {
            showStep(3);
        });
    }
    
    if (btnPublish) {
        btnPublish.addEventListener('click', function() {
            // Ici, on enverrait les données à Supabase
            // Pour l'instant, on simule juste la publication
            console.log('Données à publier:', formData);
            showStep(5);
        });
    }
    
    // ÉTAPE 5 : Confirmation
    const btnCloseModal = document.getElementById('btn-close-modal');
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            // Recharger les annonces après publication
            setTimeout(() => {
                location.reload();
            }, 500);
        });
    }
    
    function updateFinalPreview() {
        if (!recordedBlob) return;
        
        const finalVideo = document.getElementById('final-video-preview');
        const finalAudio = document.getElementById('final-audio-preview');
        
        if (selectedFormat === 'video' && finalVideo) {
            finalVideo.src = URL.createObjectURL(recordedBlob);
            finalVideo.style.display = 'block';
            if (finalAudio) finalAudio.style.display = 'none';
        } else if (selectedFormat === 'audio' && finalAudio) {
            finalAudio.src = URL.createObjectURL(recordedBlob);
            finalAudio.style.display = 'block';
            if (finalVideo) finalVideo.style.display = 'none';
        }
    }
}

