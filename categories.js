// ============================================
// PAGE CATÉGORIES - TERANGA BIO SÉNÉGAL
// ============================================

// Définition des catégories avec icônes et identifiants
const categories = [
    {
        id: 'legumes',
        name: 'Légumes',
        icon: '🥬',
        description: 'Tomates, oignons, carottes...'
    },
    {
        id: 'fruits',
        name: 'Fruits',
        icon: '🍌',
        description: 'Mangues, bananes, oranges...'
    },
    {
        id: 'cereales',
        name: 'Céréales & légumineuses',
        icon: '🌾',
        description: 'Riz, mil, niébé...'
    },
    {
        id: 'transformes',
        name: 'Produits transformés',
        icon: '🥫',
        description: 'Confitures, jus, huiles...'
    },
    {
        id: 'epices',
        name: 'Épices & condiments',
        icon: '🌶️',
        description: 'Piment, gingembre, ail...'
    },
    {
        id: 'elevage',
        name: 'Produits d\'élevage',
        icon: '🥚',
        description: 'Œufs, lait, miel...'
    },
    {
        id: 'semences',
        name: 'Semences & plants',
        icon: '🌱',
        description: 'Graines, plants bio...'
    },
    {
        id: 'artisanal',
        name: 'Produits artisanaux bio',
        icon: '🫖',
        description: 'Savons, cosmétiques...'
    },
    {
        id: 'autres',
        name: 'Autres produits bio',
        icon: '🌿',
        description: 'Tous les autres produits bio locaux'
    }
];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que le scroll est restauré au chargement
    document.body.style.overflow = '';
    
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
    
    // Générer la grille de catégories
    generateCategoriesGrid();
    
    // Le modal est maintenant géré par modal-publication.js
    
    // Gestionnaire global pour la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal-publication');
            if (modal && modal.style.display !== 'none' && modal.style.display !== '') {
                closeModal();
            }
        }
    });
});

// ============================================
// GÉNÉRATION DE LA GRILLE DE CATÉGORIES
// ============================================

function generateCategoriesGrid() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    categories.forEach(category => {
        const card = createCategoryCard(category);
        grid.appendChild(card);
    });
}

function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'categorie-card';
    card.dataset.categoryId = category.id;
    
    card.innerHTML = `
        <div class="categorie-icon">${category.icon}</div>
        <h3 class="categorie-name">${category.name}</h3>
    `;
    
    // Ajouter l'événement de clic
    card.addEventListener('click', function() {
        navigateToCategory(category.id);
    });
    
    // Ajouter les effets de hover tactiles
    card.addEventListener('touchstart', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    card.addEventListener('touchend', function() {
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
    
    return card;
}

// ============================================
// NAVIGATION VERS LA PAGE ANNONCES AVEC FILTRE
// ============================================

function navigateToCategory(categoryId) {
    // Rediriger vers la page annonces avec le filtre de catégorie
    window.location.href = `annonces.html?categorie=${categoryId}`;
}

// Le modal est maintenant géré par modal-publication.js

// Copier la logique du modal depuis annonces.js
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
                window.location.href = 'annonces.html';
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
