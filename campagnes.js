// ============================================
// GESTION DES CAMPAGNES PARTENAIRES - TERANGA BIO SÉNÉGAL
// ============================================

// Structure de données des campagnes partenaires (sera remplacée par Supabase plus tard)
let campagnes = [
    {
        id: 1,
        titre: "Formation à l'agriculture bio",
        description: "Apprenez les techniques de l'agriculture biologique avec nos experts",
        type_campagne: "formation",
        zone_geographique: "Dakar, Thiès",
        categorie_associee: "legumes",
        porteur: "ONG Bio Sénégal",
        mediaUrl: null, // Vidéo ou audio optionnel
        format: null, // 'video' ou 'audio'
        date_debut: "2024-01-15",
        date_fin: "2024-02-15",
        statut: "active",
        objectif: "Former 50 producteurs aux techniques bio",
        contact: "77 123 45 67"
    },
    {
        id: 2,
        titre: "Achat groupé de semences bio",
        description: "Rejoignez notre groupe d'achat pour bénéficier de prix avantageux",
        type_campagne: "achat_groupé",
        zone_geographique: "Tout le Sénégal",
        categorie_associee: "semences",
        porteur: "Coopérative Bio Locale",
        mediaUrl: null,
        format: null,
        date_debut: "2024-01-20",
        date_fin: "2024-03-20",
        statut: "active",
        objectif: "Faciliter l'accès aux semences bio pour les producteurs",
        contact: "77 234 56 78"
    },
    {
        id: 3,
        titre: "Sensibilisation à la consommation bio",
        description: "Découvrez les bienfaits des produits bio locaux pour votre santé",
        type_campagne: "sensibilisation",
        zone_geographique: "Dakar",
        categorie_associee: null,
        porteur: "Ministère de l'Agriculture",
        mediaUrl: null,
        format: null,
        date_debut: "2024-02-01",
        date_fin: "2024-04-01",
        statut: "active",
        objectif: "Sensibiliser 1000 consommateurs aux produits bio",
        contact: "77 345 67 89"
    }
];

// Fonction pour obtenir les campagnes actives
function getCampagnesActives() {
    const now = new Date();
    return campagnes.filter(campagne => {
        if (campagne.statut !== 'active') return false;
        const dateDebut = new Date(campagne.date_debut);
        const dateFin = new Date(campagne.date_fin);
        return now >= dateDebut && now <= dateFin;
    });
}

// Fonction pour obtenir une campagne par catégorie
function getCampagneByCategorie(categorie) {
    const actives = getCampagnesActives();
    return actives.find(c => c.categorie_associee === categorie) || null;
}

// Fonction pour obtenir une campagne aléatoire (pour la page d'accueil)
function getCampagneAleatoire() {
    const actives = getCampagnesActives();
    if (actives.length === 0) return null;
    return actives[Math.floor(Math.random() * actives.length)];
}

// Fonction pour créer une carte de campagne
function createCampagneCard(campagne, context = 'feed') {
    const card = document.createElement('div');
    card.className = 'campagne-card';
    card.dataset.campagneId = campagne.id;
    
    const typeLabels = {
        'sensibilisation': 'Sensibilisation',
        'appel_producteurs': 'Appel à producteurs',
        'formation': 'Formation',
        'achat_groupé': 'Achat groupé',
        'autre': 'Autre'
    };
    
    const typeLabel = typeLabels[campagne.type_campagne] || campagne.type_campagne;
    
    let mediaHTML = '';
    if (campagne.mediaUrl && campagne.format) {
        if (campagne.format === 'video') {
            mediaHTML = `
                <div class="campagne-media-container">
                    <video class="campagne-media" data-src="${campagne.mediaUrl}" controls playsinline style="display: none;">
                        Votre navigateur ne supporte pas la vidéo.
                    </video>
                    <div class="campagne-media-placeholder" onclick="loadCampagneMedia(this)">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <p>Cliquez pour charger la vidéo</p>
                    </div>
                </div>
            `;
        } else if (campagne.format === 'audio') {
            mediaHTML = `
                <div class="campagne-media-container">
                    <audio class="campagne-media" data-src="${campagne.mediaUrl}" controls style="display: none;">
                        Votre navigateur ne supporte pas l'audio.
                    </audio>
                    <div class="campagne-media-placeholder" onclick="loadCampagneMedia(this)">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                        <p>Cliquez pour charger l'audio</p>
                    </div>
                </div>
            `;
        }
    }
    
    if (context === 'feed') {
        // Format pour le feed des annonces
        card.innerHTML = `
            <div class="campagne-badge">⭐ Campagne partenaire</div>
            ${mediaHTML}
            <div class="campagne-content">
                <h3 class="campagne-titre">${campagne.titre}</h3>
                <p class="campagne-description">${campagne.description}</p>
                <div class="campagne-info">
                    <div class="campagne-info-item">
                        <span class="campagne-icon">🏢</span>
                        <span>${campagne.porteur}</span>
                    </div>
                    <div class="campagne-info-item">
                        <span class="campagne-icon">📍</span>
                        <span>${campagne.zone_geographique}</span>
                    </div>
                    <div class="campagne-info-item">
                        <span class="campagne-icon">🎯</span>
                        <span>${typeLabel}</span>
                    </div>
                </div>
                <button class="btn-campagne" onclick="decouvrirCampagne(${campagne.id})">
                    Découvrir la campagne
                </button>
            </div>
        `;
    } else if (context === 'opportunites') {
        // Format pour la page Opportunités
        card.innerHTML = `
            <div class="campagne-opportunite-card">
                <div class="campagne-opportunite-header">
                    <h3>${campagne.titre}</h3>
                    <span class="campagne-type-badge">${typeLabel}</span>
                </div>
                <p class="campagne-objectif"><strong>Objectif:</strong> ${campagne.objectif}</p>
                <div class="campagne-opportunite-info">
                    <div class="campagne-info-item">
                        <span class="campagne-icon">📍</span>
                        <span>${campagne.zone_geographique}</span>
                    </div>
                    <div class="campagne-info-item">
                        <span class="campagne-icon">🏢</span>
                        <span>${campagne.porteur}</span>
                    </div>
                </div>
                <button class="btn-campagne-opportunite" onclick="participerCampagne(${campagne.id})">
                    Participer
                </button>
            </div>
        `;
    } else if (context === 'accueil') {
        // Format pour la page d'accueil (bandeau horizontal)
        card.className = 'campagne-card campagne-card-accueil';
        card.innerHTML = `
            <div class="campagne-badge">⭐ Campagne partenaire</div>
            <div class="campagne-accueil-content">
                <div class="campagne-accueil-text">
                    <h3>${campagne.titre}</h3>
                    <p>${campagne.description}</p>
                    <div class="campagne-accueil-info">
                        <span>🏢 ${campagne.porteur}</span>
                        <span>📍 ${campagne.zone_geographique}</span>
                    </div>
                    <button class="btn-campagne-accueil" onclick="decouvrirCampagne(${campagne.id})">
                        En savoir plus
                    </button>
                </div>
                ${mediaHTML ? `<div class="campagne-accueil-media">${mediaHTML}</div>` : ''}
            </div>
        `;
    } else if (context === 'categories') {
        // Format pour la page Catégories
        card.className = 'campagne-card campagne-card-categories';
        card.innerHTML = `
            <div class="campagne-categories-header">
                <span class="campagne-badge">⭐ Campagne en lien avec cette catégorie</span>
            </div>
            ${mediaHTML}
            <div class="campagne-content">
                <h3 class="campagne-titre">${campagne.titre}</h3>
                <p class="campagne-description">${campagne.description}</p>
                <div class="campagne-info">
                    <div class="campagne-info-item">
                        <span class="campagne-icon">🏢</span>
                        <span>${campagne.porteur}</span>
                    </div>
                    <div class="campagne-info-item">
                        <span class="campagne-icon">📍</span>
                        <span>${campagne.zone_geographique}</span>
                    </div>
                </div>
                <button class="btn-campagne" onclick="decouvrirCampagne(${campagne.id})">
                    Découvrir la campagne
                </button>
            </div>
        `;
    }
    
    return card;
}

// Fonction pour charger le média d'une campagne (lazy loading)
function loadCampagneMedia(placeholder) {
    const container = placeholder.closest('.campagne-media-container');
    const media = container.querySelector('.campagne-media');
    const src = media.dataset.src;
    
    if (media.tagName === 'VIDEO') {
        media.src = src;
        media.style.display = 'block';
        placeholder.style.display = 'none';
        media.load();
    } else if (media.tagName === 'AUDIO') {
        media.src = src;
        media.style.display = 'block';
        placeholder.style.display = 'none';
        media.load();
    }
}

// Fonction pour découvrir une campagne (ouvre les détails)
function decouvrirCampagne(campagneId) {
    const campagne = campagnes.find(c => c.id === campagneId);
    if (!campagne) return;
    
    // Pour l'instant, on redirige vers la page Opportunités
    // Plus tard, on pourra créer une page dédiée ou un modal
    window.location.href = `opportunite.html#campagne-${campagneId}`;
}

// Fonction pour participer à une campagne
function participerCampagne(campagneId) {
    const campagne = campagnes.find(c => c.id === campagneId);
    if (!campagne) return;
    
    // Ouvrir WhatsApp avec le contact de la campagne
    const whatsappUrl = `https://wa.me/${campagne.contact.replace(/\s/g, '')}`;
    window.open(whatsappUrl, '_blank');
}

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        campagnes,
        getCampagnesActives,
        getCampagneByCategorie,
        getCampagneAleatoire,
        createCampagneCard,
        loadCampagneMedia,
        decouvrirCampagne,
        participerCampagne
    };
}

