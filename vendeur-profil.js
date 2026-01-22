// ============================================
// GESTION DU PROFIL VENDEUR - TERANGA BIO SÉNÉGAL
// ============================================

// Fonction pour charger les annonces d'un vendeur spécifique
function chargerAnnoncesVendeur(vendeurId) {
    let annoncesVendeur = [];
    
    // Récupérer le vendeur pour obtenir son contact
    const vendeur = trouverVendeur(vendeurId);
    if (!vendeur) {
        return [];
    }
    
    const contactVendeur = vendeur.telephone || vendeur.contact || '';
    if (!contactVendeur) {
        return [];
    }
    
    // Charger les annonces depuis localStorage
    try {
        const annoncesLocales = JSON.parse(localStorage.getItem('annonces_locales') || '[]');
        annoncesVendeur = annoncesLocales.filter(annonce => {
            const contactAnnonce = annonce.contact || '';
            // Comparer les contacts (normaliser les espaces)
            return contactAnnonce.replace(/\s/g, '') === contactVendeur.replace(/\s/g, '');
        });
    } catch (e) {
        console.error('Erreur lors du chargement des annonces locales:', e);
    }
    
    // Charger aussi depuis le tableau global annonces (si disponible)
    if (typeof annonces !== 'undefined' && Array.isArray(annonces)) {
        const annoncesGlobales = annonces.filter(annonce => {
            const contactAnnonce = annonce.contact || '';
            return contactAnnonce.replace(/\s/g, '') === contactVendeur.replace(/\s/g, '');
        });
        // Fusionner sans doublons (basé sur l'ID)
        annoncesGlobales.forEach(annonce => {
            if (!annoncesVendeur.find(a => a.id === annonce.id)) {
                annoncesVendeur.push(annonce);
            }
        });
    }
    
    // Trier par date (plus récentes en premier)
    annoncesVendeur.sort((a, b) => {
        const dateA = a.dateCreated ? new Date(a.dateCreated) : new Date(0);
        const dateB = b.dateCreated ? new Date(b.dateCreated) : new Date(0);
        return dateB - dateA;
    });
    
    return annoncesVendeur;
}

// Fonction pour créer une carte d'annonce
function creerCarteAnnonce(annonce) {
    const card = document.createElement('div');
    card.className = 'annonce-vendeur-card';
    
    // En-tête de l'annonce
    const header = document.createElement('div');
    header.className = 'annonce-vendeur-header';
    
    if (annonce.product) {
        const productP = document.createElement('p');
        productP.className = 'annonce-vendeur-product';
        productP.textContent = annonce.product;
        header.appendChild(productP);
    }
    
    if (annonce.location) {
        const locationP = document.createElement('p');
        locationP.className = 'annonce-vendeur-location';
        locationP.innerHTML = `📍 ${annonce.location}`;
        header.appendChild(locationP);
    }
    
    if (annonce.dateCreated) {
        const dateP = document.createElement('p');
        dateP.className = 'annonce-vendeur-date';
        const date = new Date(annonce.dateCreated);
        dateP.textContent = date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        header.appendChild(dateP);
    }
    
    card.appendChild(header);
    
    // Média (vidéo ou audio)
    const mediaContainer = document.createElement('div');
    mediaContainer.className = `annonce-vendeur-media ${annonce.format === 'audio' ? 'audio-only' : ''}`;
    
    if (annonce.format === 'video') {
        const video = document.createElement('video');
        video.src = annonce.mediaUrl;
        video.controls = true;
        video.preload = 'metadata';
        video.className = 'annonce-vendeur-video';
        mediaContainer.appendChild(video);
    } else if (annonce.format === 'audio') {
        const audio = document.createElement('audio');
        audio.src = annonce.mediaUrl;
        audio.controls = true;
        audio.preload = 'metadata';
        audio.className = 'annonce-vendeur-audio';
        mediaContainer.appendChild(audio);
    }
    
    card.appendChild(mediaContainer);
    
    return card;
}

// Fonction pour afficher le profil du vendeur
function afficherProfilVendeur() {
    // Récupérer l'ID du vendeur depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const vendeurId = parseInt(urlParams.get('id'));
    
    if (!vendeurId) {
        document.getElementById('vendeur-profil-nom').textContent = 'Vendeur introuvable';
        document.getElementById('annonces-vendeur-container').innerHTML = 
            '<p class="message-erreur">Aucun vendeur spécifié.</p>';
        return;
    }
    
    // Charger le vendeur
    const vendeur = trouverVendeur(vendeurId);
    if (!vendeur) {
        document.getElementById('vendeur-profil-nom').textContent = 'Vendeur introuvable';
        document.getElementById('annonces-vendeur-container').innerHTML = 
            '<p class="message-erreur">Ce vendeur n\'existe pas ou n\'est plus disponible.</p>';
        return;
    }
    
    // Afficher les informations du vendeur
    document.getElementById('vendeur-profil-nom').textContent = vendeur.nom || 'Vendeur';
    
    if (vendeur.zone) {
        document.getElementById('vendeur-profil-zone').textContent = `📍 ${vendeur.zone}`;
    }
    
    if (vendeur.description) {
        document.getElementById('vendeur-profil-description').textContent = vendeur.description;
    }
    
    // Configurer les boutons de contact
    if (vendeur.whatsapp) {
        const btnWhatsapp = document.getElementById('btn-whatsapp');
        const message = encodeURIComponent(`Bonjour ${vendeur.nom}, je suis intéressé par vos produits bio.`);
        btnWhatsapp.href = `https://wa.me/${vendeur.whatsapp}?text=${message}`;
    } else {
        document.getElementById('btn-whatsapp').style.display = 'none';
    }
    
    if (vendeur.telephone) {
        const btnTelephone = document.getElementById('btn-telephone');
        btnTelephone.href = `tel:${vendeur.telephone.replace(/\s/g, '')}`;
    } else {
        document.getElementById('btn-telephone').style.display = 'none';
    }
    
    // Charger et afficher les annonces
    const annonces = chargerAnnoncesVendeur(vendeurId);
    const container = document.getElementById('annonces-vendeur-container');
    
    if (annonces.length === 0) {
        container.innerHTML = '<p class="message-aucune-annonce">Ce vendeur n\'a pas encore publié d\'annonces.</p>';
        return;
    }
    
    container.innerHTML = '';
    annonces.forEach(annonce => {
        const card = creerCarteAnnonce(annonce);
        container.appendChild(card);
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Charger le footer
    if (typeof loadFooter === 'function') {
        loadFooter();
    } else {
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
    
    // Afficher le profil
    afficherProfilVendeur();
});

