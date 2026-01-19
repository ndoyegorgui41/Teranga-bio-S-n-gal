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
    
    // Initialiser le modal
    initModal();
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

// ============================================
// MODAL DE PUBLICATION
// ============================================

function initModal() {
    const btnPublier = document.getElementById('btn-publier-annonce-categories');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    
    if (btnPublier) {
        btnPublier.addEventListener('click', function() {
            // Rediriger vers la page d'accueil pour publier (le modal complet y est)
            window.location.href = 'index.html#video-presentation';
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            if (modalOverlay) {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                modalOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
}
