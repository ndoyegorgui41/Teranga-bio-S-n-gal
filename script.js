// Script pour Marketplace Bio Sénégal
// Données stockées dans un tableau JavaScript

const vendeurs = [
    {
        id: 1,
        nom: "Fatou Bio",
        description: "Vendeuse de légumes bio frais du Sénégal.",
        zone: "Région de Dakar",
        telephone: "77 123 45 67",
        disponibilite: "Ouvert de 8h à 18h",
        whatsapp: "221771234567", // Numéro WhatsApp (format international sans +)
        password: "vendeur1", // Mot de passe simple pour accès vendeur
        produits: [
            { nom: "Tomates bio", prix: "5000 FCFA/kg", description: "Tomates cultivées sans pesticides." },
            { nom: "Carottes bio", prix: "3000 FCFA/kg", description: "Carottes locales et saines." }
        ]
    },
    {
        id: 2,
        nom: "Mamadou Fruits",
        description: "Spécialiste en fruits tropicaux bio.",
        zone: "Région de Thiès",
        telephone: "78 234 56 78",
        disponibilite: "Ouvert de 7h à 17h",
        whatsapp: "221782345678",
        password: "vendeur2",
        produits: [
            { nom: "Mangues bio", prix: "4000 FCFA/kg", description: "Mangues juteuses et naturelles." },
            { nom: "Ananas bio", prix: "6000 FCFA/pièce", description: "Ananas frais du terroir." }
        ]
    }
    // Ajouter plus de vendeurs ici
];

// Fonction pour charger tous les vendeurs (statiques + inscrits validés uniquement pour l'affichage public)
function chargerTousVendeurs() {
    let tousVendeurs = [...vendeurs]; // Copie des vendeurs statiques (toujours validés)
    const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    // Ajouter uniquement les vendeurs inscrits VALIDÉS (pour l'affichage public)
    inscrits.forEach(vendeurInscrit => {
        // Les vendeurs sans statut ou avec statut 'valide' sont considérés comme validés
        if (!tousVendeurs.find(v => v.id === vendeurInscrit.id) && 
            (!vendeurInscrit.statut || vendeurInscrit.statut === 'valide')) {
            tousVendeurs.push(vendeurInscrit);
        }
    });
    return tousVendeurs;
}

// Fonction pour charger TOUS les vendeurs (y compris en attente - pour l'admin)
function chargerTousVendeursAdmin() {
    let tousVendeurs = [...vendeurs]; // Copie des vendeurs statiques
    const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    // Ajouter tous les vendeurs inscrits (y compris en attente)
    inscrits.forEach(vendeurInscrit => {
        if (!tousVendeurs.find(v => v.id === vendeurInscrit.id)) {
            tousVendeurs.push(vendeurInscrit);
        }
    });
    return tousVendeurs;
}

// Fonction pour charger uniquement les vendeurs en attente
function chargerVendeursEnAttente() {
    try {
        const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
        console.log('Vendeurs inscrits récupérés:', inscrits.length);
        
        // Filtrer les vendeurs en attente (comparaison stricte et insensible à la casse pour robustesse)
        const enAttente = inscrits.filter(v => {
            // Si pas de statut, considérer comme en attente par défaut (pour les anciens vendeurs)
            if (!v.statut) {
                return false; // Ne pas inclure les vendeurs sans statut (anciens)
            }
            const statut = String(v.statut).toLowerCase().trim();
            const result = statut === 'en_attente';
            if (result) {
                console.log('Vendeur en attente trouvé:', v.nom, 'ID:', v.id, 'Statut:', v.statut);
            }
            return result;
        });
        
        console.log('Total vendeurs en attente:', enAttente.length);
        return enAttente;
    } catch (error) {
        console.error('Erreur lors du chargement des vendeurs en attente:', error);
        return [];
    }
}

// Fonction pour sauvegarder un vendeur inscrit
function sauvegarderVendeur(vendeur) {
    const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    // S'assurer que le statut est bien défini
    if (!vendeur.statut) {
        vendeur.statut = 'en_attente';
    }
    inscrits.push(vendeur);
    localStorage.setItem('vendeurs_inscrits', JSON.stringify(inscrits));
}

// Fonction pour trouver un vendeur par ID (statique ou inscrit)
function trouverVendeur(id) {
    // Utiliser chargerTousVendeursAdmin pour trouver aussi les vendeurs en attente
    const tousVendeurs = chargerTousVendeursAdmin();
    return tousVendeurs.find(v => v.id === id);
}

// Fonction pour afficher la liste des vendeurs sur vendeurs.html
function afficherListeVendeurs(vendeursFiltres = null) {
    const liste = document.getElementById('liste-vendeurs');
    if (!liste) return; // Si pas sur la page vendeurs.html

    // Utiliser les vendeurs filtrés si fournis, sinon charger tous les vendeurs
    const tousVendeurs = vendeursFiltres || chargerTousVendeurs();
    
    // Vider la liste
    liste.textContent = '';
    
    // Afficher un message si aucun résultat
    if (tousVendeurs.length === 0) {
        const message = document.createElement('p');
        message.className = 'message-aucun-resultat';
        message.textContent = 'Aucun vendeur ne correspond à votre recherche.';
        liste.appendChild(message);
        return;
    }
    
    tousVendeurs.forEach(vendeur => {
        const card = document.createElement('div');
        card.className = 'vendeur-card';
        
        const h3 = document.createElement('h3');
        h3.textContent = vendeur.nom;
        card.appendChild(h3);
        
        const p = document.createElement('p');
        p.textContent = vendeur.description;
        card.appendChild(p);
        
        // Afficher la zone si disponible
        if (vendeur.zone) {
            const zoneP = document.createElement('p');
            zoneP.className = 'vendeur-zone';
            const strong = document.createElement('strong');
            strong.textContent = 'Zone : ';
            zoneP.appendChild(strong);
            zoneP.appendChild(document.createTextNode(vendeur.zone));
            card.appendChild(zoneP);
        }
        
        const a = document.createElement('a');
        a.href = `vendeur.html?id=${vendeur.id}`;
        a.className = 'btn';
        a.textContent = 'Voir le profil';
        card.appendChild(a);
        
        liste.appendChild(card);
    });
}

// Fonction pour filtrer et rechercher les vendeurs
function filtrerEtRechercherVendeurs() {
    const termeRecherche = document.getElementById('recherche-vendeur').value.toLowerCase().trim();
    const zoneSelectionnee = document.getElementById('filtre-zone').value;
    const compteur = document.getElementById('compteur-resultats');
    
    const tousVendeurs = chargerTousVendeurs();
    let vendeursFiltres = [...tousVendeurs];
    
    // Filtrer par recherche (nom ou description)
    if (termeRecherche) {
        vendeursFiltres = vendeursFiltres.filter(vendeur => {
            const nom = vendeur.nom ? vendeur.nom.toLowerCase() : '';
            const description = vendeur.description ? vendeur.description.toLowerCase() : '';
            return nom.includes(termeRecherche) || description.includes(termeRecherche);
        });
    }
    
    // Filtrer par zone
    if (zoneSelectionnee) {
        vendeursFiltres = vendeursFiltres.filter(vendeur => {
            return vendeur.zone === zoneSelectionnee;
        });
    }
    
    // Afficher les résultats
    afficherListeVendeurs(vendeursFiltres);
    
    // Mettre à jour le compteur
    if (compteur) {
        const total = tousVendeurs.length;
        const filtres = vendeursFiltres.length;
        if (termeRecherche || zoneSelectionnee) {
            compteur.textContent = `${filtres} vendeur(s) trouvé(s) sur ${total}`;
            compteur.style.display = 'block';
        } else {
            compteur.textContent = `${total} vendeur(s) au total`;
            compteur.style.display = 'block';
        }
    }
}

// Fonction pour initialiser les filtres (remplir la liste des zones)
function initialiserFiltres() {
    const selectZone = document.getElementById('filtre-zone');
    if (!selectZone) return;
    
    const tousVendeurs = chargerTousVendeurs();
    const zones = new Set();
    
    // Collecter toutes les zones uniques
    tousVendeurs.forEach(vendeur => {
        if (vendeur.zone) {
            zones.add(vendeur.zone);
        }
    });
    
    // Trier les zones par ordre alphabétique
    const zonesTriees = Array.from(zones).sort();
    
    // Ajouter les options (en gardant "Toutes les zones" qui existe déjà)
    zonesTriees.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        selectZone.appendChild(option);
    });
}

// Fonction pour initialiser la recherche et les filtres
function initialiserRechercheFiltres() {
    // Vérifier si on est sur la page vendeurs
    const rechercheInput = document.getElementById('recherche-vendeur');
    const listeContainer = document.getElementById('liste-vendeurs');
    
    if (!rechercheInput && !listeContainer) {
        return;
    }
    
    // Initialiser les filtres (liste des zones)
    try {
        initialiserFiltres();
    } catch (e) {
        console.error('Erreur initialisation filtres:', e);
    }
    
    // Afficher la liste initiale
    try {
        afficherListeVendeurs();
    } catch (e) {
        console.error('Erreur affichage liste vendeurs:', e);
    }
    
    // Événement sur le champ de recherche
    if (rechercheInput) {
        rechercheInput.addEventListener('input', filtrerEtRechercherVendeurs);
    }
    
    // Événement sur le filtre de zone
    const selectZone = document.getElementById('filtre-zone');
    if (selectZone) {
        selectZone.addEventListener('change', filtrerEtRechercherVendeurs);
    }
}

// Limite du nombre de produits par vendeur
const MAX_PRODUITS_PAR_VENDEUR = 50;

// Fonction pour charger les produits d'un vendeur (statiques + locaux)
function chargerProduits(vendeurId) {
    const vendeur = trouverVendeur(vendeurId);
    if (!vendeur) return [];
    
    let produits = vendeur.produits ? [...vendeur.produits] : []; // Copie des produits initiaux
    const locaux = JSON.parse(localStorage.getItem(`vendeur_${vendeurId}_produits`) || '[]');
    produits = produits.concat(locaux);
    return produits;
}

// Fonction pour comprimer une image avant stockage
function compresserImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculer les nouvelles dimensions en gardant le ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en Base64 avec compression
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Fonction pour obtenir le nombre de produits locaux d'un vendeur
function obtenirNombreProduitsLocaux(vendeurId) {
    const key = `vendeur_${vendeurId}_produits`;
    const locaux = JSON.parse(localStorage.getItem(key) || '[]');
    return locaux.length;
}

// Fonction pour nettoyer et échapper les entrées utilisateur (prévention XSS)
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    // Créer un élément temporaire pour échapper les caractères HTML
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Fonction pour sauvegarder un produit dans localStorage avec vérification de limite
function sauvegarderProduit(vendeurId, produit) {
    const key = `vendeur_${vendeurId}_produits`;
    const locaux = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Vérifier la limite (uniquement pour les produits locaux, pas les statiques)
    if (locaux.length >= MAX_PRODUITS_PAR_VENDEUR) {
        throw new Error(`Limite atteinte : vous ne pouvez ajouter que ${MAX_PRODUITS_PAR_VENDEUR} produits maximum.`);
    }
    
    locaux.push(produit);
    localStorage.setItem(key, JSON.stringify(locaux));
    return true;
}

// Fonction pour afficher le profil d'un vendeur sur vendeur.html
function afficherProfilVendeur() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    if (!id) return;

    const vendeur = trouverVendeur(id);
    if (!vendeur) return;

    // Mettre à jour le titre
    document.getElementById('nom-vendeur').textContent = vendeur.nom;

    // Afficher le profil
    const profil = document.getElementById('profil-vendeur');
    profil.textContent = ''; // Vider le contenu
    
    // Afficher les messages de bienvenue non lus pour ce vendeur
    const messages = recupererMessagesVendeur(id);
    const messagesNonLus = messages.filter(m => !m.lu && m.type === 'bienvenue');
    
    if (messagesNonLus.length > 0) {
        messagesNonLus.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message-bienvenue';
            
            const titre = document.createElement('h3');
            titre.textContent = message.titre;
            messageDiv.appendChild(titre);
            
            const contenu = document.createElement('div');
            // Remplacer **texte** par du texte en gras
            let texteFormate = message.contenu.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            contenu.innerHTML = texteFormate;
            messageDiv.appendChild(contenu);
            
            const btnFermer = document.createElement('button');
            btnFermer.textContent = 'Fermer';
            btnFermer.className = 'btn';
            btnFermer.addEventListener('click', function() {
                marquerMessageLu(id, message.id);
                messageDiv.style.transition = 'opacity 0.3s ease';
                messageDiv.style.opacity = '0';
                setTimeout(function() {
                    messageDiv.style.display = 'none';
                }, 300);
            });
            messageDiv.appendChild(btnFermer);
            
            profil.appendChild(messageDiv);
        });
    }
    
    const p1 = document.createElement('p');
    const strong1 = document.createElement('strong');
    strong1.textContent = 'Description : ';
    p1.appendChild(strong1);
    p1.appendChild(document.createTextNode(vendeur.description));
    profil.appendChild(p1);
    
    const p2 = document.createElement('p');
    const strong2 = document.createElement('strong');
    strong2.textContent = 'Zone de production : ';
    p2.appendChild(strong2);
    p2.appendChild(document.createTextNode(vendeur.zone));
    profil.appendChild(p2);
    
    const p3 = document.createElement('p');
    const strong3 = document.createElement('strong');
    strong3.textContent = 'Téléphone : ';
    p3.appendChild(strong3);
    p3.appendChild(document.createTextNode(vendeur.telephone));
    profil.appendChild(p3);
    
    const p4 = document.createElement('p');
    const strong4 = document.createElement('strong');
    strong4.textContent = 'Disponibilité : ';
    p4.appendChild(strong4);
    p4.appendChild(document.createTextNode(vendeur.disponibilite));
    profil.appendChild(p4);

    // Afficher les produits
    const produits = chargerProduits(id);
    afficherProduitsVendeur(id, produits);
    
    // Initialiser la recherche de produits
    initialiserRechercheProduits(id);

    // Bouton WhatsApp
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const message = encodeURIComponent(`Bonjour ${vendeur.nom}, je suis intéressé par vos produits bio.`);
    btnWhatsapp.href = `https://wa.me/${vendeur.whatsapp}?text=${message}`;
}

// Fonction pour afficher les produits d'un vendeur (utilisée par afficherProfilVendeur et la recherche)
function afficherProduitsVendeur(vendeurId, produitsAfficher = null) {
    const listeProduits = document.getElementById('liste-produits');
    if (!listeProduits) return;
    
    // Utiliser les produits fournis ou charger tous les produits
    const produits = produitsAfficher || chargerProduits(vendeurId);
    
    // Vider la liste
    listeProduits.textContent = '';
    
    // Afficher un message si aucun produit
    if (produits.length === 0) {
        const message = document.createElement('p');
        message.className = 'message-aucun-resultat';
        message.textContent = 'Aucun produit disponible.';
        listeProduits.appendChild(message);
        return;
    }
    
    produits.forEach(produit => {
        const div = document.createElement('div');
        div.className = 'produit';
        
        const h4 = document.createElement('h4');
        h4.textContent = produit.nom;
        div.appendChild(h4);
        
        const pPrix = document.createElement('p');
        const strongPrix = document.createElement('strong');
        strongPrix.textContent = 'Prix : ';
        pPrix.appendChild(strongPrix);
        pPrix.appendChild(document.createTextNode(produit.prix));
        div.appendChild(pPrix);
        
        const pDesc = document.createElement('p');
        pDesc.textContent = produit.description;
        div.appendChild(pDesc);
        
        if (produit.image) {
            const img = document.createElement('img');
            img.src = produit.image;
            img.alt = produit.nom;
            div.appendChild(img);
        }
        
        listeProduits.appendChild(div);
    });
}

// Fonction pour rechercher des produits
function rechercherProduits(vendeurId) {
    const termeRecherche = document.getElementById('recherche-produit').value.toLowerCase().trim();
    const compteur = document.getElementById('compteur-produits');
    
    const tousProduits = chargerProduits(vendeurId);
    let produitsFiltres = [...tousProduits];
    
    // Filtrer par recherche (nom, description ou prix)
    if (termeRecherche) {
        produitsFiltres = produitsFiltres.filter(produit => {
            const nom = produit.nom ? produit.nom.toLowerCase() : '';
            const description = produit.description ? produit.description.toLowerCase() : '';
            const prix = produit.prix ? produit.prix.toLowerCase() : '';
            return nom.includes(termeRecherche) || description.includes(termeRecherche) || prix.includes(termeRecherche);
        });
    }
    
    // Afficher les résultats
    afficherProduitsVendeur(vendeurId, produitsFiltres);
    
    // Mettre à jour le compteur
    if (compteur) {
        const total = tousProduits.length;
        const filtres = produitsFiltres.length;
        const produitsLocaux = obtenirNombreProduitsLocaux(vendeurId);
        
        // Réinitialiser les styles
        compteur.style.backgroundColor = '#e8f5e9';
        compteur.style.borderLeftColor = '#4CAF50';
        compteur.style.color = '#2e7d32';
        
        if (termeRecherche) {
            compteur.textContent = `${filtres} produit(s) trouvé(s) sur ${total}`;
            compteur.style.display = 'block';
        } else {
            let texteCompteur = `${total} produit(s) au total`;
            if (produitsLocaux >= MAX_PRODUITS_PAR_VENDEUR) {
                texteCompteur += ` (Limite de ${MAX_PRODUITS_PAR_VENDEUR} produits atteinte)`;
                compteur.style.backgroundColor = '#fff3cd';
                compteur.style.borderLeftColor = '#ffc107';
                compteur.style.color = '#856404';
            }
            compteur.textContent = texteCompteur;
            compteur.style.display = 'block';
        }
    }
}

// Fonction pour initialiser la recherche de produits
function initialiserRechercheProduits(vendeurId) {
    const inputRecherche = document.getElementById('recherche-produit');
    if (!inputRecherche) return;
    
    // Afficher le compteur initial
    const compteur = document.getElementById('compteur-produits');
    const tousProduits = chargerProduits(vendeurId);
    if (compteur && tousProduits.length > 0) {
        compteur.textContent = `${tousProduits.length} produit(s) au total`;
        compteur.style.display = 'block';
    }
    
    // Événement sur le champ de recherche
    inputRecherche.addEventListener('input', function() {
        rechercherProduits(vendeurId);
    });

    // Gestion accès vendeur
    const btnAcces = document.getElementById('btn-acces');
    btnAcces.addEventListener('click', function() {
        const password = prompt('Entrez le mot de passe vendeur :');
        if (password === vendeur.password) {
            document.getElementById('ajouter-produit').style.display = 'block';
            document.getElementById('acces-vendeur').style.display = 'none';
        } else {
            alert('Mot de passe incorrect.');
        }
    });

    // Gestion du formulaire d'ajout
    const form = document.getElementById('form-produit');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            // Vérifier la limite avant de traiter le formulaire
            const nombreProduits = obtenirNombreProduitsLocaux(id);
            if (nombreProduits >= MAX_PRODUITS_PAR_VENDEUR) {
                alert(`Limite atteinte : vous ne pouvez ajouter que ${MAX_PRODUITS_PAR_VENDEUR} produits maximum.\n\nVeuillez supprimer des produits existants avant d'en ajouter de nouveaux.`);
                return;
            }
            
            const nom = sanitizeInput(document.getElementById('nom-produit').value);
            const prix = sanitizeInput(document.getElementById('prix-produit').value);
            const description = sanitizeInput(document.getElementById('desc-produit').value);
        const imageInput = document.getElementById('image-produit');
        
        let image = '';
        if (imageInput.files[0]) {
                // Compresser l'image avant de l'utiliser
                try {
                    image = await compresserImage(imageInput.files[0]);
                } catch (error) {
                    alert('Erreur lors de la compression de l\'image : ' + error.message);
                    return;
                }
            }
            
                const produit = { nom, prix, description, image };
                sauvegarderProduit(id, produit);
            
            // Réinitialiser le formulaire et recharger la page
            form.reset();
                location.reload();
        } catch (error) {
            alert('Erreur : ' + error.message);
        }
    });
}

// Fonction pour gérer l'affichage du formulaire d'inscription
function gererAffichageFormulaire() {
    const btnDevenirVendeur = document.getElementById('btn-devenir-vendeur');
    const formulaire = document.getElementById('inscription-vendeur');
    
    if (!btnDevenirVendeur || !formulaire) {
        return;
    }

    // S'assurer que le formulaire est masqué au chargement
    formulaire.classList.remove('visible');
    formulaire.style.display = 'none';

    // Gestionnaire de clic
    btnDevenirVendeur.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (formulaire.classList.contains('visible')) {
            // Masquer
            formulaire.classList.remove('visible');
            formulaire.style.display = 'none';
        } else {
            // Afficher
            formulaire.classList.add('visible');
            formulaire.style.display = 'block';
        }
    };
}

// Fonction pour gérer l'inscription d'un nouveau vendeur
function gererInscription() {
    const form = document.getElementById('form-inscription');
    if (!form) return; // Si pas sur la page d'accueil
    
    // Désactiver le bouton d'inscription tant que la charte n'est pas acceptée
    const btnSubmit = document.getElementById('btn-inscription-submit');
    const accepteCharte = document.getElementById('accepte-charte');
    
    function mettreAJourBouton() {
        if (btnSubmit && accepteCharte) {
            btnSubmit.disabled = !accepteCharte.checked;
            if (btnSubmit.disabled) {
                btnSubmit.style.opacity = '0.6';
                btnSubmit.style.cursor = 'not-allowed';
            } else {
                btnSubmit.style.opacity = '1';
                btnSubmit.style.cursor = 'pointer';
            }
        }
    }
    
    // Vérifier l'état initial
    mettreAJourBouton();
    
    // Écouter les changements de la case à cocher
    if (accepteCharte) {
        accepteCharte.addEventListener('change', mettreAJourBouton);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const nom = document.getElementById('nom-vendeur').value.trim();
        const description = document.getElementById('description-vendeur').value.trim();
        const zone = document.getElementById('zone-vendeur').value.trim();
        const telephone = document.getElementById('telephone-vendeur').value.trim();
        let whatsapp = document.getElementById('whatsapp-vendeur').value.trim();
        const disponibilite = document.getElementById('disponibilite-vendeur').value.trim();
        const password = document.getElementById('password-vendeur').value;

        // Validation basique
        if (!nom || !description || !zone || !telephone || !whatsapp || !disponibilite || !password) {
            afficherMessageInscription('Veuillez remplir tous les champs.', 'error');
            return;
        }
        
        // Vérifier que la charte a été acceptée
        const accepteCharte = document.getElementById('accepte-charte');
        if (!accepteCharte || !accepteCharte.checked) {
            afficherMessageInscription('Vous devez accepter la charte vendeur pour continuer l\'inscription.', 'error');
            // Faire défiler vers la case à cocher
            if (accepteCharte) {
                accepteCharte.scrollIntoView({ behavior: 'smooth', block: 'center' });
                accepteCharte.focus();
            }
            return;
        }

        try {
            // Convertir le format national WhatsApp en format international (enlever les espaces et ajouter 221)
            whatsapp = whatsapp.replace(/\s/g, ''); // Enlever les espaces
            if (!whatsapp.startsWith('221')) {
                whatsapp = '221' + whatsapp; // Ajouter le préfixe 221 si absent
            }

            // Générer un ID unique (utiliser le timestamp + un nombre aléatoire)
            const tousVendeurs = chargerTousVendeurs();
            let nouvelId;
            do {
                nouvelId = Date.now() + Math.floor(Math.random() * 1000);
            } while (tousVendeurs.find(v => v.id === nouvelId));

            // Créer l'objet vendeur avec statut "en_attente"
            const nouveauVendeur = {
                id: nouvelId,
                nom: sanitizeInput(nom),
                description: sanitizeInput(description),
                zone: sanitizeInput(zone),
                telephone: sanitizeInput(telephone),
                disponibilite: sanitizeInput(disponibilite),
                whatsapp: whatsapp, // Sera nettoyé après conversion
                password: password, // ⚠️ En production, devrait être hashé côté serveur
                produits: [], // Liste vide de produits au départ
                statut: 'en_attente', // En attente de validation par l'administrateur
                dateInscription: new Date().toISOString() // Date d'inscription
            };

            // Sauvegarder le vendeur
            sauvegarderVendeur(nouveauVendeur);

            // Afficher message de succès avec information sur la validation
            afficherMessageInscription(`Inscription réussie ! Votre demande a été enregistrée. Votre profil sera visible sur la plateforme une fois validé par l'administrateur. Votre ID vendeur est : ${nouvelId}`, 'success');
            
            // Réinitialiser le formulaire
            form.reset();
            
            // Remettre à jour l'état du bouton après réinitialisation
            mettreAJourBouton();

            // Optionnel : rediriger vers la liste des vendeurs après 3 secondes
            setTimeout(function() {
                window.location.href = 'vendeurs.html';
            }, 3000);
        } catch (error) {
            afficherMessageInscription(error.message || 'Erreur de validation. Veuillez vérifier vos données.', 'error');
            return;
        }
    });
}

// Fonction pour afficher un message d'inscription
function afficherMessageInscription(message, type) {
    const messageDiv = document.getElementById('message-inscription');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    
    // Faire défiler jusqu'au message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Fonction pour calculer et afficher les statistiques
function afficherStatistiques() {
    const tousVendeurs = chargerTousVendeurs(); // Uniquement les validés pour les stats publiques
    let totalProduits = 0;
    
    // Compter tous les produits (statiques + locaux)
    tousVendeurs.forEach(vendeur => {
        // Produits statiques
        if (vendeur.produits && Array.isArray(vendeur.produits)) {
            totalProduits += vendeur.produits.length;
        }
        // Produits dans localStorage
        const produitsLocaux = JSON.parse(localStorage.getItem(`vendeur_${vendeur.id}_produits`) || '[]');
        totalProduits += produitsLocaux.length;
    });
    
    // Afficher les statistiques
    const nombreVendeursEl = document.getElementById('nombre-vendeurs');
    const nombreProduitsEl = document.getElementById('nombre-produits');
    
    if (nombreVendeursEl) {
        nombreVendeursEl.textContent = tousVendeurs.length;
    }
    if (nombreProduitsEl) {
        nombreProduitsEl.textContent = totalProduits;
    }
}

// Fonction pour afficher les produits vedettes
function afficherProduitsVedettes() {
    const container = document.getElementById('produits-vedettes-container');
    if (!container) return; // Si pas sur la page d'accueil

    const tousVendeurs = chargerTousVendeurs();
    const produitsVedettes = [];
    
    // Collecter quelques produits de différents vendeurs
    tousVendeurs.forEach(vendeur => {
        const produits = chargerProduits(vendeur.id);
        if (produits.length > 0) {
            // Prendre le premier produit de chaque vendeur
            produitsVedettes.push({
                ...produits[0],
                vendeurNom: vendeur.nom
            });
        }
    });
    
    // Limiter à 6 produits maximum
    const produitsAffiches = produitsVedettes.slice(0, 6);
    
    container.textContent = ''; // Vider le contenu
    
    if (produitsAffiches.length === 0) {
        const p = document.createElement('p');
        p.style.color = 'white';
        p.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.7)';
        p.textContent = 'Aucun produit disponible pour le moment.';
        container.appendChild(p);
        return;
    }
    
    produitsAffiches.forEach(produit => {
        const div = document.createElement('div');
        div.className = 'produit-vedette';
        
        if (produit.image) {
            const img = document.createElement('img');
            img.src = produit.image;
            img.alt = produit.nom;
            img.className = 'produit-vedette-image';
            div.appendChild(img);
        }
        
        const h4 = document.createElement('h4');
        h4.textContent = produit.nom;
        div.appendChild(h4);
        
        const prixDiv = document.createElement('div');
        prixDiv.className = 'produit-prix';
        prixDiv.textContent = produit.prix;
        div.appendChild(prixDiv);
        
        const pDesc = document.createElement('p');
        pDesc.className = 'produit-description';
        pDesc.textContent = produit.description;
        div.appendChild(pDesc);
        
        const vendeurDiv = document.createElement('div');
        vendeurDiv.className = 'produit-vendeur';
        vendeurDiv.textContent = `Par ${produit.vendeurNom}`;
        div.appendChild(vendeurDiv);
        
        container.appendChild(div);
    });
}

// Mapping des zones du Sénégal vers leurs coordonnées GPS approximatives
const coordonneesZones = {
    "Région de Dakar": { lat: 14.7167, lng: -17.4677, nom: "Dakar" },
    "Région de Thiès": { lat: 14.7978, lng: -16.9269, nom: "Thiès" },
    "Région de Diourbel": { lat: 14.6550, lng: -16.2314, nom: "Diourbel" },
    "Région de Saint-Louis": { lat: 16.0179, lng: -16.4896, nom: "Saint-Louis" },
    "Région de Louga": { lat: 15.6147, lng: -16.2279, nom: "Louga" },
    "Région de Fatick": { lat: 14.3240, lng: -16.4111, nom: "Fatick" },
    "Région de Kaolack": { lat: 14.1389, lng: -16.0758, nom: "Kaolack" },
    "Région de Tambacounda": { lat: 13.7689, lng: -13.6673, nom: "Tambacounda" },
    "Région de Kaffrine": { lat: 14.1053, lng: -15.5414, nom: "Kaffrine" },
    "Région de Kolda": { lat: 12.8933, lng: -14.9447, nom: "Kolda" },
    "Région de Sédhiou": { lat: 12.7081, lng: -15.5569, nom: "Sédhiou" },
    "Région de Ziguinchor": { lat: 12.5642, lng: -16.2731, nom: "Ziguinchor" },
    "Région de Matam": { lat: 15.6581, lng: -13.2574, nom: "Matam" },
    "Région de Kédougou": { lat: 12.5576, lng: -12.1741, nom: "Kédougou" }
};

// Variable globale pour stocker la carte
let carteSenegal = null;
let carteInitialisee = false;

// Fonction pour obtenir les coordonnées d'une zone
function obtenirCoordonneesZone(zoneNom) {
    if (coordonneesZones[zoneNom]) {
        return coordonneesZones[zoneNom];
    }
    const zoneLower = zoneNom.toLowerCase();
    for (const [key, value] of Object.entries(coordonneesZones)) {
        if (key.toLowerCase().includes(zoneLower) || zoneLower.includes(key.toLowerCase())) {
            return value;
        }
    }
    return { lat: 14.4974, lng: -14.4524, nom: zoneNom };
}

// Fonction simple pour initialiser la carte (appelée au scroll)
function initialiserCarteSenegal() {
    if (carteInitialisee || typeof L === 'undefined') return;
    
    const carteContainer = document.getElementById('carte-senegal');
    if (!carteContainer) return;
    
    carteSenegal = L.map('carte-senegal', {
        scrollWheelZoom: false,
        zoomControl: true
    }).setView([14.4974, -14.4524], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(carteSenegal);
    
    carteInitialisee = true;
    
    // Sur mobile, attendre un peu avant d'afficher les zones pour que la carte soit complètement rendue
    setTimeout(function() {
        carteSenegal.invalidateSize();
        afficherZonesSurCarte();
        
        // Re-invalider après un court délai supplémentaire pour mobile
        if (window.innerWidth <= 768) {
            setTimeout(function() {
                carteSenegal.invalidateSize();
                afficherZonesSurCarte();
            }, 300);
        }
    }, 100);
}

// Fonction pour normaliser un nom de zone (enlever accents, mettre en minuscule, normaliser)
function normaliserNomZone(nom) {
    if (!nom) return '';
    return nom.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/région de |département de |ville de /gi, '') // Enlever les préfixes
        .trim();
}

// Fonction pour trouver la clé correspondante dans coordonneesZones
function trouverCleZoneCorrespondante(zoneNom) {
    if (!zoneNom) return null;
    
    // Vérifier d'abord la correspondance exacte
    if (coordonneesZones[zoneNom]) {
        return zoneNom;
    }
    
    // Normaliser le nom recherché
    const nomNormalise = normaliserNomZone(zoneNom);
    
    // Chercher dans coordonneesZones avec correspondance normalisée
    for (const cle in coordonneesZones) {
        const cleNormalisee = normaliserNomZone(cle);
        if (cleNormalisee === nomNormalise || 
            cleNormalisee.includes(nomNormalise) || 
            nomNormalise.includes(cleNormalisee)) {
            return cle;
        }
    }
    
    return null;
}

// Fonction pour afficher les zones sur la carte
function afficherZonesSurCarte() {
    if (!carteSenegal) return;
    
    // Supprimer tous les marqueurs existants
    carteSenegal.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            carteSenegal.removeLayer(layer);
        }
    });
    
    // Recharger tous les vendeurs pour avoir les données à jour
    const tousVendeurs = chargerTousVendeurs();
    const zonesAvecVendeurs = new Map(); // Utiliser Map au lieu de Set pour stocker les clés normalisées et les vendeurs
    
    // Collecter les zones actives et normaliser les noms
    tousVendeurs.forEach(vendeur => {
        if (vendeur.zone) {
            const cleZone = trouverCleZoneCorrespondante(vendeur.zone);
            if (cleZone) {
                // Utiliser la clé normalisée de coordonneesZones
                if (!zonesAvecVendeurs.has(cleZone)) {
                    zonesAvecVendeurs.set(cleZone, []);
                }
                zonesAvecVendeurs.get(cleZone).push(vendeur);
            }
        }
    });
    
    // Afficher les zones actives (vertes)
    zonesAvecVendeurs.forEach((vendeurs, zoneNom) => {
        const coord = obtenirCoordonneesZone(zoneNom);
        const nombreVendeurs = vendeurs.length;
        
        const iconeActive = L.divIcon({
            className: 'marqueur-zone marqueur-active',
            html: `<div class="marqueur-cercle marqueur-cercle-active"><span>${nombreVendeurs}</span></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const marqueur = L.marker([coord.lat, coord.lng], { icon: iconeActive }).addTo(carteSenegal);
        
        const listeVendeurs = vendeurs.map(v => `• ${v.nom}`).join('<br>');
        const popupContent = `
            <div class="popup-zone">
                <strong>${zoneNom}</strong><br>
                <span class="popup-vendeurs-count">${nombreVendeurs} vendeur${nombreVendeurs > 1 ? 's' : ''}</span>
                <div class="popup-vendeurs-list">${listeVendeurs}</div>
            </div>
        `;
        marqueur.bindPopup(popupContent);
    });
    
    // Afficher les zones à venir (grises) - uniquement celles qui n'ont pas de vendeurs
    Object.keys(coordonneesZones).forEach(zoneNom => {
        if (!zonesAvecVendeurs.has(zoneNom)) {
            const coord = obtenirCoordonneesZone(zoneNom);
            
            const iconeAVenir = L.divIcon({
                className: 'marqueur-zone marqueur-a-venir',
                html: `<div class="marqueur-cercle marqueur-cercle-a-venir"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            const marqueur = L.marker([coord.lat, coord.lng], { icon: iconeAVenir }).addTo(carteSenegal);
            marqueur.bindPopup(`<div class="popup-zone"><strong>${zoneNom}</strong><br><span style="color: #95a5a6;">Zone à venir</span></div>`);
        }
    });
    
    // Recalculer la taille de la carte pour s'assurer que les marqueurs sont visibles
    if (carteSenegal) {
        setTimeout(function() {
            carteSenegal.invalidateSize();
        }, 50);
    }
}

// Fonction pour afficher les zones couvertes (badges seulement)
function afficherZonesCouvertes() {
    const container = document.getElementById('zones-container');
    if (!container) return;

    // Recharger tous les vendeurs pour avoir les données à jour
    const tousVendeurs = chargerTousVendeurs();
    const zones = new Set();
    
    tousVendeurs.forEach(vendeur => {
        if (vendeur.zone) {
            zones.add(vendeur.zone);
        }
    });
    
    const zonesArray = Array.from(zones).sort();
    container.innerHTML = '';
    
    if (zonesArray.length === 0) {
        const p = document.createElement('p');
        p.style.color = '#666';
        p.textContent = 'Aucune zone disponible pour le moment.';
        container.appendChild(p);
        return;
    }
    
    zonesArray.forEach(zone => {
        const span = document.createElement('span');
        span.className = 'zone-badge';
        span.textContent = zone;
        container.appendChild(span);
    });
    
    // Mettre à jour la carte si elle est déjà initialisée
    if (carteInitialisee) {
        afficherZonesSurCarte();
    }
}

// Animation au scroll
function initialiserAnimationsScroll() {
    // Vérifier si l'utilisateur préfère les animations réduites (accessibilité)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return; // Ne pas ajouter d'animations si l'utilisateur les préfère réduites
    }

    // Observer pour détecter quand les sections entrent dans la vue
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Une fois animé, ne plus observer cet élément (performance)
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.15, // Déclencher quand 15% de l'élément est visible
        rootMargin: '0px 0px -30px 0px' // Déclencher légèrement avant que l'élément soit complètement visible
    });

    // Observer les sections principales
    const sections = document.querySelectorAll('#statistiques, #comment-ca-marche, #produits-vedettes, #zones-couvertes, #valeurs, #contactez-nous, #mentions');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        section.classList.add('animate-on-scroll');
        
        if (isVisible) {
            setTimeout(() => {
                section.classList.add('visible');
            }, 100);
        } else {
            observer.observe(section);
        }
    });

    // Observer la description encadrée
    const descriptionEncadree = document.querySelector('.description-encadree.animate-on-scroll');
    if (descriptionEncadree) {
        const rect = descriptionEncadree.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            setTimeout(() => {
                descriptionEncadree.classList.add('visible');
            }, 150);
        } else {
            observer.observe(descriptionEncadree);
        }
    }

    // Observer la section zones-couvertes pour charger la carte au scroll
    const sectionZones = document.getElementById('zones-couvertes');
    if (sectionZones && typeof L !== 'undefined') {
        // Vérifier si la section est déjà visible au chargement
        const rect = sectionZones.getBoundingClientRect();
        const isVisibleOnLoad = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisibleOnLoad && !carteInitialisee) {
            // Initialiser immédiatement si la section est déjà visible
            setTimeout(() => {
                initialiserCarteSenegal();
            }, 300);
        }
        
        const carteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !carteInitialisee) {
                    initialiserCarteSenegal();
                    carteObserver.unobserve(entry.target);
                } else if (entry.isIntersecting && carteInitialisee && carteSenegal) {
                    afficherZonesSurCarte();
                }
            });
        }, { threshold: 0.1 });
        
        carteObserver.observe(sectionZones);
    }

    // Observer les conteneurs des étapes pour animer chaque étape séquentiellement
    const etapesContainers = document.querySelectorAll('.etapes');
    if (etapesContainers.length > 0) {
        const etapesObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const etapes = entry.target.querySelectorAll('.etape:not(.visible)');
                    etapes.forEach((etape, index) => {
                        setTimeout(() => {
                            etape.classList.add('visible');
                        }, index * 200); // Délai de 200ms entre chaque étape
                    });
                    etapesObserver.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        etapesContainers.forEach(container => {
            // Vérifier si le conteneur est déjà visible au chargement
            const rect = container.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                // Si visible, afficher les étapes immédiatement
                const etapes = container.querySelectorAll('.etape:not(.visible)');
                etapes.forEach((etape, index) => {
                    setTimeout(() => {
                        etape.classList.add('visible');
                    }, index * 200);
                });
            } else {
                // Sinon, observer pour l'animation au scroll
                etapesObserver.observe(container);
            }
        });
        
        // Fallback : s'assurer que les étapes sont visibles après 2 secondes si elles ne le sont pas déjà
        setTimeout(() => {
            etapesContainers.forEach(container => {
                const etapes = container.querySelectorAll('.etape:not(.visible)');
                etapes.forEach(etape => {
                    etape.classList.add('visible');
                });
            });
        }, 2000);
    }
}

// ===== SYSTÈME D'ADMINISTRATION =====

// Mot de passe administrateur (peut être changé dans le code)
// ⚠️ SÉCURITÉ : Pour une vraie sécurité, implémentez un backend avec hashage de mot de passe
// Ce système frontend uniquement n'est pas sécurisé pour une production réelle

// Mot de passe administrateur
// ⚠️ SÉCURITÉ : Pour une vraie sécurité, implémentez un backend avec hashage de mot de passe
// Ce système frontend uniquement n'est pas sécurisé pour une production réelle
const ADMIN_PASSWORD = 'admin123';

// Fonction pour comparer les mots de passe
function comparePassword(inputPassword, storedPassword) {
    // Comparaison directe (non sécurisé, mais fonctionnel pour un système frontend uniquement)
    return inputPassword === storedPassword;
}

// Clé pour stocker l'état de connexion admin
const ADMIN_SESSION_KEY = 'admin_connected';

// Fonction pour initialiser le mot de passe admin (première utilisation)
function initialiserMotDePasseAdmin() {
    if (!localStorage.getItem('admin_password_set')) {
        // Le mot de passe est défini dans le code
        localStorage.setItem('admin_password_set', 'true');
    }
}

// Fonction pour vérifier si l'admin est connecté
function estAdminConnecte() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

// Clé pour les tentatives de connexion (protection basique contre brute force)
const ADMIN_LOGIN_ATTEMPTS_KEY = 'admin_login_attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes

// Fonction pour vérifier si l'admin est bloqué
function estAdminBloque() {
    const attemptsData = localStorage.getItem(ADMIN_LOGIN_ATTEMPTS_KEY);
    if (!attemptsData) return false;
    
    const data = JSON.parse(attemptsData);
    const now = Date.now();
    
    // Si le lockout a expiré, réinitialiser
    if (now - data.lastAttempt > LOCKOUT_DURATION) {
        localStorage.removeItem(ADMIN_LOGIN_ATTEMPTS_KEY);
        return false;
    }
    
    // Si trop de tentatives, bloquer
    return data.count >= MAX_LOGIN_ATTEMPTS;
}

// Fonction pour enregistrer une tentative de connexion échouée
function enregistrerTentativeEchouee() {
    const attemptsData = localStorage.getItem(ADMIN_LOGIN_ATTEMPTS_KEY);
    let data;
    
    if (attemptsData) {
        data = JSON.parse(attemptsData);
        const now = Date.now();
        
        // Si le lockout a expiré, réinitialiser
        if (now - data.lastAttempt > LOCKOUT_DURATION) {
            data = { count: 1, lastAttempt: now };
        } else {
            data.count++;
            data.lastAttempt = now;
        }
    } else {
        data = { count: 1, lastAttempt: Date.now() };
    }
    
    localStorage.setItem(ADMIN_LOGIN_ATTEMPTS_KEY, JSON.stringify(data));
}

// Fonction pour réinitialiser les tentatives (après connexion réussie)
function reinitialiserTentatives() {
    localStorage.removeItem(ADMIN_LOGIN_ATTEMPTS_KEY);
}

// Fonction pour obtenir le temps restant de blocage
function getTempsRestantBlocage() {
    const attemptsData = localStorage.getItem(ADMIN_LOGIN_ATTEMPTS_KEY);
    if (!attemptsData) return 0;
    
    const data = JSON.parse(attemptsData);
    const now = Date.now();
    const elapsed = now - data.lastAttempt;
    const remaining = LOCKOUT_DURATION - elapsed;
    
    return Math.max(0, Math.ceil(remaining / 60000)); // Retourne en minutes
}

// Fonction pour connecter l'admin
function connecterAdmin(password) {
    // Vérifier si l'admin est bloqué
    if (estAdminBloque()) {
        const minutes = getTempsRestantBlocage();
        throw new Error(`Trop de tentatives échouées. Veuillez réessayer dans ${minutes} minute(s).`);
    }
    
    // Vérifier le mot de passe
    if (comparePassword(password, ADMIN_PASSWORD)) {
        reinitialiserTentatives();
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return true;
    } else {
        enregistrerTentativeEchouee();
        return false;
    }
}

// Fonction pour déconnecter l'admin
function deconnecterAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
}

// Fonction pour afficher le tableau de bord admin
function afficherTableauDeBordAdmin() {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    
    if (loginSection) {
        loginSection.style.setProperty('display', 'none', 'important');
        loginSection.style.setProperty('visibility', 'hidden', 'important');
    }
    if (dashboardSection) {
        dashboardSection.style.setProperty('display', 'block', 'important');
        dashboardSection.style.setProperty('visibility', 'visible', 'important');
    }
    
    // Attendre un peu pour que le DOM soit complètement rendu
    setTimeout(function() {
        actualiserStatistiquesAdmin();
        afficherInscriptionsEnAttente();
        afficherListeVendeursAdmin();
        
        // Réinitialiser l'event listener du bouton actualiser
        const btnRefreshEnAttente = document.getElementById('btn-refresh-en-attente');
        if (btnRefreshEnAttente) {
            // Retirer tous les event listeners existants
            const newBtn = btnRefreshEnAttente.cloneNode(true);
            btnRefreshEnAttente.parentNode.replaceChild(newBtn, btnRefreshEnAttente);
            
            // Ajouter le nouvel event listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Bouton actualiser cliqué depuis afficherTableauDeBordAdmin');
                afficherInscriptionsEnAttente();
                actualiserStatistiquesAdmin();
                // Afficher un message de confirmation
                const messageDiv = document.getElementById('message-validation');
                if (messageDiv) {
                    messageDiv.textContent = 'Liste actualisée avec succès.';
                    messageDiv.className = 'success';
                    messageDiv.style.display = 'block';
                    setTimeout(function() {
                        messageDiv.style.display = 'none';
                    }, 3000);
                }
            });
        }
    }, 100);
}

// Fonction pour afficher la section de connexion
function afficherConnexionAdmin() {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    
    if (loginSection) {
        loginSection.style.setProperty('display', 'flex', 'important');
        loginSection.style.setProperty('visibility', 'visible', 'important');
    }
    if (dashboardSection) {
        dashboardSection.style.setProperty('display', 'none', 'important');
        dashboardSection.style.setProperty('visibility', 'hidden', 'important');
    }
}

// Fonction pour actualiser les statistiques admin
function actualiserStatistiquesAdmin() {
    const tousVendeurs = chargerTousVendeurs(); // Validés uniquement pour les stats
    const tousVendeursAdmin = chargerTousVendeursAdmin(); // Tous pour le comptage
    const vendeursInscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    const enAttente = chargerVendeursEnAttente();
    
    let totalProduits = 0;
    const zones = new Set();
    
    tousVendeurs.forEach(vendeur => {
        if (vendeur.zone) zones.add(vendeur.zone);
        const produits = chargerProduits(vendeur.id);
        totalProduits += produits.length;
    });
    
    // Afficher les statistiques
    const statVendeursTotaux = document.getElementById('stat-vendeurs-totaux');
    const statVendeursInscrits = document.getElementById('stat-vendeurs-inscrits');
    const statProduitsTotaux = document.getElementById('stat-produits-totaux');
    const statZones = document.getElementById('stat-zones');
    
    if (statVendeursTotaux) statVendeursTotaux.textContent = tousVendeurs.length;
    if (statVendeursInscrits) statVendeursInscrits.textContent = vendeursInscrits.filter(v => v.statut === 'valide' || !v.statut).length;
    if (statProduitsTotaux) statProduitsTotaux.textContent = totalProduits;
    if (statZones) statZones.textContent = zones.size;
}

// Fonction pour afficher les inscriptions en attente
function afficherInscriptionsEnAttente() {
    const container = document.getElementById('liste-en-attente');
    if (!container) {
        console.error('Container liste-en-attente non trouvé');
        return;
    }
    
    console.log('Fonction afficherInscriptionsEnAttente appelée');
    
    // Recharger depuis localStorage pour avoir les données les plus récentes
    const enAttente = chargerVendeursEnAttente();
    
    // Débogage
    console.log('Vendeurs en attente trouvés:', enAttente.length);
    if (enAttente.length > 0) {
        console.log('Vendeurs en attente:', enAttente);
    }
    
    // Récupérer tous les inscrits pour vérifier
    try {
        const tousInscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
        console.log('Total vendeurs inscrits dans localStorage:', tousInscrits.length);
        if (tousInscrits.length > 0) {
            console.log('Statuts des vendeurs inscrits:', tousInscrits.map(v => ({ nom: v.nom, id: v.id, statut: v.statut })));
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des vendeurs inscrits:', error);
    }
    
    container.textContent = ''; // Vider le contenu
    
    if (enAttente.length === 0) {
        const p = document.createElement('p');
        p.style.color = '#666';
        p.style.padding = '20px';
        p.style.backgroundColor = '#f9f9f9';
        p.style.borderRadius = '5px';
        p.style.textAlign = 'center';
        p.textContent = 'Aucune inscription en attente de validation.';
        container.appendChild(p);
        console.log('Aucune inscription en attente - message affiché');
        return;
    }
    
    console.log('Affichage de', enAttente.length, 'vendeur(s) en attente');
    
    enAttente.forEach(vendeur => {
        const dateInscription = vendeur.dateInscription ? new Date(vendeur.dateInscription).toLocaleDateString('fr-FR') : 'Date inconnue';
        
        const card = document.createElement('div');
        card.className = 'admin-vendeur-card admin-en-attente-card';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'admin-vendeur-info';
        
        const h3 = document.createElement('h3');
        h3.textContent = vendeur.nom + ' ';
        const badge = document.createElement('span');
        badge.className = 'badge-en-attente';
        badge.textContent = 'En attente';
        h3.appendChild(badge);
        infoDiv.appendChild(h3);
        
        const addInfo = (label, value) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = label;
            p.appendChild(strong);
            p.appendChild(document.createTextNode(value));
            infoDiv.appendChild(p);
        };
        
        addInfo('ID: ', vendeur.id);
        addInfo('Description: ', vendeur.description);
        addInfo('Zone: ', vendeur.zone);
        addInfo('Téléphone: ', vendeur.telephone);
        addInfo('WhatsApp: ', vendeur.whatsapp || 'Non renseigné');
        addInfo('Disponibilité: ', vendeur.disponibilite);
        addInfo('Date d\'inscription: ', dateInscription);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'admin-vendeur-actions';
        
        const btnValider = document.createElement('button');
        btnValider.className = 'btn-success';
        btnValider.textContent = '✓ Valider';
        btnValider.addEventListener('click', () => validerVendeur(vendeur.id, vendeur.nom));
        actionsDiv.appendChild(btnValider);
        
        const btnRejeter = document.createElement('button');
        btnRejeter.className = 'btn-danger';
        btnRejeter.textContent = '✗ Rejeter';
        btnRejeter.addEventListener('click', () => rejeterVendeur(vendeur.id, vendeur.nom));
        actionsDiv.appendChild(btnRejeter);
        
        const a = document.createElement('a');
        a.href = `vendeur.html?id=${vendeur.id}`;
        a.className = 'btn';
        a.target = '_blank';
        a.textContent = 'Voir le profil';
        actionsDiv.appendChild(a);
        
        card.appendChild(infoDiv);
        card.appendChild(actionsDiv);
        container.appendChild(card);
        console.log('Carte ajoutée pour le vendeur:', vendeur.nom);
    });
    
    console.log('Toutes les cartes de vendeurs en attente ont été ajoutées au container. Total:', enAttente.length);
}

// Fonction pour afficher la liste des vendeurs dans l'admin
function afficherListeVendeursAdmin() {
    const container = document.getElementById('liste-admin-vendeurs');
    if (!container) return;
    
    // Charger uniquement les vendeurs validés
    const tousVendeurs = chargerTousVendeursAdmin().filter(v => {
        // Les vendeurs statiques ou ceux avec statut 'valide' ou sans statut (anciens)
        return !v.statut || v.statut === 'valide' || v.id <= 1000;
    });
    
    container.textContent = ''; // Vider le contenu
    
    if (tousVendeurs.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Aucun vendeur enregistré.';
        container.appendChild(p);
        return;
    }
    
    tousVendeurs.forEach(vendeur => {
        const produits = chargerProduits(vendeur.id);
        const estInscrit = vendeur.id > 1000; // Les vendeurs inscrits ont des ID > 1000
        
        const card = document.createElement('div');
        card.className = 'admin-vendeur-card';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'admin-vendeur-info';
        
        const h3 = document.createElement('h3');
        h3.textContent = vendeur.nom;
        infoDiv.appendChild(h3);
        
        const addInfo = (label, value) => {
            const p = document.createElement('p');
            const strong = document.createElement('strong');
            strong.textContent = label;
            p.appendChild(strong);
            p.appendChild(document.createTextNode(value));
            infoDiv.appendChild(p);
        };
        
        addInfo('ID: ', vendeur.id);
        addInfo('Zone: ', vendeur.zone);
        addInfo('Téléphone: ', vendeur.telephone);
        addInfo('WhatsApp: ', vendeur.whatsapp || 'Non renseigné');
        addInfo('Produits: ', produits.length);
        
        const pType = document.createElement('p');
        const strongType = document.createElement('strong');
        strongType.textContent = 'Type: ';
        pType.appendChild(strongType);
        const spanType = document.createElement('span');
        spanType.textContent = estInscrit ? 'Inscrit et validé' : 'Statique';
        spanType.style.color = estInscrit ? '#4CAF50' : '#2196F3';
        pType.appendChild(spanType);
        infoDiv.appendChild(pType);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'admin-vendeur-actions';
        
        const a = document.createElement('a');
        a.href = `vendeur.html?id=${vendeur.id}`;
        a.className = 'btn';
        a.target = '_blank';
        a.textContent = 'Voir le profil';
        actionsDiv.appendChild(a);
        
        if (produits.length > 0) {
            const btnProduits = document.createElement('button');
            btnProduits.className = 'btn-secondary';
            btnProduits.textContent = `Voir les produits (${produits.length})`;
            btnProduits.addEventListener('click', () => afficherProduitsVendeur(vendeur.id, vendeur.nom));
            actionsDiv.appendChild(btnProduits);
        }
        
        if (estInscrit) {
            const btnSupprimer = document.createElement('button');
            btnSupprimer.className = 'btn-danger';
            btnSupprimer.textContent = 'Supprimer ce vendeur';
            btnSupprimer.addEventListener('click', () => supprimerVendeur(vendeur.id, vendeur.nom));
            actionsDiv.appendChild(btnSupprimer);
        } else {
            const p = document.createElement('p');
            p.style.color = '#999';
            p.style.fontSize = '0.9em';
            p.textContent = 'Vendeur statique (ne peut pas être supprimé)';
            actionsDiv.appendChild(p);
        }
        
        card.appendChild(infoDiv);
        card.appendChild(actionsDiv);
        container.appendChild(card);
    });
}

// Fonction pour afficher les produits d'un vendeur dans une modal
function afficherProduitsVendeur(vendeurId, vendeurNom) {
    const vendeur = trouverVendeur(vendeurId);
    if (!vendeur) {
        alert('Vendeur introuvable.');
        return;
    }
    
    // Récupérer uniquement les produits locaux (ceux qui peuvent être supprimés)
    const produitsLocaux = JSON.parse(localStorage.getItem(`vendeur_${vendeurId}_produits`) || '[]');
    
    if (produitsLocaux.length === 0) {
        alert('Ce vendeur n\'a pas de produits ajoutés (seulement des produits statiques qui ne peuvent pas être supprimés).');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'admin-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'admin-modal-header';
    
    const h2 = document.createElement('h2');
    h2.textContent = `Produits de ${vendeurNom}`;
    modalHeader.appendChild(h2);
    
    const btnClose = document.createElement('button');
    btnClose.className = 'admin-modal-close';
    btnClose.textContent = '×';
    btnClose.addEventListener('click', () => modal.remove());
    modalHeader.appendChild(btnClose);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'admin-modal-body';
    
    produitsLocaux.forEach((produit, index) => {
        const produitItem = document.createElement('div');
        produitItem.className = 'admin-produit-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'admin-produit-info';
        
        const h4 = document.createElement('h4');
        h4.textContent = produit.nom;
        infoDiv.appendChild(h4);
        
        const pPrix = document.createElement('p');
        const strongPrix = document.createElement('strong');
        strongPrix.textContent = 'Prix: ';
        pPrix.appendChild(strongPrix);
        pPrix.appendChild(document.createTextNode(produit.prix));
        infoDiv.appendChild(pPrix);
        
        const pDesc = document.createElement('p');
        pDesc.textContent = produit.description;
        infoDiv.appendChild(pDesc);
        
        if (produit.image) {
            const img = document.createElement('img');
            img.src = produit.image;
            img.alt = produit.nom;
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            img.style.borderRadius = '5px';
            img.style.marginTop = '5px';
            infoDiv.appendChild(img);
        }
        
        const btnSupprimer = document.createElement('button');
        btnSupprimer.className = 'btn-danger btn-small';
        btnSupprimer.textContent = 'Supprimer';
        btnSupprimer.addEventListener('click', () => supprimerProduit(vendeurId, index, produit.nom));
        
        produitItem.appendChild(infoDiv);
        produitItem.appendChild(btnSupprimer);
        modalBody.appendChild(produitItem);
    });
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Fonction pour valider un vendeur
// Fonction pour créer et stocker un message de bienvenue pour un vendeur validé
function creerMessageBienvenue(vendeurId, vendeurNom) {
    const message = {
        id: Date.now(),
        type: 'bienvenue',
        titre: 'Bienvenue sur Teranga Bio Sénégal !',
        contenu: `Félicitations ${vendeurNom} !\n\nVotre inscription sur la plateforme Teranga Bio Sénégal a été validée avec succès.\n\nVotre identifiant vendeur est : **${vendeurId}**\n\nConservez précieusement cet identifiant, il vous sera utile pour accéder à votre espace vendeur et gérer vos produits.\n\nVous pouvez dès maintenant commencer à ajouter vos produits bio sur la plateforme.\n\nBienvenue dans la communauté Teranga Bio !`,
        dateCreation: new Date().toISOString(),
        lu: false
    };
    
    // Stocker le message dans localStorage
    const messages = JSON.parse(localStorage.getItem(`messages_vendeur_${vendeurId}`) || '[]');
    messages.push(message);
    localStorage.setItem(`messages_vendeur_${vendeurId}`, JSON.stringify(messages));
    
    return message;
}

// Fonction pour récupérer les messages d'un vendeur
function recupererMessagesVendeur(vendeurId) {
    return JSON.parse(localStorage.getItem(`messages_vendeur_${vendeurId}`) || '[]');
}

// Fonction pour marquer un message comme lu
function marquerMessageLu(vendeurId, messageId) {
    const messages = recupererMessagesVendeur(vendeurId);
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
        messages[messageIndex].lu = true;
        localStorage.setItem(`messages_vendeur_${vendeurId}`, JSON.stringify(messages));
    }
}

function validerVendeur(vendeurId, vendeurNom) {
    if (!confirm(`Valider l'inscription de "${vendeurNom}" ?\n\nLe vendeur sera visible sur la plateforme et recevra un message de bienvenue avec son identifiant.`)) {
        return;
    }
    
    // Récupérer tous les vendeurs inscrits
    const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    const vendeurIndex = inscrits.findIndex(v => v.id === vendeurId);
    
    if (vendeurIndex !== -1) {
        // Mettre à jour le statut
        inscrits[vendeurIndex].statut = 'valide';
        inscrits[vendeurIndex].dateValidation = new Date().toISOString();
        
        // Créer et stocker le message de bienvenue
        creerMessageBienvenue(vendeurId, vendeurNom);
        
        // Sauvegarder
        localStorage.setItem('vendeurs_inscrits', JSON.stringify(inscrits));
        
        // Actualiser l'affichage
        actualiserStatistiquesAdmin();
        afficherInscriptionsEnAttente();
        afficherListeVendeursAdmin();
        
        // Mettre à jour la carte des zones couvertes si elle est initialisée
        if (carteInitialisee && carteSenegal) {
            afficherZonesSurCarte();
        }
        // Mettre à jour les badges de zones
        afficherZonesCouvertes();
        
        afficherMessageValidation(`Le vendeur "${vendeurNom}" a été validé avec succès. Un message de bienvenue avec son identifiant (${vendeurId}) lui a été envoyé.`, 'success');
    }
}

// Fonction pour rejeter un vendeur
function rejeterVendeur(vendeurId, vendeurNom) {
    if (!confirm(`Rejeter l'inscription de "${vendeurNom}" ?\n\nCette action supprimera définitivement l'inscription et tous ses produits.`)) {
        return;
    }
    
    if (!confirm('Êtes-vous sûr ? Cette action est irréversible.')) {
        return;
    }
    
    // Récupérer les vendeurs inscrits
    const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    const nouveauxInscrits = inscrits.filter(v => v.id !== vendeurId);
    
    // Sauvegarder
    localStorage.setItem('vendeurs_inscrits', JSON.stringify(nouveauxInscrits));
    
    // Supprimer aussi les produits de ce vendeur
    localStorage.removeItem(`vendeur_${vendeurId}_produits`);
    
    // Actualiser l'affichage
    actualiserStatistiquesAdmin();
    afficherInscriptionsEnAttente();
    afficherListeVendeursAdmin();
    
    // Mettre à jour la carte des zones couvertes si elle est initialisée
    if (carteInitialisee && carteSenegal) {
        afficherZonesSurCarte();
    }
    // Mettre à jour les badges de zones
    afficherZonesCouvertes();
    
    afficherMessageValidation(`L'inscription de "${vendeurNom}" a été rejetée.`, 'success');
}

// Fonction pour afficher un message de validation
function afficherMessageValidation(message, type) {
    const messageDiv = document.getElementById('message-validation');
    if (!messageDiv) return;
    
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'success' : 'error';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Fonction pour supprimer un vendeur
function supprimerVendeur(vendeurId, vendeurNom) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le vendeur "${vendeurNom}" ?\n\nCette action supprimera également tous ses produits et est irréversible.`)) {
        return;
    }
    
    // Récupérer les vendeurs inscrits
    const inscrits = JSON.parse(localStorage.getItem('vendeurs_inscrits') || '[]');
    const nouveauxInscrits = inscrits.filter(v => v.id !== vendeurId);
    
    // Sauvegarder
    localStorage.setItem('vendeurs_inscrits', JSON.stringify(nouveauxInscrits));
    
    // Supprimer aussi les produits de ce vendeur
    localStorage.removeItem(`vendeur_${vendeurId}_produits`);
    
    // Actualiser l'affichage
    actualiserStatistiquesAdmin();
    afficherInscriptionsEnAttente();
    afficherListeVendeursAdmin();
    
    // Mettre à jour la carte des zones couvertes si elle est initialisée
    if (carteInitialisee && carteSenegal) {
        afficherZonesSurCarte();
    }
    // Mettre à jour les badges de zones
    afficherZonesCouvertes();
    
    afficherMessageAdmin('Le vendeur a été supprimé avec succès.', 'success');
}

// Fonction pour supprimer un produit
function supprimerProduit(vendeurId, produitIndex, nomProduit) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${nomProduit}" ?`)) {
        return;
    }
    
    const key = `vendeur_${vendeurId}_produits`;
    const produits = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (produitIndex >= 0 && produitIndex < produits.length) {
        produits.splice(produitIndex, 1);
        localStorage.setItem(key, JSON.stringify(produits));
        
        // Actualiser l'affichage
        actualiserStatistiquesAdmin();
        afficherListeVendeursAdmin();
        
        // Fermer et rouvrir la modal pour actualiser
        document.querySelector('.admin-modal')?.remove();
        const vendeur = trouverVendeur(vendeurId);
        if (vendeur) {
            afficherProduitsVendeur(vendeurId, vendeur.nom);
        }
        
        afficherMessageAdmin('Le produit a été supprimé avec succès.', 'success');
    }
}

// Fonction pour réinitialiser tous les vendeurs inscrits
function reinitialiserVendeursInscrits() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUS les vendeurs inscrits ?\n\nCette action est irréversible et supprimera également tous leurs produits.')) {
        return;
    }
    
    if (!confirm('DERNIÈRE CONFIRMATION : Supprimer définitivement tous les vendeurs inscrits ?')) {
        return;
    }
    
    // Supprimer tous les vendeurs inscrits
    localStorage.removeItem('vendeurs_inscrits');
    
    // Supprimer tous les produits de tous les vendeurs inscrits
    const tousVendeurs = chargerTousVendeurs();
    tousVendeurs.forEach(vendeur => {
        if (vendeur.id > 1000) { // Vendeurs inscrits
            localStorage.removeItem(`vendeur_${vendeur.id}_produits`);
        }
    });
    
    actualiserStatistiquesAdmin();
    afficherInscriptionsEnAttente();
    afficherListeVendeursAdmin();
    afficherMessageAdmin('Tous les vendeurs inscrits ont été supprimés.', 'success');
}

// Fonction pour réinitialiser tous les produits
function reinitialiserTousProduits() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer TOUS les produits de TOUS les vendeurs ?\n\nCette action est irréversible.')) {
        return;
    }
    
    // Supprimer tous les produits de tous les vendeurs
    const tousVendeurs = chargerTousVendeurs();
    tousVendeurs.forEach(vendeur => {
        localStorage.removeItem(`vendeur_${vendeur.id}_produits`);
    });
    
    actualiserStatistiquesAdmin();
    afficherInscriptionsEnAttente();
    afficherListeVendeursAdmin();
    afficherMessageAdmin('Tous les produits ont été supprimés.', 'success');
}

// Fonction pour réinitialiser toutes les données
function reinitialiserToutesDonnees() {
    if (!confirm('ATTENTION : Êtes-vous sûr de vouloir supprimer TOUTES les données (vendeurs inscrits + produits) ?\n\nCette action est irréversible !')) {
        return;
    }
    
    if (!confirm('DERNIÈRE CONFIRMATION : Supprimer définitivement TOUTES les données ?')) {
        return;
    }
    
    if (!confirm('DERNIÈRE ALERTE : Cette action va tout effacer. Confirmez une dernière fois.')) {
        return;
    }
    
    // Supprimer toutes les données
    localStorage.removeItem('vendeurs_inscrits');
    
    const tousVendeurs = chargerTousVendeurs();
    tousVendeurs.forEach(vendeur => {
        localStorage.removeItem(`vendeur_${vendeur.id}_produits`);
    });
    
    actualiserStatistiquesAdmin();
    afficherInscriptionsEnAttente();
    afficherListeVendeursAdmin();
    afficherMessageAdmin('Toutes les données ont été supprimées.', 'success');
}

// Fonction pour afficher un message dans l'admin
function afficherMessageAdmin(message, type) {
    const messageDiv = document.getElementById('message-admin-actions');
    if (!messageDiv) return;
    
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'success' : 'error';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Gestion de l'administration
function gererAdministration() {
    // Vérifier si on est sur la page admin (compatible mobile et desktop)
    const pathname = window.location.pathname || '';
    const href = window.location.href || '';
    const isAdminPage = pathname.includes('admin.html') || href.includes('admin.html') || 
                        document.getElementById('admin-login') !== null;
    
    if (!isAdminPage) {
        return;
    }
    
    initialiserMotDePasseAdmin();
    
    // S'assurer que la page de connexion est visible par défaut
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    
    if (loginSection) {
        loginSection.style.setProperty('display', 'flex', 'important');
        loginSection.style.setProperty('visibility', 'visible', 'important');
    }
    if (dashboardSection) {
        dashboardSection.style.setProperty('display', 'none', 'important');
        dashboardSection.style.setProperty('visibility', 'hidden', 'important');
    }
    
    // Vérifier si l'admin est déjà connecté
    if (estAdminConnecte()) {
        afficherTableauDeBordAdmin();
    } else {
        afficherConnexionAdmin();
    }
    
    // Gestion du formulaire de connexion
    const formLogin = document.getElementById('form-admin-login');
    if (formLogin) {
        formLogin.onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const passwordInput = document.getElementById('admin-password');
            const password = passwordInput ? passwordInput.value.trim() : '';
            const messageDiv = document.getElementById('message-admin-login');
            
            // Réinitialiser le message
            if (messageDiv) {
                messageDiv.style.display = 'none';
                messageDiv.textContent = '';
                messageDiv.className = '';
            }
            
            // Vérifier si bloqué
            if (estAdminBloque()) {
                const minutes = getTempsRestantBlocage();
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    messageDiv.textContent = `Trop de tentatives échouées. Veuillez réessayer dans ${minutes} minute(s).`;
                    messageDiv.className = 'error';
                }
                return false;
            }
            
            // Vérifier le mot de passe
            if (connecterAdmin(password)) {
                // Connexion réussie
                afficherTableauDeBordAdmin();
                if (passwordInput) passwordInput.value = '';
                return false;
            } else {
                // Mot de passe incorrect
                const attemptsData = JSON.parse(localStorage.getItem(ADMIN_LOGIN_ATTEMPTS_KEY) || '{"count": 0}');
                const remaining = MAX_LOGIN_ATTEMPTS - attemptsData.count;
                
                if (messageDiv) {
                    messageDiv.style.display = 'block';
                    if (remaining > 1) {
                        messageDiv.textContent = `Mot de passe incorrect. ${remaining} tentative(s) restante(s).`;
                    } else {
                        messageDiv.textContent = `Mot de passe incorrect. Dernière tentative avant blocage.`;
                    }
                    messageDiv.className = 'error';
                }
                return false;
            }
        };
    }
    
    // Bouton de déconnexion
    const btnDeconnexion = document.getElementById('btn-deconnexion');
    if (btnDeconnexion) {
        btnDeconnexion.addEventListener('click', function() {
            deconnecterAdmin();
            afficherConnexionAdmin();
            if (formLogin) formLogin.reset();
        });
    }
    
    // Bouton de rafraîchissement des inscriptions en attente
    // Attendre que le dashboard soit visible avant d'attacher l'event listener
    setTimeout(function() {
        const btnRefreshEnAttente = document.getElementById('btn-refresh-en-attente');
        if (btnRefreshEnAttente) {
            console.log('Bouton actualiser trouvé, ajout de l\'event listener');
            // Retirer tous les event listeners existants en clonant le bouton
            const newBtn = btnRefreshEnAttente.cloneNode(true);
            btnRefreshEnAttente.parentNode.replaceChild(newBtn, btnRefreshEnAttente);
            
            // Ajouter le nouvel event listener
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Bouton actualiser cliqué depuis gererAdministration');
                afficherInscriptionsEnAttente();
                actualiserStatistiquesAdmin();
                // Afficher un message de confirmation
                const messageDiv = document.getElementById('message-validation');
                if (messageDiv) {
                    messageDiv.textContent = 'Liste actualisée avec succès.';
                    messageDiv.className = 'success';
                    messageDiv.style.display = 'block';
                    setTimeout(function() {
                        messageDiv.style.display = 'none';
                    }, 3000);
                }
            });
        } else {
            console.error('Bouton actualiser non trouvé dans gererAdministration');
        }
    }, 500);
    
    // Boutons d'actions
    const btnResetVendeurs = document.getElementById('btn-reset-vendeurs');
    const btnResetProduits = document.getElementById('btn-reset-produits');
    const btnResetTout = document.getElementById('btn-reset-tout');
    
    if (btnResetVendeurs) {
        btnResetVendeurs.addEventListener('click', reinitialiserVendeursInscrits);
    }
    if (btnResetProduits) {
        btnResetProduits.addEventListener('click', reinitialiserTousProduits);
    }
    if (btnResetTout) {
        btnResetTout.addEventListener('click', reinitialiserToutesDonnees);
    }
}

// Fonction d'initialisation
function initialiserPage() {
    // Détection améliorée pour mobile et desktop
    const pathname = window.location.pathname || '';
    const href = window.location.href || '';
    const filename = pathname.split('/').pop() || '';
    
    // Vérifier si on est sur la page admin (par élément HTML en priorité)
    const isAdminPage = document.getElementById('admin-login') !== null ||
                        pathname.includes('admin.html') || 
                        href.includes('admin.html') || 
                        filename === 'admin.html';
    
    if (isAdminPage) {
        gererAdministration();
        return;
    }
    
    // Vérifier si on est sur la page vendeurs (par élément HTML en priorité)
    const isVendeursPage = document.getElementById('recherche-vendeur') !== null ||
                            document.getElementById('liste-vendeurs') !== null ||
                            pathname.includes('vendeurs.html') || 
                            href.includes('vendeurs.html') || 
                            filename === 'vendeurs.html';
    
    if (isVendeursPage) {
        initialiserRechercheFiltres();
        return;
    }
    
    // Vérifier si on est sur la page vendeur (par élément HTML en priorité)
    const isVendeurPage = document.getElementById('nom-vendeur') !== null ||
                          document.getElementById('profil-vendeur') !== null ||
                          pathname.includes('vendeur.html') || 
                          href.includes('vendeur.html') || 
                          filename === 'vendeur.html';
    
    if (isVendeurPage) {
        afficherProfilVendeur();
        return;
    }
    
    // Page d'accueil (index.html, /, ou page par défaut)
    const isHomePage = document.body.classList.contains('page-accueil') ||
                       pathname.includes('index.html') || 
                       href.includes('index.html') || 
                       filename === 'index.html' ||
                       filename === '' ||
                       pathname === '/' || 
                       pathname.endsWith('/');
    
    if (isHomePage) {
        // gererAffichageFormulaire() désactivé - géré par toggleFormulaire() dans index.html
        // gererAffichageFormulaire();
        gererInscription();
        afficherStatistiques();
        afficherProduitsVedettes();
        afficherZonesCouvertes();
        initialiserAnimationsScroll();
        initialiserNavigation();
        
        // S'assurer que les étapes de la section comment-ca-marche sont visibles
        setTimeout(function() {
            const sectionComment = document.getElementById('comment-ca-marche');
            if (sectionComment) {
                const etapes = sectionComment.querySelectorAll('.etape');
                etapes.forEach(function(etape) {
                    etape.classList.add('visible');
                    etape.style.setProperty('opacity', '1', 'important');
                    etape.style.setProperty('transform', 'none', 'important');
                    etape.style.setProperty('display', 'flex', 'important');
                    etape.style.setProperty('visibility', 'visible', 'important');
                });
            }
        }, 300);
        
        // Mettre à jour la carte si elle est déjà initialisée
        if (carteInitialisee && carteSenegal) {
            afficherZonesSurCarte();
        }
    }
}

// Initialisation selon la page
function demarrerInitialisation() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initialiserPage, 100);
        });
    } else {
        // Le DOM est déjà chargé
        setTimeout(initialiserPage, 100);
    }
}

// Démarrer l'initialisation
demarrerInitialisation();

// Backup: s'assurer que la page admin s'affiche correctement
setTimeout(function() {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    
    if (loginSection && document.body.contains(loginSection)) {
        // Si on est sur la page admin et que l'admin n'est pas connecté, afficher le login
        if (!estAdminConnecte()) {
            loginSection.style.setProperty('display', 'flex', 'important');
            loginSection.style.setProperty('visibility', 'visible', 'important');
            loginSection.style.setProperty('opacity', '1', 'important');
        }
    }
    
    if (dashboardSection && document.body.contains(dashboardSection)) {
        // Si l'admin n'est pas connecté, masquer le dashboard
        if (!estAdminConnecte()) {
            dashboardSection.style.setProperty('display', 'none', 'important');
            dashboardSection.style.setProperty('visibility', 'hidden', 'important');
        }
    }
    
    // Backup pour la page d'accueil : s'assurer que toutes les sections sont visibles (sauf le formulaire d'inscription)
    if (document.body.classList.contains('page-accueil')) {
        const sections = document.querySelectorAll('body.page-accueil section');
        sections.forEach(function(section) {
            if (section && section.id !== 'inscription-vendeur') {
                section.style.setProperty('display', 'block', 'important');
                section.style.setProperty('visibility', 'visible', 'important');
                section.style.setProperty('opacity', '1', 'important');
            }
        });
        
        // Ne pas toucher au formulaire d'inscription dans le backup - laisser gererAffichageFormulaire() gérer
        
        // Réessayer d'afficher les éléments dynamiques
        if (document.getElementById('produits-vedettes-container')) {
            afficherProduitsVedettes();
        }
        if (document.getElementById('zones-container')) {
            afficherZonesCouvertes();
        }
        if (document.getElementById('nombre-vendeurs')) {
            afficherStatistiques();
        }
        
        // S'assurer que la section zones-couvertes est visible et initialisée
        const sectionZones = document.getElementById('zones-couvertes');
        if (sectionZones) {
            sectionZones.style.setProperty('display', 'block', 'important');
            sectionZones.style.setProperty('visibility', 'visible', 'important');
            sectionZones.style.setProperty('opacity', '1', 'important');
            
            // S'assurer que la description encadrée est visible
            const descriptionEncadree = sectionZones.querySelector('.description-encadree');
            if (descriptionEncadree) {
                descriptionEncadree.style.setProperty('display', 'block', 'important');
                descriptionEncadree.style.setProperty('visibility', 'visible', 'important');
                descriptionEncadree.style.setProperty('opacity', '1', 'important');
                descriptionEncadree.classList.add('visible');
            }
            
            // S'assurer que la carte est visible
            const carteContainer = document.getElementById('carte-senegal');
            if (carteContainer) {
                carteContainer.style.setProperty('display', 'block', 'important');
                carteContainer.style.setProperty('visibility', 'visible', 'important');
                carteContainer.style.setProperty('opacity', '1', 'important');
                
                // Initialiser la carte si elle ne l'est pas déjà et si Leaflet est disponible
                if (typeof L !== 'undefined' && !carteInitialisee) {
                    setTimeout(() => {
                        initialiserCarteSenegal();
                    }, 400);
                }
            }
            
            // S'assurer que la légende est visible
            const legende = sectionZones.querySelector('.legende-carte');
            if (legende) {
                legende.style.setProperty('display', 'flex', 'important');
                legende.style.setProperty('visibility', 'visible', 'important');
                legende.style.setProperty('opacity', '1', 'important');
            }
            
            // S'assurer que le conteneur de zones est visible
            const zonesContainer = document.getElementById('zones-container');
            if (zonesContainer) {
                zonesContainer.style.setProperty('display', 'flex', 'important');
                zonesContainer.style.setProperty('visibility', 'visible', 'important');
                zonesContainer.style.setProperty('opacity', '1', 'important');
            }
        }
        
        // S'assurer que la navigation est visible
        const mainNav = document.getElementById('main-nav');
        if (mainNav) {
            mainNav.style.setProperty('display', 'flex', 'important');
            mainNav.style.setProperty('visibility', 'visible', 'important');
            mainNav.style.setProperty('opacity', '1', 'important');
        }
        
        // Réinitialiser la navigation pour s'assurer que les événements sont bien attachés
        initialiserNavigation();
        
        // Le formulaire d'inscription est maintenant géré par toggleFormulaire() dans index.html
    }
}, 200);

// Backup : réessayer après un délai supplémentaire (pour mobile)
setTimeout(function() {
    // Si on est sur la page vendeurs et que la liste est vide, réessayer
    const liste = document.getElementById('liste-vendeurs');
    if (liste && liste.children.length === 0 && document.getElementById('recherche-vendeur')) {
        initialiserRechercheFiltres();
    }
}, 500);

// Fonction pour initialiser la navigation
function initialiserNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-dropdown-toggle):not(.nav-dropdown-close)');
    const dropdownToggle = document.getElementById('nav-dropdown-toggle');
    const dropdownMenu = document.getElementById('nav-dropdown-menu');
    const dropdown = dropdownToggle ? dropdownToggle.closest('.nav-dropdown') : null;
    const dropdownLinks = document.querySelectorAll('.nav-dropdown-link');
    const allNavLinks = document.querySelectorAll('.nav-link:not(.nav-dropdown-toggle):not(.nav-dropdown-close), .nav-dropdown-link');
    
    if (!mainNav) return; // Si le menu n'existe pas, on sort
    
    // Toggle menu déroulant "Voir plus"
    if (dropdownToggle && dropdown) {
        // Attacher l'événement sur le bouton "Voir plus"
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Fermer le menu déroulant avec le bouton "Voir moins"
        const closeBtn = document.getElementById('nav-dropdown-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.remove('active');
            });
        }
        
        // Fermer le menu déroulant en cliquant ailleurs (seulement sur desktop)
        document.addEventListener('click', function(e) {
            if (window.innerWidth > 767 && dropdown.classList.contains('active') && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Fermer le menu déroulant en cliquant sur un lien (desktop seulement)
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth > 767) {
                    dropdown.classList.remove('active');
                }
            });
        });
    }
    
    // Toggle menu mobile
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
        
        // Fermer le menu en cliquant sur un lien (mobile)
        allNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Ne pas fermer le menu si c'est le bouton "Voir moins"
                if (this.id === 'nav-dropdown-close') {
                    return;
                }
                if (window.innerWidth <= 767) {
                    navToggle.classList.remove('active');
                    mainNav.classList.remove('active');
                }
            });
        });
    }
    
    // Smooth scroll pour les liens de navigation
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Ne pas traiter le bouton "Voir moins" comme un lien de navigation
            if (this.id === 'nav-dropdown-close' || this.classList.contains('nav-dropdown-close')) {
                return;
            }
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Mettre à jour l'état actif du menu au scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                allNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-section') === sectionId || 
                        link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Appel initial
}