// ============================================
// ADMINISTRATION - TERANGA BIO SÉNÉGAL
// ============================================

// admin.js chargé

// Constantes
// Utiliser des constantes différentes pour éviter les conflits avec script.js
const ADMIN_PASSWORD_ADMIN = 'admin123'; // À changer en production
const ADMIN_SESSION_KEY_ADMIN = 'admin_session';

// ============================================
// FONCTION GLOBALE POUR CHANGER D'ONGLET
// ============================================

// Définir la fonction globalement AVANT le DOMContentLoaded pour qu'elle soit accessible depuis onclick
window.adminSwitchTab = function(tabName, filter = null) {
    // Vérifier que le dashboard est visible
    const adminDashboard = document.getElementById('admin-dashboard');
    if (!adminDashboard) {
        console.error('❌ Dashboard admin non trouvé');
        return;
    }
    
    if (adminDashboard.style.display === 'none') {
        console.error('❌ Dashboard admin non visible');
        return;
    }
    
    // Masquer TOUS les onglets d'abord
    const allTabs = document.querySelectorAll('.admin-tab-content');
    
    allTabs.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
        content.style.visibility = 'hidden';
    });
    
    // Désactiver tous les boutons d'onglets
    const allTabButtons = document.querySelectorAll('.admin-tab');
    allTabButtons.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Trouver l'onglet cible
    const targetTabId = `tab-${tabName}`;
    const targetTab = document.getElementById(targetTabId);
    const targetButton = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
    
    if (!targetTab) {
        console.error('❌ Onglet non trouvé:', targetTabId);
        const allAvailableTabs = document.querySelectorAll('.admin-tab-content');
        const availableIds = Array.from(allAvailableTabs).map(t => t.id);
        console.error('📋 Onglets disponibles:', availableIds);
        alert(`Onglet "${targetTabId}" non trouvé.\n\nOnglets disponibles:\n${availableIds.join('\n')}`);
        return;
    }
    
    // CORRECTION PROBLÈME 14 : AFFICHER l'onglet cible de manière plus robuste
    // 1. Retirer toutes les classes qui pourraient masquer l'onglet
    targetTab.classList.remove('hidden', 'inactive');
    targetTab.classList.add('active');
    
    // 2. Forcer l'affichage avec plusieurs méthodes pour garantir la visibilité
    targetTab.style.setProperty('display', 'block', 'important');
    targetTab.style.setProperty('visibility', 'visible', 'important');
    targetTab.style.setProperty('opacity', '1', 'important');
    targetTab.style.setProperty('position', 'relative', 'important');
    targetTab.style.setProperty('height', 'auto', 'important');
    targetTab.style.setProperty('overflow', 'visible', 'important');
    
    // 3. Retirer tout style inline qui pourrait masquer
    targetTab.style.removeProperty('height');
    if (targetTab.style.height === '0px') {
        targetTab.style.height = 'auto';
    }
    
    // Activer le bouton correspondant
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // CORRECTION PROBLÈME 14 : Vérification immédiate et après délai
    // Vérification immédiate
    const immediateCheck = window.getComputedStyle(targetTab);
    if (immediateCheck.display === 'none' || immediateCheck.visibility === 'hidden') {
        // Onglet masqué, nouvelle tentative...
        // Forcer à nouveau avec requestAnimationFrame pour s'assurer que le DOM est mis à jour
        requestAnimationFrame(() => {
            targetTab.style.setProperty('display', 'block', 'important');
            targetTab.style.setProperty('visibility', 'visible', 'important');
        });
    }
    
    // Vérification après un court délai
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(targetTab);
        const isVisible = computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
        
        if (!isVisible) {
            // L'onglet est toujours masqué, tentative de correction finale...
            // Dernière tentative : forcer avec toutes les méthodes possibles
            targetTab.removeAttribute('style');
            targetTab.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important;';
            targetTab.classList.add('active');
            
            // Si toujours masqué, alerter l'utilisateur
            setTimeout(() => {
                const finalCheck = window.getComputedStyle(targetTab);
                if (finalCheck.display === 'none' || finalCheck.visibility === 'hidden') {
                    console.error('❌ ÉCHEC: Impossible d\'afficher l\'onglet. Vérifiez le CSS.');
                    alert(`Erreur: Impossible d'afficher l'onglet "${targetTabId}". Vérifiez la console pour plus de détails.`);
                }
            }, 50);
        }
    }, 100);
    
    // Actualiser le contenu selon l'onglet
    try {
        switch(tabName) {
            case 'dashboard':
                // Ne pas appeler actualiserDashboard() ici car cela peut causer une récursion
                // Le dashboard est déjà actualisé lors de l'affichage
                // Si besoin d'actualiser, utiliser un délai pour éviter les boucles
                setTimeout(() => {
                    if (typeof actualiserDashboard === 'function' && !isUpdatingDashboard) {
                        actualiserDashboard();
                    }
                }, 100);
                break;
            case 'vendeurs':
                if (filter) {
                    const selectStatut = document.getElementById('filter-vendeurs-statut');
                    if (selectStatut) {
                        selectStatut.value = filter;
                    }
                }
                if (typeof actualiserListeVendeurs === 'function') {
                    actualiserListeVendeurs(filter || null);
                }
                if (filter && typeof filtrerVendeurs === 'function') {
                    setTimeout(() => filtrerVendeurs(), 200);
                }
                break;
            case 'partenaires':
                if (filter) {
                    const selectStatut = document.getElementById('filter-partenaires-statut');
                    if (selectStatut) {
                        selectStatut.value = filter;
                    }
                }
                if (typeof actualiserListePartenaires === 'function') {
                    actualiserListePartenaires(filter || null);
                }
                if (filter && typeof filtrerPartenaires === 'function') {
                    setTimeout(() => filtrerPartenaires(), 200);
                }
                break;
            case 'annonces':
                if (filter) {
                    const selectStatut = document.getElementById('filter-annonces-statut');
                    if (selectStatut) {
                        selectStatut.value = filter;
                    }
                }
                if (typeof actualiserListeAnnonces === 'function') {
                    actualiserListeAnnonces();
                }
                if (filter && typeof filtrerAnnonces === 'function') {
                    setTimeout(() => filtrerAnnonces(), 200);
                }
                break;
            case 'campagnes':
                if (typeof actualiserListeCampagnes === 'function') {
                    actualiserListeCampagnes();
                }
                break;
            case 'categories':
                if (typeof actualiserCategoriesZones === 'function') {
                    actualiserCategoriesZones();
                }
                break;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'actualisation du contenu:', error);
    }
};

// ============================================
// INITIALISATION
// ============================================

// ============================================
// GESTION DES BOUTONS ET ICÔNES DU CENTRE DE DÉCISIONS
// ============================================

/**
 * Fonction pour gérer les clics sur les boutons et icônes du "Centre de décisions"
 * Ouvre l'onglet correspondant, applique le filtre si nécessaire, et scroll vers la section
 */
function gererClicCentreDecisions(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Utiliser event.target.closest pour trouver l'élément avec data-target
    // Cela fonctionne même avec la délégation d'événements
    const element = event.target.closest('[data-target]') || event.currentTarget;
    
    const targetId = element.getAttribute('data-target');
    const filter = element.getAttribute('data-filter');
    
    if (!targetId) {
        console.error('❌ Aucun data-target trouvé sur l\'élément cliqué');
        alert('Erreur: Aucun data-target trouvé. Vérifiez la console.');
        return;
    }
    
    // Vérifier que la section cible existe
    const targetSection = document.getElementById(targetId);
    if (!targetSection) {
        console.error(`❌ Section "${targetId}" non trouvée dans le DOM`);
        alert(`Erreur: Section "${targetId}" non trouvée. Vérifiez la console.`);
        return;
    }
    
    // Déterminer le nom de l'onglet à partir de l'ID
    // tab-vendeurs -> vendeurs, tab-partenaires -> partenaires, etc.
    const tabName = targetId.replace('tab-', '');
    
    // Ouvrir l'onglet correspondant
    if (typeof window.adminSwitchTab === 'function') {
        window.adminSwitchTab(tabName, filter || null);
    } else {
        console.error('❌ adminSwitchTab n\'est pas disponible');
        alert('Erreur: adminSwitchTab n\'est pas disponible. Vérifiez la console.');
        return;
    }
    
    // CORRECTION PROBLÈME 9 : Améliorer le scroll vers section
    // Attendre que l'onglet soit affiché avant de scroller
    // Utiliser plusieurs tentatives pour s'assurer que l'onglet est visible
    const scrollToSection = () => {
        // Vérifier que la section est visible
        const computedStyle = window.getComputedStyle(targetSection);
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' &&
                         computedStyle.opacity !== '0';
        
        if (!isVisible) {
            // Section non visible, nouvelle tentative de scroll...
            setTimeout(scrollToSection, 100);
            return;
        }
        
        // Retirer la classe active-section de toutes les sections
        document.querySelectorAll('.admin-tab-content').forEach(section => {
            section.classList.remove('active-section');
        });
        
        // Ajouter la classe active-section à la section cible
        targetSection.classList.add('active-section');
        
        // Scroll fluide vers la section avec options améliorées
        try {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        } catch (e) {
            // Fallback si scrollIntoView n'est pas supporté
            // scrollIntoView non supporté, utilisation de scrollTo
            const rect = targetSection.getBoundingClientRect();
            window.scrollTo({
                top: window.scrollY + rect.top - 20,
                behavior: 'smooth'
            });
        }
        
        // Retirer la classe active-section après 3 secondes pour l'animation
        setTimeout(() => {
            targetSection.classList.remove('active-section');
        }, 3000);
    };
    
    // Première tentative après 200ms
    setTimeout(scrollToSection, 200);
    
    // Tentative de secours après 500ms si la première échoue
    setTimeout(() => {
        const computedStyle = window.getComputedStyle(targetSection);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            scrollToSection();
        }
    }, 500);
}

/**
 * Initialiser les écouteurs d'événements pour les boutons et icônes du Centre de décisions
 */
// Variable globale pour stocker la fonction de gestion des clics (évite les doublons)
let centreDecisionsClickHandler = null;
let centreDecisionsKeydownHandler = null;

function initialiserCentreDecisions() {
    // Utiliser la délégation d'événements sur le conteneur parent
    const decisionCenter = document.querySelector('.admin-decision-center');
    if (!decisionCenter) {
        console.error('❌ .admin-decision-center non trouvé !');
        return false; // Retourner false pour indiquer l'échec
    }
    
    // Retirer les anciens écouteurs s'ils existent
    if (centreDecisionsClickHandler) {
        decisionCenter.removeEventListener('click', centreDecisionsClickHandler);
    }
    if (centreDecisionsKeydownHandler) {
        decisionCenter.removeEventListener('keydown', centreDecisionsKeydownHandler);
    }
    
    // Créer les nouveaux gestionnaires d'événements
    // CORRECTION PROBLÈME 12 et 13 : Amélioration de la détection des clics
    centreDecisionsClickHandler = function(event) {
        // CORRECTION PROBLÈME 13 : Chercher l'élément avec data-target de manière plus robuste
        // event.target peut être un enfant (emoji, texte, etc.), donc on remonte dans l'arbre DOM
        let clickedElement = event.target.closest('[data-target]');
        
        // Si on n'a pas trouvé, chercher dans le parent direct
        if (!clickedElement && event.target.parentElement) {
            clickedElement = event.target.parentElement.closest('[data-target]');
        }
        
        // Si toujours pas trouvé, vérifier si event.target lui-même a data-target
        if (!clickedElement && event.target.hasAttribute && event.target.hasAttribute('data-target')) {
            clickedElement = event.target;
        }
        
        // Vérifier si c'est un bouton ou une icône avec data-target
        if (clickedElement) {
            const isButton = clickedElement.classList.contains('btn-decision') || 
                           clickedElement.classList.contains('btn') ||
                           clickedElement.tagName === 'BUTTON';
            const isIcon = clickedElement.classList.contains('decision-icon') ||
                          (clickedElement.parentElement && clickedElement.parentElement.classList.contains('decision-icon'));
            
            // Si on a cliqué sur un enfant d'une icône, utiliser l'icône parente
            if (!isIcon && event.target.closest('.decision-icon')) {
                const iconParent = event.target.closest('.decision-icon');
                if (iconParent && iconParent.hasAttribute('data-target')) {
                    clickedElement = iconParent;
                }
            }
            
            // CORRECTION PROBLÈME 8 : Ne plus vérifier si désactivé (les boutons restent toujours actifs)
            // Vérifier seulement si c'est un bouton ou une icône valide
            if (isButton || clickedElement.classList.contains('decision-icon')) {
                gererClicCentreDecisions(event);
            }
        }
    };
    
    // Ajouter l'écouteur de clic
    decisionCenter.addEventListener('click', centreDecisionsClickHandler);
    
    // Support du clavier pour les icônes
    centreDecisionsKeydownHandler = function(event) {
        const focusedElement = event.target;
        if (focusedElement.classList.contains('decision-icon') && 
            focusedElement.hasAttribute('data-target') &&
            (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            gererClicCentreDecisions(event);
        }
    };
    
    decisionCenter.addEventListener('keydown', centreDecisionsKeydownHandler);
    
    // CORRECTION PROBLÈME 12 : Réinitialiser les boutons (ils restent toujours actifs maintenant)
    actualiserEtatBoutonsDecisions();
    
    return true; // Retourner true pour indiquer le succès
}

/**
 * Mettre à jour l'état visuel des boutons du Centre de décisions
 * NOTE: Les boutons restent toujours actifs même si le compteur est à 0 (selon les attentes utilisateur)
 */
function actualiserEtatBoutonsDecisions() {
    const decisionCards = document.querySelectorAll('.admin-decision-card');
    
    decisionCards.forEach((card) => {
        const numberElement = card.querySelector('.decision-number');
        const button = card.querySelector('.btn-decision');
        const icon = card.querySelector('.decision-icon');
        
        if (numberElement && button && icon) {
            const count = parseInt(numberElement.textContent) || 0;
            
            // CORRECTION PROBLÈME 8 : Les boutons restent toujours actifs
            // Même avec compteur à 0, l'utilisateur peut cliquer pour voir la liste (même si vide)
            button.disabled = false;
            button.classList.remove('disabled');
            button.removeAttribute('aria-disabled');
            icon.classList.remove('disabled');
            icon.style.opacity = '1';
            icon.style.cursor = 'pointer';
            icon.removeAttribute('aria-disabled');
            
            // Optionnel : Ajouter une classe visuelle pour indiquer si le compteur est à 0
            if (count === 0) {
                card.classList.add('decision-empty');
            } else {
                card.classList.remove('decision-empty');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (!document.body.classList.contains('admin-page')) {
        return;
    }
    
    initialiserAdmin();
});

// CORRECTION PROBLÈME 12 : Réinitialiser le Centre de décisions après chaque mise à jour du dashboard
// Observer les changements dans le DOM pour réinitialiser les event listeners si nécessaire
// NOTE: Désactivé temporairement car il causait une boucle infinie avec actualiserDashboard()
// L'initialisation se fait maintenant directement dans afficherDashboard()
/*
if (typeof MutationObserver !== 'undefined') {
    let isInitializing = false; // Flag pour éviter les boucles
    
    const observer = new MutationObserver(function(mutations) {
        if (isInitializing) return; // Éviter les boucles
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const decisionCenter = document.querySelector('.admin-decision-center');
                if (decisionCenter && mutation.target.contains && mutation.target.contains(decisionCenter)) {
                    // DOM modifié dans le Centre de décisions, réinitialisation...
                    isInitializing = true;
                    setTimeout(() => {
                        initialiserCentreDecisions();
                        isInitializing = false;
                    }, 100);
                }
            }
        });
    });
    
    // Observer les changements après le chargement initial
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const decisionCenter = document.querySelector('.admin-decision-center');
            if (decisionCenter) {
                observer.observe(decisionCenter, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                // Observer configuré pour le Centre de décisions
            }
        }, 500);
    });
}
*/

function initialiserAdmin() {
    // Vérifier si l'admin est connecté
    if (estAdminConnecte()) {
        afficherDashboard();
    } else {
        afficherLogin();
    }
    
    // Gestion de la connexion
    const formLogin = document.getElementById('form-admin-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            const passwordInput = document.getElementById('admin-password');
            if (!passwordInput) {
                console.error('❌ Champ mot de passe non trouvé');
                return;
            }
            
            const password = passwordInput.value;
            if (password === ADMIN_PASSWORD_ADMIN) {
                localStorage.setItem(ADMIN_SESSION_KEY_ADMIN, 'true');
                afficherDashboard();
            } else {
                afficherMessage('message-admin-login', 'Mot de passe incorrect.', 'error');
            }
        });
    }
    
    // Gestion de la déconnexion
    const btnDeconnexion = document.getElementById('btn-deconnexion');
    if (btnDeconnexion) {
        btnDeconnexion.addEventListener('click', function() {
            localStorage.removeItem(ADMIN_SESSION_KEY_ADMIN);
            afficherLogin();
        });
    }
    
    // Initialiser toutes les sections
    if (estAdminConnecte()) {
        initialiserDashboard();
        // NE PAS appeler initialiserCentreDecisions() ici car elle sera appelée dans afficherDashboard()
        // après que le dashboard soit visible
        
        // Initialiser les onglets APRÈS que le dashboard soit affiché
        setTimeout(() => {
            initialiserOnglets();
        }, 150);
        
        initialiserGestionVendeurs();
        initialiserGestionPartenaires();
        initialiserGestionAnnonces();
        initialiserGestionCampagnes();
        initialiserGestionCategories();
        initialiserBoutonClearHistory();
    } else {
        // Si pas connecté, initialiser les onglets quand même (pour le cas où ils existent)
        initialiserOnglets();
    }
}

// Initialiser les boutons du centre de décisions avec des event listeners
// Fonction supprimée - remplacée par initialiserCentreDecisions() qui est plus flexible

function estAdminConnecte() {
    return localStorage.getItem(ADMIN_SESSION_KEY_ADMIN) === 'true';
}

function afficherLogin() {
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    if (adminLogin) adminLogin.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
}

// Flag pour éviter les appels multiples à afficherDashboard
let isDisplayingDashboard = false;

function afficherDashboard() {
    // Éviter les appels multiples simultanés
    if (isDisplayingDashboard) {
        return;
    }
    
    isDisplayingDashboard = true;
    
    const adminLogin = document.getElementById('admin-login');
    const adminDashboard = document.getElementById('admin-dashboard');
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'block';
    
    // Attendre que le DOM soit mis à jour avant d'actualiser
    requestAnimationFrame(() => {
        try {
            actualiserDashboard();
        } catch (error) {
            console.error('❌ Erreur dans afficherDashboard:', error);
            isDisplayingDashboard = false;
            return;
        }
        
        // Réinitialiser les boutons du Centre de décisions après que le contenu soit chargé
        // Utiliser plusieurs tentatives pour s'assurer que le DOM est prêt
        setTimeout(() => {
            if (!initialiserCentreDecisions()) {
                // Si échec, réessayer après un délai plus long
                setTimeout(() => {
                    if (!initialiserCentreDecisions()) {
                        // Dernière tentative
                        setTimeout(() => {
                            initialiserCentreDecisions();
                        }, 500);
                    }
                }, 300);
            }
            
            // Réinitialiser aussi les onglets pour s'assurer qu'ils fonctionnent
            initialiserOnglets();
        }, 100);
    });
}

// ============================================
// GESTION DES ONGLETS
// ============================================

function initialiserOnglets() {
    // Retirer les anciens event listeners pour éviter les doublons
    const tabs = document.querySelectorAll('.admin-tab');
    
    if (tabs.length === 0) {
        return;
    }
    
    tabs.forEach((tab) => {
        // Retirer l'ancien listener s'il existe (en clonant l'élément)
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        // Ajouter le nouveau listener
        newTab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabName = this.dataset.tab;
            if (typeof window.adminSwitchTab === 'function') {
                window.adminSwitchTab(tabName);
            }
        });
    });
}


// ============================================
// TABLEAU DE BORD
// ============================================

function initialiserDashboard() {
    // NE PAS appeler actualiserDashboard() ici car elle est déjà appelée dans afficherDashboard()
    // Cela évite les appels multiples et les récursions
    
    // Bouton refresh
    const btnRefresh = document.getElementById('btn-refresh-vendeurs');
    if (btnRefresh) {
        // Retirer les anciens listeners pour éviter les doublons
        const newBtn = btnRefresh.cloneNode(true);
        btnRefresh.parentNode.replaceChild(newBtn, btnRefresh);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            actualiserDashboard();
        });
    }
    
    // Initialiser les boutons de décision après un court délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
        // initialiserBoutonsDecision() supprimé - remplacé par initialiserCentreDecisions()
    }, 200);
}

// Flag pour éviter les appels récursifs multiples
let isUpdatingDashboard = false;

function actualiserDashboard() {
    // Éviter les appels multiples simultanés
    if (isUpdatingDashboard) {
        return;
    }
    
    isUpdatingDashboard = true;
    
    try {
        // Statistiques vendeurs
        const tousVendeurs = chargerTousVendeursAdmin();
        const vendeursEnAttente = tousVendeurs.filter(v => v.statut === 'en_attente' || !v.statut);
        const vendeursValides = tousVendeurs.filter(v => v.statut === 'valide');
        
        const statVendeursTotaux = document.getElementById('stat-vendeurs-totaux');
        const statVendeursDetail = document.getElementById('stat-vendeurs-detail');
        const pendingVendeurs = document.getElementById('pending-vendeurs');
        
        if (statVendeursTotaux) statVendeursTotaux.textContent = tousVendeurs.length;
        if (statVendeursDetail) statVendeursDetail.textContent = 
            `${vendeursValides.length} validés, ${vendeursEnAttente.length} en attente`;
        if (pendingVendeurs) pendingVendeurs.textContent = vendeursEnAttente.length;
    
        // Statistiques partenaires
        const tousPartenaires = chargerTousPartenaires();
        const partenairesEnAttente = tousPartenaires.filter(p => p.statut === 'en_attente' || !p.statut);
        const partenairesValides = tousPartenaires.filter(p => p.statut === 'valide');
        
        const statPartenairesTotaux = document.getElementById('stat-partenaires-totaux');
        const statPartenairesDetail = document.getElementById('stat-partenaires-detail');
        const pendingPartenaires = document.getElementById('pending-partenaires');
        
        if (statPartenairesTotaux) statPartenairesTotaux.textContent = tousPartenaires.length;
        if (statPartenairesDetail) statPartenairesDetail.textContent = 
            `${partenairesValides.length} validés, ${partenairesEnAttente.length} en attente`;
        if (pendingPartenaires) pendingPartenaires.textContent = partenairesEnAttente.length;
    
        // Statistiques annonces
        const toutesAnnonces = chargerToutesAnnonces();
        const annoncesVideo = toutesAnnonces.filter(a => a.format === 'video');
        const annoncesAudio = toutesAnnonces.filter(a => a.format === 'audio');
        
        const statAnnoncesTotales = document.getElementById('stat-annonces-totales');
        const statAnnoncesDetail = document.getElementById('stat-annonces-detail');
        
        if (statAnnoncesTotales) statAnnoncesTotales.textContent = toutesAnnonces.length;
        if (statAnnoncesDetail) statAnnoncesDetail.textContent = 
            `${annoncesVideo.length} vidéos, ${annoncesAudio.length} audios`;
        
        // Statistiques campagnes
        const toutesCampagnes = chargerToutesCampagnes();
        const campagnesActives = toutesCampagnes.filter(c => c.statut === 'active');
        
        const statCampagnesActives = document.getElementById('stat-campagnes-actives');
        const statCampagnesDetail = document.getElementById('stat-campagnes-detail');
        
        if (statCampagnesActives) statCampagnesActives.textContent = campagnesActives.length;
        if (statCampagnesDetail) statCampagnesDetail.textContent = 
            `${toutesCampagnes.length} au total`;
    
    // KPI - État de la plateforme
    actualiserKPI(toutesAnnonces, tousVendeurs);
    
    // Centre de décisions
    actualiserCentreDecisions(vendeursEnAttente.length, partenairesEnAttente.length, toutesAnnonces, campagnesActives.length);
    
    // Annonces récentes
    afficherAnnoncesRecentes();
    
    // Historique
    afficherHistorique();
    } catch (error) {
        console.error('❌ Erreur dans actualiserDashboard:', error);
    } finally {
        isUpdatingDashboard = false;
    }
}

function actualiserKPI(toutesAnnonces, tousVendeurs) {
    // Vérifier que les éléments existent avant de les utiliser
    const kpiAnnoncesTotales = document.getElementById('kpi-annonces-totales');
    const kpiAnnoncesDetail = document.getElementById('kpi-annonces-detail');
    
    if (kpiAnnoncesTotales) kpiAnnoncesTotales.textContent = toutesAnnonces.length;
    if (kpiAnnoncesDetail) kpiAnnoncesDetail.textContent = 
        `${toutesAnnonces.filter(a => a.statut === 'publiee' || !a.statut).length} publiées`;
    
    // Annonces cette semaine
    const maintenant = new Date();
    const ilYASemaine = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000);
    const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    
    const annoncesSemaine = toutesAnnonces.filter(a => {
        if (!a.dateCreated) return false;
        const dateAnnonce = new Date(a.dateCreated);
        return dateAnnonce >= ilYASemaine;
    });
    
    const annoncesAujourdhui = toutesAnnonces.filter(a => {
        if (!a.dateCreated) return false;
        const dateAnnonce = new Date(a.dateCreated);
        return dateAnnonce >= aujourdhui;
    });
    
    const kpiAnnoncesSemaine = document.getElementById('kpi-annonces-semaine');
    const kpiAnnoncesAujourdhui = document.getElementById('kpi-annonces-aujourdhui');
    
    if (kpiAnnoncesSemaine) kpiAnnoncesSemaine.textContent = annoncesSemaine.length;
    if (kpiAnnoncesAujourdhui) kpiAnnoncesAujourdhui.textContent = `Aujourd'hui: ${annoncesAujourdhui.length}`;
    
    // Vendeurs actifs (avec au moins une annonce)
    const vendeursActifs = tousVendeurs.filter(v => {
        const nbAnnonces = compterAnnoncesVendeur(v);
        return nbAnnonces > 0;
    });
    const kpiVendeursActifs = document.getElementById('kpi-vendeurs-actifs');
    if (kpiVendeursActifs) kpiVendeursActifs.textContent = vendeursActifs.length;
    
    // Répartition vidéo/audio
    const annoncesVideo = toutesAnnonces.filter(a => a.format === 'video');
    const annoncesAudio = toutesAnnonces.filter(a => a.format === 'audio');
    const totalMedia = annoncesVideo.length + annoncesAudio.length;
    
    const kpiVideoAudio = document.getElementById('kpi-video-audio');
    const kpiVideoAudioDetail = document.getElementById('kpi-video-audio-detail');
    
    if (totalMedia > 0) {
        const pctVideo = Math.round((annoncesVideo.length / totalMedia) * 100);
        const pctAudio = Math.round((annoncesAudio.length / totalMedia) * 100);
        if (kpiVideoAudio) kpiVideoAudio.textContent = `${pctVideo}% / ${pctAudio}%`;
        if (kpiVideoAudioDetail) kpiVideoAudioDetail.textContent = 
            `📹 ${annoncesVideo.length} vidéos • 🎙️ ${annoncesAudio.length} audios`;
    } else {
        if (kpiVideoAudio) kpiVideoAudio.textContent = '0% / 0%';
        if (kpiVideoAudioDetail) kpiVideoAudioDetail.textContent = 'Aucune annonce média';
    }
    
    // Zones les plus actives
    const zonesCompteur = {};
    toutesAnnonces.forEach(annonce => {
        if (annonce.location) {
            zonesCompteur[annonce.location] = (zonesCompteur[annonce.location] || 0) + 1;
        }
    });
    
    const zonesTriees = Object.entries(zonesCompteur)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    
    const containerZones = document.getElementById('kpi-zones-actives');
    if (containerZones) {
        if (zonesTriees.length > 0) {
            containerZones.innerHTML = zonesTriees.map(([zone, count], index) => `
                <div class="kpi-zone-item">
                    <span class="kpi-zone-rank">${index + 1}.</span>
                    <span class="kpi-zone-name">${zone}</span>
                    <span class="kpi-zone-count">${count} annonce${count > 1 ? 's' : ''}</span>
                </div>
            `).join('');
        } else {
            containerZones.innerHTML = '<p class="kpi-detail">Aucune zone active</p>';
        }
    }
}

function actualiserCentreDecisions(nbVendeursPending, nbPartenairesPending, toutesAnnonces, nbCampagnesActive) {
    // Compter les annonces en attente de modération
    const annoncesEnAttente = toutesAnnonces.filter(a => 
        !a.statut || a.statut === 'en_attente' || a.statut === 'pending'
    );
    
    const decisionVendeursPending = document.getElementById('decision-vendeurs-pending');
    const decisionPartenairesPending = document.getElementById('decision-partenaires-pending');
    const decisionAnnoncesPending = document.getElementById('decision-annonces-pending');
    const decisionCampagnesActive = document.getElementById('decision-campagnes-active');
    
    if (decisionVendeursPending) decisionVendeursPending.textContent = nbVendeursPending;
    if (decisionPartenairesPending) decisionPartenairesPending.textContent = nbPartenairesPending;
    if (decisionAnnoncesPending) decisionAnnoncesPending.textContent = annoncesEnAttente.length;
    if (decisionCampagnesActive) decisionCampagnesActive.textContent = nbCampagnesActive;
    
    // Mettre à jour l'état des boutons (désactiver si compteur = 0)
    if (typeof actualiserEtatBoutonsDecisions === 'function') {
        actualiserEtatBoutonsDecisions();
    }
}

function afficherAnnoncesRecentes() {
    const toutesAnnonces = chargerToutesAnnonces();
    const recentes = toutesAnnonces
        .sort((a, b) => {
            const dateA = a.dateCreated ? new Date(a.dateCreated) : new Date(0);
            const dateB = b.dateCreated ? new Date(b.dateCreated) : new Date(0);
            return dateB - dateA;
        })
        .slice(0, 5);
    
    const container = document.getElementById('admin-recent-annonces');
    if (!container) return;
    
    if (recentes.length === 0) {
        container.innerHTML = '<p>Aucune annonce récente.</p>';
        return;
    }
    
    container.innerHTML = recentes.map(annonce => `
        <div class="admin-recent-item">
            <div class="admin-recent-info">
                <strong>${annonce.product || 'Sans catégorie'}</strong>
                <span class="admin-recent-format">${annonce.format === 'video' ? '📹' : '🎙️'}</span>
                <span class="admin-recent-location">${annonce.location || 'Non spécifié'}</span>
            </div>
            <div class="admin-recent-date">
                ${annonce.dateCreated ? new Date(annonce.dateCreated).toLocaleDateString('fr-FR') : 'Date inconnue'}
            </div>
        </div>
    `).join('');
}

// ============================================
// GESTION DES VENDEURS
// ============================================

function initialiserGestionVendeurs() {
    actualiserListeVendeurs();
    
    // Filtres
    document.getElementById('filter-vendeurs-search')?.addEventListener('input', filtrerVendeurs);
    document.getElementById('filter-vendeurs-statut')?.addEventListener('change', filtrerVendeurs);
    document.getElementById('filter-vendeurs-zone')?.addEventListener('change', filtrerVendeurs);
    
    // Bouton refresh
    document.getElementById('btn-refresh-vendeurs')?.addEventListener('click', function() {
        actualiserListeVendeurs();
    });
    
    // Charger les zones pour le filtre
    chargerZonesPourFiltre('filter-vendeurs-zone');
}

function actualiserListeVendeurs(filterStatut = null) {
    const tousVendeurs = chargerTousVendeursAdmin();
    let vendeursAffiches = [...tousVendeurs];
    
    // Appliquer le filtre de statut si fourni
    if (filterStatut) {
        vendeursAffiches = vendeursAffiches.filter(v => 
            (filterStatut === 'en_attente' && (!v.statut || v.statut === 'en_attente')) ||
            (filterStatut !== 'en_attente' && v.statut === filterStatut)
        );
    }
    
    afficherListeVendeursAdmin(vendeursAffiches);
}

function filtrerVendeurs() {
    const searchInput = document.getElementById('filter-vendeurs-search');
    const statutSelect = document.getElementById('filter-vendeurs-statut');
    const zoneSelect = document.getElementById('filter-vendeurs-zone');
    
    if (!searchInput || !statutSelect || !zoneSelect) {
        // Éléments de filtre vendeurs non trouvés
        return;
    }
    
    const search = searchInput.value.toLowerCase();
    const statut = statutSelect.value;
    const zone = zoneSelect.value;
    
    const tousVendeurs = chargerTousVendeursAdmin();
    let filtres = tousVendeurs.filter(vendeur => {
        const matchSearch = !search || 
            (vendeur.nom && vendeur.nom.toLowerCase().includes(search)) ||
            (vendeur.description && vendeur.description.toLowerCase().includes(search));
        
        const matchStatut = !statut || 
            (statut === 'en_attente' && (!vendeur.statut || vendeur.statut === 'en_attente')) ||
            (statut !== 'en_attente' && vendeur.statut === statut);
        
        const matchZone = !zone || vendeur.zone === zone;
        
        return matchSearch && matchStatut && matchZone;
    });
    
    afficherListeVendeursAdmin(filtres);
}

function afficherListeVendeursAdmin(vendeurs) {
    const container = document.getElementById('admin-vendeurs-list');
    if (!container) return;
    
    if (vendeurs.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucun vendeur trouvé.</p>';
        return;
    }
    
    container.innerHTML = vendeurs.map(vendeur => {
        const statut = vendeur.statut || 'en_attente';
        const nbAnnonces = compterAnnoncesVendeur(vendeur);
        const statutClass = statut === 'valide' ? 'success' : statut === 'suspendu' || statut === 'refuse' ? 'danger' : 'warning';
        const statutLabel = getStatutLabel(statut);
        
        // Déterminer les catégories de produits
        const categories = extraireCategoriesVendeur(vendeur);
        
        return `
            <div class="admin-item-card admin-vendeur-card">
                <div class="admin-item-header">
                    <div class="admin-item-title-group">
                        <h3>${vendeur.nom || 'Sans nom'}</h3>
                        <span class="admin-badge admin-badge-vendeur">👤 Vendeur</span>
                    </div>
                    <span class="admin-badge admin-badge-${statutClass}">${statutLabel}</span>
                </div>
                <div class="admin-item-body">
                    <p><strong>Description:</strong> ${vendeur.description || 'Aucune'}</p>
                    <p><strong>📍 Zone géographique:</strong> ${vendeur.zone || 'Non spécifiée'}</p>
                    <p><strong>📞 Téléphone:</strong> ${vendeur.telephone || 'Non spécifié'}</p>
                    ${categories.length > 0 ? `<p><strong>🏷️ Catégories:</strong> ${categories.join(', ')}</p>` : ''}
                    <p><strong>📢 Annonces:</strong> ${nbAnnonces} annonce${nbAnnonces > 1 ? 's' : ''}</p>
                </div>
                <div class="admin-item-actions">
                    ${statut === 'en_attente' || !statut ? `
                        <button class="btn btn-success btn-action" onclick="validerVendeur(${vendeur.id})" title="Valider ce vendeur">
                            <span class="btn-icon">✓</span> Valider
                        </button>
                        <button class="btn btn-danger btn-action" onclick="refuserVendeur(${vendeur.id})" title="Refuser ce vendeur">
                            <span class="btn-icon">✗</span> Refuser
                        </button>
                    ` : ''}
                    ${statut === 'valide' ? `
                        <button class="btn btn-warning btn-action" onclick="suspendreVendeur(${vendeur.id})" title="Suspendre ce vendeur">
                            <span class="btn-icon">⏸</span> Suspendre
                        </button>
                    ` : ''}
                    ${statut === 'suspendu' ? `
                        <button class="btn btn-success btn-action" onclick="validerVendeur(${vendeur.id})" title="Réactiver ce vendeur">
                            <span class="btn-icon">✓</span> Réactiver
                        </button>
                    ` : ''}
                    <a href="vendeur-profil.html?id=${vendeur.id}" class="btn btn-info btn-action" target="_blank" title="Voir le profil complet">
                        <span class="btn-icon">👁</span> Prévisualiser
                    </a>
                    <button class="btn btn-danger btn-action" onclick="supprimerVendeur(${vendeur.id})" title="Supprimer ce vendeur">
                        <span class="btn-icon">🗑</span> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function extraireCategoriesVendeur(vendeur) {
    const categories = new Set();
    
    // Extraire depuis les produits
    if (vendeur.produits && Array.isArray(vendeur.produits)) {
        vendeur.produits.forEach(produit => {
            if (produit.nom) {
                // Essayer d'extraire la catégorie du nom
                const nomLower = produit.nom.toLowerCase();
                if (nomLower.includes('tomate') || nomLower.includes('carotte') || nomLower.includes('légume')) {
                    categories.add('Légumes');
                } else if (nomLower.includes('mangue') || nomLower.includes('ananas') || nomLower.includes('fruit')) {
                    categories.add('Fruits');
                } else if (nomLower.includes('riz') || nomLower.includes('mil') || nomLower.includes('céréale')) {
                    categories.add('Céréales');
                }
            }
        });
    }
    
    // Extraire depuis les annonces
    const annonces = lireLocalStorage('annonces_locales', []);
    const contactVendeur = vendeur.telephone || vendeur.contact || '';
    annonces.forEach(annonce => {
        const contactAnnonce = annonce.contact || '';
        if (contactAnnonce.replace(/\s/g, '') === contactVendeur.replace(/\s/g, '') && annonce.product) {
            categories.add(annonce.product);
        }
    });
    
    return Array.from(categories);
}

/**
 * Fonction pour créer et envoyer un message de bienvenue à un vendeur validé
 * Le message contient l'identifiant et le mot de passe (si disponible)
 */
function creerMessageBienvenue(vendeurId, vendeur) {
    const nomVendeur = vendeur.nom || `Vendeur #${vendeurId}`;
    const motDePasse = vendeur.password || vendeur.motDePasse || 'Non défini';
    
    // Construire le contenu du message
    let contenu = `Félicitations ${nomVendeur} !\n\n`;
    contenu += `Votre inscription sur la plateforme Teranga Bio Sénégal a été validée avec succès.\n\n`;
    contenu += `**Vos identifiants de connexion :**\n`;
    contenu += `• Identifiant vendeur : ${vendeurId}\n`;
    contenu += `• Mot de passe : ${motDePasse}\n\n`;
    contenu += `Conservez précieusement ces identifiants, ils vous seront utiles pour accéder à votre espace vendeur et gérer vos produits.\n\n`;
    contenu += `Vous pouvez dès maintenant :\n`;
    contenu += `• Ajouter vos produits bio sur la plateforme\n`;
    contenu += `• Gérer vos annonces\n`;
    contenu += `• Consulter vos messages\n\n`;
    contenu += `Bienvenue dans la communauté Teranga Bio ! 🌱`;
    
    const message = {
        id: Date.now(),
        type: 'bienvenue',
        titre: 'Bienvenue sur Teranga Bio Sénégal !',
        contenu: contenu,
        dateCreation: new Date().toISOString(),
        lu: false
    };
    
    // Stocker le message dans localStorage avec la clé messages_vendeur_{id}
    const messages = lireLocalStorage(`messages_vendeur_${vendeurId}`, []);
    messages.push(message);
    ecrireLocalStorage(`messages_vendeur_${vendeurId}`, messages);
    
    return message;
}

function validerVendeur(id) {
    const vendeurs = lireLocalStorage('vendeurs_inscrits', []);
    const vendeur = vendeurs.find(v => v.id === id);
    if (vendeur) {
        vendeur.statut = 'valide';
        vendeur.dateValidation = new Date().toISOString();
        ecrireLocalStorage('vendeurs_inscrits', vendeurs);
        enregistrerActionAdmin('vendeur', 'validé', vendeur.nom || `Vendeur #${id}`);
        
        // Créer et envoyer le message de bienvenue avec l'identifiant
        creerMessageBienvenue(id, vendeur);
        
        afficherMessage('message-vendeurs', 'Vendeur validé avec succès. Un message de bienvenue avec son identifiant a été envoyé.', 'success');
        actualiserListeVendeurs();
        actualiserDashboard();
    }
}

function refuserVendeur(id) {
    if (!confirm('Êtes-vous sûr de vouloir refuser ce vendeur ?')) {
        return;
    }
    
    const vendeurs = lireLocalStorage('vendeurs_inscrits', []);
    const vendeur = vendeurs.find(v => v.id === id);
    if (vendeur) {
        vendeur.statut = 'refuse';
        vendeur.dateRefus = new Date().toISOString();
        ecrireLocalStorage('vendeurs_inscrits', vendeurs);
        enregistrerActionAdmin('vendeur', 'refusé', vendeur.nom || `Vendeur #${id}`);
        afficherMessage('message-vendeurs', 'Vendeur refusé.', 'warning');
        actualiserListeVendeurs();
        actualiserDashboard();
    }
}

function suspendreVendeur(id) {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce vendeur ?')) {
        return;
    }
    
    const vendeurs = lireLocalStorage('vendeurs_inscrits', []);
    const vendeur = vendeurs.find(v => v.id === id);
    if (vendeur) {
        vendeur.statut = 'suspendu';
        vendeur.dateSuspension = new Date().toISOString();
        ecrireLocalStorage('vendeurs_inscrits', vendeurs);
        enregistrerActionAdmin('vendeur', 'suspendu', vendeur.nom || `Vendeur #${id}`);
        afficherMessage('message-vendeurs', 'Vendeur suspendu.', 'warning');
        actualiserListeVendeurs();
        actualiserDashboard();
    }
}

function supprimerVendeur(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ? Cette action est irréversible.')) {
        return;
    }
    
    const vendeurs = lireLocalStorage('vendeurs_inscrits', []);
    const vendeur = vendeurs.find(v => v.id === id);
    const filtres = vendeurs.filter(v => v.id !== id);
    ecrireLocalStorage('vendeurs_inscrits', filtres);
    if (vendeur) {
        enregistrerActionAdmin('vendeur', 'supprimé', vendeur.nom || `Vendeur #${id}`);
    }
    afficherMessage('message-vendeurs', 'Vendeur supprimé.', 'success');
    actualiserListeVendeurs();
    actualiserDashboard();
}

// ============================================
// GESTION DES PARTENAIRES
// ============================================

function initialiserGestionPartenaires() {
    actualiserListePartenaires();
    
    // Filtres
    document.getElementById('filter-partenaires-search')?.addEventListener('input', filtrerPartenaires);
    document.getElementById('filter-partenaires-statut')?.addEventListener('change', filtrerPartenaires);
    document.getElementById('filter-partenaires-type')?.addEventListener('change', filtrerPartenaires);
    
    // Bouton refresh
    document.getElementById('btn-refresh-partenaires')?.addEventListener('click', function() {
        actualiserListePartenaires();
    });
}

function actualiserListePartenaires(filterStatut = null) {
    const tousPartenaires = chargerTousPartenaires();
    let partenairesAffiches = [...tousPartenaires];
    
    if (filterStatut) {
        partenairesAffiches = partenairesAffiches.filter(p => 
            (filterStatut === 'en_attente' && (!p.statut || p.statut === 'en_attente')) ||
            (filterStatut !== 'en_attente' && p.statut === filterStatut)
        );
    }
    
    afficherListePartenairesAdmin(partenairesAffiches);
}

function filtrerPartenaires() {
    const searchInput = document.getElementById('filter-partenaires-search');
    const statutSelect = document.getElementById('filter-partenaires-statut');
    const typeSelect = document.getElementById('filter-partenaires-type');
    
    if (!searchInput || !statutSelect || !typeSelect) {
        // Éléments de filtre partenaires non trouvés
        return;
    }
    
    const search = searchInput.value.toLowerCase();
    const statut = statutSelect.value;
    const type = typeSelect.value;
    
    const tousPartenaires = chargerTousPartenaires();
    let filtres = tousPartenaires.filter(partenaire => {
        const matchSearch = !search || 
            (partenaire.nomStructure && partenaire.nomStructure.toLowerCase().includes(search)) ||
            (partenaire.description && partenaire.description.toLowerCase().includes(search));
        
        const matchStatut = !statut || 
            (statut === 'en_attente' && (!partenaire.statut || partenaire.statut === 'en_attente')) ||
            (statut !== 'en_attente' && partenaire.statut === statut);
        
        const matchType = !type || partenaire.typePartenaire === type;
        
        return matchSearch && matchStatut && matchType;
    });
    
    afficherListePartenairesAdmin(filtres);
}

function afficherListePartenairesAdmin(partenaires) {
    const container = document.getElementById('admin-partenaires-list');
    if (!container) return;
    
    if (partenaires.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucun partenaire trouvé.</p>';
        return;
    }
    
    container.innerHTML = partenaires.map(partenaire => {
        const statut = partenaire.statut || 'en_attente';
        const statutClass = statut === 'valide' ? 'success' : statut === 'suspendu' || statut === 'refuse' ? 'danger' : 'warning';
        const statutLabel = getStatutLabel(statut);
        
        // Compter les campagnes du partenaire
        const campagnes = chargerToutesCampagnes();
        const nbCampagnes = campagnes.filter(c => c.porteur === partenaire.nomStructure || c.porteurId === partenaire.id).length;
        
        return `
            <div class="admin-item-card admin-partenaire-card">
                <div class="admin-item-header">
                    <div class="admin-item-title-group">
                        <h3>${partenaire.nomStructure || 'Sans nom'}</h3>
                        <span class="admin-badge admin-badge-partenaire">🤝 Partenaire</span>
                    </div>
                    <span class="admin-badge admin-badge-${statutClass}">${statutLabel}</span>
                </div>
                <div class="admin-item-body">
                    <p><strong>🏢 Type de partenaire:</strong> ${partenaire.typePartenaire || 'Non spécifié'}</p>
                    <p><strong>📍 Zone:</strong> ${partenaire.zone || 'Non spécifiée'}</p>
                    <p><strong>📞 Contact:</strong> ${partenaire.contact || 'Non spécifié'}</p>
                    <p><strong>📝 Description:</strong> ${partenaire.description || 'Aucune'}</p>
                    <p><strong>⭐ Campagnes:</strong> ${nbCampagnes} campagne${nbCampagnes > 1 ? 's' : ''}</p>
                </div>
                <div class="admin-item-actions">
                    ${statut === 'en_attente' || !statut ? `
                        <button class="btn btn-success btn-action" onclick="validerPartenaire(${partenaire.id})" title="Valider ce partenaire">
                            <span class="btn-icon">✓</span> Valider
                        </button>
                        <button class="btn btn-danger btn-action" onclick="refuserPartenaire(${partenaire.id})" title="Refuser ce partenaire">
                            <span class="btn-icon">✗</span> Refuser
                        </button>
                    ` : ''}
                    ${statut === 'valide' ? `
                        <button class="btn btn-warning btn-action" onclick="suspendrePartenaire(${partenaire.id})" title="Suspendre ce partenaire">
                            <span class="btn-icon">⏸</span> Suspendre
                        </button>
                    ` : ''}
                    ${statut === 'suspendu' ? `
                        <button class="btn btn-success btn-action" onclick="validerPartenaire(${partenaire.id})" title="Réactiver ce partenaire">
                            <span class="btn-icon">✓</span> Réactiver
                        </button>
                    ` : ''}
                    <button class="btn btn-info btn-action" onclick="voirCampagnesPartenaire(${partenaire.id})" title="Voir les campagnes">
                        <span class="btn-icon">⭐</span> Voir campagnes
                    </button>
                    <button class="btn btn-danger btn-action" onclick="supprimerPartenaire(${partenaire.id})" title="Supprimer ce partenaire">
                        <span class="btn-icon">🗑</span> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function voirCampagnesPartenaire(partenaireId) {
    const partenaires = chargerTousPartenaires();
    const partenaire = partenaires.find(p => p.id === partenaireId);
    if (!partenaire) return;
    
    adminSwitchTab('campagnes');
    // Filtrer les campagnes par partenaire (à implémenter si nécessaire)
    setTimeout(() => {
        const searchInput = document.getElementById('filter-campagnes-search');
        if (searchInput) {
            searchInput.value = partenaire.nomStructure;
            // Déclencher le filtre si la fonction existe
        }
    }, 100);
}

function validerPartenaire(id) {
    const partenaires = lireLocalStorage('demandesPartenaires', []);
    const partenaire = partenaires.find(p => p.id === id);
    if (partenaire) {
        partenaire.statut = 'valide';
        partenaire.dateValidation = new Date().toISOString();
        ecrireLocalStorage('demandesPartenaires', partenaires);
        enregistrerActionAdmin('partenaire', 'validé', partenaire.nomStructure || `Partenaire #${id}`);
        afficherMessage('message-partenaires', 'Partenaire validé avec succès.', 'success');
        actualiserListePartenaires();
        actualiserDashboard();
    }
}

function refuserPartenaire(id) {
    if (!confirm('Êtes-vous sûr de vouloir refuser ce partenaire ?')) {
        return;
    }
    
    const partenaires = lireLocalStorage('demandesPartenaires', []);
    const partenaire = partenaires.find(p => p.id === id);
    if (partenaire) {
        partenaire.statut = 'refuse';
        partenaire.dateRefus = new Date().toISOString();
        ecrireLocalStorage('demandesPartenaires', partenaires);
        enregistrerActionAdmin('partenaire', 'refusé', partenaire.nomStructure || `Partenaire #${id}`);
        afficherMessage('message-partenaires', 'Partenaire refusé.', 'warning');
        actualiserListePartenaires();
        actualiserDashboard();
    }
}

function suspendrePartenaire(id) {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce partenaire ?')) {
        return;
    }
    
    const partenaires = lireLocalStorage('demandesPartenaires', []);
    const partenaire = partenaires.find(p => p.id === id);
    if (partenaire) {
        partenaire.statut = 'suspendu';
        partenaire.dateSuspension = new Date().toISOString();
        ecrireLocalStorage('demandesPartenaires', partenaires);
        enregistrerActionAdmin('partenaire', 'suspendu', partenaire.nomStructure || `Partenaire #${id}`);
        afficherMessage('message-partenaires', 'Partenaire suspendu.', 'warning');
        actualiserListePartenaires();
        actualiserDashboard();
    }
}

function supprimerPartenaire(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ? Cette action est irréversible.')) {
        return;
    }
    
    const partenaires = lireLocalStorage('demandesPartenaires', []);
    const partenaire = partenaires.find(p => p.id === id);
    const filtres = partenaires.filter(p => p.id !== id);
    ecrireLocalStorage('demandesPartenaires', filtres);
    if (partenaire) {
        enregistrerActionAdmin('partenaire', 'supprimé', partenaire.nomStructure || `Partenaire #${id}`);
    }
    afficherMessage('message-partenaires', 'Partenaire supprimé.', 'success');
    actualiserListePartenaires();
    actualiserDashboard();
}

// ============================================
// GESTION DES ANNONCES
// ============================================

function initialiserGestionAnnonces() {
    actualiserListeAnnonces();
    
    // Filtres
    document.getElementById('filter-annonces-search')?.addEventListener('input', filtrerAnnonces);
    document.getElementById('filter-annonces-format')?.addEventListener('change', filtrerAnnonces);
    document.getElementById('filter-annonces-origine')?.addEventListener('change', filtrerAnnonces);
    document.getElementById('filter-annonces-statut')?.addEventListener('change', filtrerAnnonces);
    document.getElementById('filter-annonces-categorie')?.addEventListener('change', filtrerAnnonces);
    document.getElementById('filter-annonces-zone')?.addEventListener('change', filtrerAnnonces);
    
    // Bouton refresh
    document.getElementById('btn-refresh-annonces')?.addEventListener('click', function() {
        actualiserListeAnnonces();
    });
    
    // Charger les catégories et zones pour les filtres
    chargerCategoriesPourFiltre('filter-annonces-categorie');
    chargerZonesPourFiltre('filter-annonces-zone');
}

function actualiserListeAnnonces() {
    const toutesAnnonces = chargerToutesAnnonces();
    afficherListeAnnoncesAdmin(toutesAnnonces);
}

function filtrerAnnonces() {
    const searchInput = document.getElementById('filter-annonces-search');
    const formatSelect = document.getElementById('filter-annonces-format');
    const origineSelect = document.getElementById('filter-annonces-origine');
    const categorieSelect = document.getElementById('filter-annonces-categorie');
    const statutSelect = document.getElementById('filter-annonces-statut');
    const zoneSelect = document.getElementById('filter-annonces-zone');
    
    if (!searchInput || !formatSelect || !origineSelect || !categorieSelect) {
        // Éléments de filtre annonces non trouvés
        return;
    }
    
    const search = searchInput.value.toLowerCase();
    const format = formatSelect.value;
    const origine = origineSelect.value;
    const categorie = categorieSelect.value;
    const statut = statutSelect?.value || '';
    const zone = zoneSelect?.value || '';
    
    const toutesAnnonces = chargerToutesAnnonces();
    let filtres = toutesAnnonces.filter(annonce => {
        const matchSearch = !search || 
            (annonce.product && annonce.product.toLowerCase().includes(search)) ||
            (annonce.location && annonce.location.toLowerCase().includes(search)) ||
            (annonce.contact && annonce.contact.toLowerCase().includes(search));
        
        const matchFormat = !format || annonce.format === format;
        const matchCategorie = !categorie || annonce.product === categorie;
        const matchZone = !zone || annonce.location === zone;
        
        // Déterminer l'origine (vendeur ou partenaire)
        const estPartenaire = annonce.isSponsored || false;
        const matchOrigine = !origine || 
            (origine === 'partenaire' && estPartenaire) ||
            (origine === 'vendeur' && !estPartenaire);
        
        // Filtrer par statut
        const annonceStatut = annonce.statut || 'en_attente';
        const matchStatut = !statut || 
            (statut === 'en_attente' && (annonceStatut === 'en_attente' || annonceStatut === 'pending' || !annonce.statut)) ||
            (statut === 'refusee' && (annonceStatut === 'refusee' || annonceStatut === 'refused')) ||
            (statut !== 'en_attente' && statut !== 'refusee' && annonceStatut === statut);
        
        return matchSearch && matchFormat && matchOrigine && matchCategorie && matchStatut && matchZone;
    });
    
    afficherListeAnnoncesAdmin(filtres);
}

function afficherListeAnnoncesAdmin(annonces) {
    const container = document.getElementById('admin-annonces-list');
    if (!container) return;
    
    if (annonces.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucune annonce trouvée.</p>';
        return;
    }
    
    container.innerHTML = annonces.map(annonce => {
        const formatIcon = annonce.format === 'video' ? '📹' : '🎙️';
        const isPartenaire = annonce.isSponsored || false;
        
        return `
            <div class="admin-annonce-card">
                <div class="admin-annonce-header">
                    <h4>${annonce.product || 'Sans catégorie'}</h4>
                    <span class="admin-annonce-format">${formatIcon}</span>
                    ${isPartenaire ? '<span class="admin-badge admin-badge-info">Partenaire</span>' : ''}
                </div>
                <div class="admin-annonce-body">
                    <p><strong>Lieu:</strong> ${annonce.location || 'Non spécifié'}</p>
                    <p><strong>Contact:</strong> ${annonce.contact || 'Non spécifié'}</p>
                    <p><strong>Date:</strong> ${annonce.dateCreated ? new Date(annonce.dateCreated).toLocaleDateString('fr-FR') : 'Inconnue'}</p>
                    ${annonce.mediaUrl ? `
                        <div class="admin-annonce-media">
                            ${annonce.format === 'video' ? 
                                `<video src="${annonce.mediaUrl}" controls style="max-width: 100%; max-height: 200px;"></video>` :
                                `<audio src="${annonce.mediaUrl}" controls style="width: 100%;"></audio>`
                            }
                        </div>
                    ` : ''}
                </div>
                <div class="admin-annonce-actions">
                    ${!annonce.isSponsored ? `<button class="btn btn-info" onclick="marquerAnnoncePartenaire(${annonce.id})">⭐ Marquer partenaire</button>` : ''}
                    ${!annonce.isFeatured ? `<button class="btn btn-warning" onclick="marquerAnnonceFeatured(${annonce.id})">⭐ Mettre en avant</button>` : ''}
                    <button class="btn btn-danger" onclick="supprimerAnnonce(${annonce.id})">🗑 Supprimer</button>
                </div>
            </div>
        `;
    }).join('');
}

function marquerAnnoncePartenaire(id) {
    const annonces = lireLocalStorage('annonces_locales', []);
    const annonce = annonces.find(a => a.id === id);
    if (annonce) {
        annonce.isSponsored = true;
        ecrireLocalStorage('annonces_locales', annonces);
        enregistrerActionAdmin('annonce', 'marquée partenaire', annonce.product || `Annonce #${id}`);
        afficherMessage('message-annonces', 'Annonce marquée comme partenaire.', 'success');
        actualiserListeAnnonces();
    }
}

function marquerAnnonceFeatured(id) {
    const annonces = lireLocalStorage('annonces_locales', []);
    const annonce = annonces.find(a => a.id === id);
    if (annonce) {
        annonce.isFeatured = true;
        ecrireLocalStorage('annonces_locales', annonces);
        enregistrerActionAdmin('annonce', 'mise en avant', annonce.product || `Annonce #${id}`);
        afficherMessage('message-annonces', 'Annonce mise en avant.', 'success');
        actualiserListeAnnonces();
    }
}

function supprimerAnnonce(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
        return;
    }
    
    const annonces = lireLocalStorage('annonces_locales', []);
    const annonce = annonces.find(a => a.id === id);
    const filtres = annonces.filter(a => a.id !== id);
    ecrireLocalStorage('annonces_locales', filtres);
    if (annonce) {
        enregistrerActionAdmin('annonce', 'supprimée', annonce.product || `Annonce #${id}`);
    }
    afficherMessage('message-annonces', 'Annonce supprimée.', 'success');
    actualiserListeAnnonces();
    actualiserDashboard();
}

// ============================================
// GESTION DES CAMPAGNES
// ============================================

function initialiserGestionCampagnes() {
    actualiserListeCampagnes();
    
    // Filtres
    document.getElementById('filter-campagnes-search')?.addEventListener('input', filtrerCampagnes);
    document.getElementById('filter-campagnes-statut')?.addEventListener('change', filtrerCampagnes);
    
    // Bouton refresh
    document.getElementById('btn-refresh-campagnes')?.addEventListener('click', function() {
        actualiserListeCampagnes();
    });
}

function filtrerCampagnes() {
    const searchInput = document.getElementById('filter-campagnes-search');
    const statutSelect = document.getElementById('filter-campagnes-statut');
    
    if (!searchInput || !statutSelect) {
        // Éléments de filtre campagnes non trouvés
        return;
    }
    
    const search = searchInput.value.toLowerCase();
    const statut = statutSelect.value;
    
    const toutesCampagnes = chargerToutesCampagnes();
    let filtres = toutesCampagnes.filter(campagne => {
        const matchSearch = !search || 
            (campagne.titre && campagne.titre.toLowerCase().includes(search)) ||
            (campagne.porteur && campagne.porteur.toLowerCase().includes(search)) ||
            (campagne.description && campagne.description.toLowerCase().includes(search));
        
        const matchStatut = !statut || 
            (statut === 'active' && campagne.statut === 'active') ||
            (statut === 'inactive' && campagne.statut === 'inactive') ||
            (statut === 'expiree' && (campagne.statut === 'expiree' || getStatutCampagneLabel(campagne) === 'Expirée')) ||
            (statut === 'programmee' && campagne.statut === 'programmee');
        
        return matchSearch && matchStatut;
    });
    
    afficherListeCampagnesAdmin(filtres);
}

function actualiserListeCampagnes() {
    const toutesCampagnes = chargerToutesCampagnes();
    afficherListeCampagnesAdmin(toutesCampagnes);
}

function afficherListeCampagnesAdmin(campagnes) {
    const container = document.getElementById('admin-campagnes-list');
    if (!container) return;
    
    if (campagnes.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucune campagne trouvée.</p>';
        return;
    }
    
    container.innerHTML = campagnes.map(campagne => {
        const statutClass = campagne.statut === 'active' ? 'success' : campagne.statut === 'expiree' ? 'danger' : 'warning';
        const statutLabel = getStatutCampagneLabel(campagne);
        const emplacements = getEmplacementsCampagne(campagne);
        
        return `
            <div class="admin-item-card">
                <div class="admin-item-header">
                    <h3>${campagne.titre || 'Sans titre'}</h3>
                    <span class="admin-badge admin-badge-${statutClass}">${statutLabel}</span>
                </div>
                <div class="admin-item-body">
                    <p><strong>Description:</strong> ${campagne.description || 'Aucune'}</p>
                    <p><strong>🏢 Porteur:</strong> ${campagne.porteur || 'Non spécifié'}</p>
                    <p><strong>📍 Zone:</strong> ${campagne.zone_geographique || 'Non spécifiée'}</p>
                    <p><strong>🎯 Type:</strong> ${campagne.type_campagne || 'Non spécifié'}</p>
                    <p><strong>📅 Dates:</strong> ${campagne.date_debut || 'N/A'} - ${campagne.date_fin || 'N/A'}</p>
                    <p class="admin-campagne-emplacements"><strong>👁️ Campagne visible sur:</strong> ${emplacements}</p>
                </div>
                <div class="admin-item-actions">
                    ${campagne.statut !== 'active' ? `
                        <button class="btn btn-success btn-action" onclick="activerCampagne(${campagne.id})" title="Activer cette campagne">
                            <span class="btn-icon">✓</span> Activer
                        </button>
                    ` : ''}
                    ${campagne.statut === 'active' ? `
                        <button class="btn btn-warning btn-action" onclick="desactiverCampagne(${campagne.id})" title="Désactiver cette campagne">
                            <span class="btn-icon">⏸</span> Désactiver
                        </button>
                    ` : ''}
                    <button class="btn btn-info btn-action" onclick="modifierEmplacementsCampagne(${campagne.id})" title="Modifier les emplacements d'affichage">
                        <span class="btn-icon">📍</span> Modifier emplacements
                    </button>
                    <button class="btn btn-danger btn-action" onclick="supprimerCampagne(${campagne.id})" title="Supprimer cette campagne">
                        <span class="btn-icon">🗑</span> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getStatutCampagneLabel(campagne) {
    if (campagne.statut === 'active') {
        const now = new Date();
        const dateFin = campagne.date_fin ? new Date(campagne.date_fin) : null;
        if (dateFin && now > dateFin) {
            return 'Expirée';
        }
        return 'Active';
    }
    if (campagne.statut === 'expiree') {
        return 'Expirée';
    }
    if (campagne.statut === 'programmee') {
        return 'Programmée';
    }
    return 'Inactive';
}

function getEmplacementsCampagne(campagne) {
    const emplacements = [];
    if (campagne.visible_accueil) emplacements.push('Page d\'accueil');
    if (campagne.visible_annonces) emplacements.push('Page annonces');
    if (campagne.visible_opportunites) emplacements.push('Page opportunités');
    if (campagne.visible_categories) emplacements.push('Page catégories');
    
    return emplacements.length > 0 ? emplacements.join(', ') : 'Aucun emplacement défini';
}

function modifierEmplacementsCampagne(id) {
    const campagnes = chargerToutesCampagnes();
    const campagne = campagnes.find(c => c.id === id);
    if (!campagne) return;
    
    const accueil = confirm('Afficher sur la page d\'accueil ?');
    const annonces = confirm('Afficher sur la page annonces ?');
    const opportunites = confirm('Afficher sur la page opportunités ?');
    const categories = confirm('Afficher sur la page catégories ?');
    
    campagne.visible_accueil = accueil;
    campagne.visible_annonces = annonces;
    campagne.visible_opportunites = opportunites;
    campagne.visible_categories = categories;
    
    sauvegarderCampagnes(campagnes);
    enregistrerActionAdmin('campagne', 'emplacements modifiés', campagne.titre || `Campagne #${id}`);
    afficherMessage('message-campagnes', 'Emplacements de la campagne mis à jour.', 'success');
    actualiserListeCampagnes();
}

function activerCampagne(id) {
    const campagnes = chargerToutesCampagnes();
    const campagne = campagnes.find(c => c.id === id);
    if (campagne) {
        campagne.statut = 'active';
        campagne.dateActivation = new Date().toISOString();
        // Par défaut, activer sur accueil et annonces si pas déjà défini
        if (campagne.visible_accueil === undefined) campagne.visible_accueil = true;
        if (campagne.visible_annonces === undefined) campagne.visible_annonces = true;
        sauvegarderCampagnes(campagnes);
        enregistrerActionAdmin('campagne', 'activée', campagne.titre || `Campagne #${id}`);
        afficherMessage('message-campagnes', 'Campagne activée.', 'success');
        actualiserListeCampagnes();
        actualiserDashboard();
    }
}

function desactiverCampagne(id) {
    const campagnes = chargerToutesCampagnes();
    const campagne = campagnes.find(c => c.id === id);
    if (campagne) {
        campagne.statut = 'inactive';
        campagne.dateDesactivation = new Date().toISOString();
        sauvegarderCampagnes(campagnes);
        enregistrerActionAdmin('campagne', 'désactivée', campagne.titre || `Campagne #${id}`);
        afficherMessage('message-campagnes', 'Campagne désactivée.', 'warning');
        actualiserListeCampagnes();
        actualiserDashboard();
    }
}

function supprimerCampagne(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
        return;
    }
    
    const campagnes = chargerToutesCampagnes();
    const campagne = campagnes.find(c => c.id === id);
    const filtres = campagnes.filter(c => c.id !== id);
    sauvegarderCampagnes(filtres);
    if (campagne) {
        enregistrerActionAdmin('campagne', 'supprimée', campagne.titre || `Campagne #${id}`);
    }
    afficherMessage('message-campagnes', 'Campagne supprimée.', 'success');
    actualiserListeCampagnes();
    actualiserDashboard();
}

// ============================================
// GESTION DES CATÉGORIES ET ZONES
// ============================================

function initialiserGestionCategories() {
    actualiserCategoriesZones();
    
    // Ajouter catégorie
    document.getElementById('btn-add-categorie')?.addEventListener('click', function() {
        const input = document.getElementById('new-categorie');
        const nom = input.value.trim();
        if (nom) {
            ajouterCategorie(nom);
            input.value = '';
        }
    });
    
    // Ajouter zone
    document.getElementById('btn-add-zone')?.addEventListener('click', function() {
        const input = document.getElementById('new-zone');
        const nom = input.value.trim();
        if (nom) {
            ajouterZone(nom);
            input.value = '';
        }
    });
}

function actualiserCategoriesZones() {
    const categories = chargerCategories();
    const zones = chargerZones();
    
    afficherCategories(categories);
    afficherZones(zones);
}

function afficherCategories(categories) {
    const container = document.getElementById('admin-categories-list');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucune catégorie.</p>';
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <div class="admin-item-row">
            <span>${cat.nom}</span>
            <div class="admin-item-row-actions">
                <button class="btn btn-small" onclick="toggleCategorie(${cat.id})">
                    ${cat.active ? 'Désactiver' : 'Activer'}
                </button>
                <button class="btn btn-small btn-danger" onclick="supprimerCategorie(${cat.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function afficherZones(zones) {
    const container = document.getElementById('admin-zones-list');
    if (!container) return;
    
    if (zones.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucune zone.</p>';
        return;
    }
    
    container.innerHTML = zones.map(zone => `
        <div class="admin-item-row">
            <span>${zone.nom}</span>
            <div class="admin-item-row-actions">
                <button class="btn btn-small btn-danger" onclick="supprimerZone(${zone.id})">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function ajouterCategorie(nom) {
    const categories = chargerCategories();
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    categories.push({ id: newId, nom, active: true });
    sauvegarderCategories(categories);
    actualiserCategoriesZones();
    chargerCategoriesPourFiltre('filter-annonces-categorie');
}

function ajouterZone(nom) {
    const zones = chargerZones();
    const newId = zones.length > 0 ? Math.max(...zones.map(z => z.id)) + 1 : 1;
    zones.push({ id: newId, nom });
    sauvegarderZones(zones);
    actualiserCategoriesZones();
    chargerZonesPourFiltre('filter-vendeurs-zone');
}

function toggleCategorie(id) {
    const categories = chargerCategories();
    const categorie = categories.find(c => c.id === id);
    if (categorie) {
        categorie.active = !categorie.active;
        sauvegarderCategories(categories);
        actualiserCategoriesZones();
    }
}

function supprimerCategorie(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    const categories = chargerCategories();
    const filtres = categories.filter(c => c.id !== id);
    sauvegarderCategories(filtres);
    actualiserCategoriesZones();
}

function supprimerZone(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    const zones = chargerZones();
    const filtres = zones.filter(z => z.id !== id);
    sauvegarderZones(filtres);
    actualiserCategoriesZones();
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Fonction utilitaire pour lire depuis localStorage de manière sécurisée
 * Évite la répétition de code et gère les erreurs de manière centralisée
 */
function lireLocalStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        if (!data) return defaultValue;
        return JSON.parse(data);
    } catch (e) {
        console.error(`❌ Erreur lecture localStorage "${key}":`, e);
        return defaultValue;
    }
}

/**
 * Fonction utilitaire pour écrire dans localStorage de manière sécurisée
 */
function ecrireLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`❌ Erreur écriture localStorage "${key}":`, e);
        return false;
    }
}

function chargerTousVendeursAdmin() {
    // CORRECTION PROBLÈME 6 : Éviter les doublons en utilisant un Set pour les IDs
    // Ne pas utiliser window.chargerTousVendeursAdmin pour éviter la récursion infinie
    // Charger directement depuis localStorage
    let tousVendeurs = [];
    const idsVus = new Set(); // Pour éviter les doublons
    
    // Charger depuis le tableau global vendeurs si disponible
    if (typeof vendeurs !== 'undefined' && Array.isArray(vendeurs)) {
        vendeurs.forEach(vendeur => {
            if (vendeur && vendeur.id && !idsVus.has(vendeur.id)) {
                tousVendeurs.push(vendeur);
                idsVus.add(vendeur.id);
            }
        });
    }
    
    // Charger depuis localStorage (clé principale)
    const inscrits = lireLocalStorage('vendeurs_inscrits', []);
    inscrits.forEach(vendeurInscrit => {
        if (vendeurInscrit && vendeurInscrit.id && !idsVus.has(vendeurInscrit.id)) {
            tousVendeurs.push(vendeurInscrit);
            idsVus.add(vendeurInscrit.id);
        }
    });
    
    // MIGRATION : Charger aussi depuis l'ancienne clé 'inscriptionsVendeurs' et migrer
    const anciennesInscriptions = lireLocalStorage('inscriptionsVendeurs', []);
    if (anciennesInscriptions.length > 0) {
        const vendeursInscrits = lireLocalStorage('vendeurs_inscrits', []);
        let migrationNecessaire = false;
        
        anciennesInscriptions.forEach(inscription => {
            // Vérifier si cette inscription n'existe pas déjà
            const existeDeja = vendeursInscrits.some(v => v.id === inscription.id);
            
            if (!existeDeja && inscription.id) {
                // Convertir le format : nomVendeur -> nom
                const vendeurMigre = {
                    ...inscription,
                    nom: inscription.nomVendeur || inscription.nom || 'Sans nom'
                };
                // Supprimer nomVendeur si présent
                if (vendeurMigre.nomVendeur) {
                    delete vendeurMigre.nomVendeur;
                }
                
                vendeursInscrits.push(vendeurMigre);
                tousVendeurs.push(vendeurMigre);
                idsVus.add(vendeurMigre.id);
                migrationNecessaire = true;
            }
        });
        
        // Sauvegarder les données migrées
        if (migrationNecessaire) {
            ecrireLocalStorage('vendeurs_inscrits', vendeursInscrits);
            // Optionnel : supprimer l'ancienne clé après migration
            // localStorage.removeItem('inscriptionsVendeurs');
            console.log('✅ Migration effectuée :', anciennesInscriptions.length, 'inscription(s) migrée(s)');
        }
    }
    
    return tousVendeurs;
}

function chargerTousPartenaires() {
    return lireLocalStorage('demandesPartenaires', []);
}

function chargerToutesAnnonces() {
    return lireLocalStorage('annonces_locales', []);
}

function chargerToutesCampagnes() {
    // Charger depuis localStorage si disponible, sinon depuis campagnes.js
    const stored = lireLocalStorage('campagnes', []);
    if (stored.length > 0) {
        return stored;
    }
    // Si pas de campagnes en localStorage, utiliser celles de campagnes.js
    if (typeof campagnes !== 'undefined') {
        return campagnes;
    }
    return [];
}

function sauvegarderCampagnes(campagnes) {
    ecrireLocalStorage('campagnes', campagnes);
}

function chargerCategories() {
    const stored = lireLocalStorage('categories', []);
    if (stored.length > 0) {
        return stored;
    }
    // Catégories par défaut
    return [
        { id: 1, nom: 'Légumes', active: true },
        { id: 2, nom: 'Fruits', active: true },
        { id: 3, nom: 'Céréales', active: true },
        { id: 4, nom: 'Semences', active: true }
    ];
}

function sauvegarderCategories(categories) {
    ecrireLocalStorage('categories', categories);
}

function chargerZones() {
    const stored = lireLocalStorage('zones', []);
    if (stored.length > 0) {
        return stored;
    }
    // Zones par défaut
    return [
        { id: 1, nom: 'Région de Dakar' },
        { id: 2, nom: 'Région de Thiès' },
        { id: 3, nom: 'Région de Saint-Louis' }
    ];
}

function sauvegarderZones(zones) {
    ecrireLocalStorage('zones', zones);
}

function chargerZonesPourFiltre(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const zones = chargerZones();
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Toutes les zones</option>' + 
        zones.map(z => `<option value="${z.nom}">${z.nom}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
}

function chargerCategoriesPourFiltre(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const categories = chargerCategories().filter(c => c.active);
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">Toutes les catégories</option>' + 
        categories.map(c => `<option value="${c.nom}">${c.nom}</option>`).join('');
    
    if (currentValue) {
        select.value = currentValue;
    }
}

function compterAnnoncesVendeur(vendeur) {
    // Éviter les appels récursifs - utiliser directement le fallback
    // Ne pas utiliser window.compterAnnoncesVendeur pour éviter les conflits
    const annonces = lireLocalStorage('annonces_locales', []);
    const contactVendeur = vendeur.telephone || vendeur.contact || '';
    return annonces.filter(annonce => {
        const contactAnnonce = annonce.contact || '';
        return contactAnnonce.replace(/\s/g, '') === contactVendeur.replace(/\s/g, '');
    }).length;
}

function getStatutLabel(statut) {
    const labels = {
        'valide': 'Validé',
        'en_attente': 'En attente',
        'suspendu': 'Suspendu'
    };
    return labels[statut] || statut;
}

function afficherMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = message;
    element.className = `admin-message admin-message-${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ============================================
// HISTORIQUE DES ACTIONS
// ============================================

function enregistrerActionAdmin(type, action, nom) {
    const historique = lireLocalStorage('admin_history', []);
    historique.unshift({
        type: type,
        action: action,
        nom: nom,
        date: new Date().toISOString()
    });
    
    // Garder seulement les 10 dernières actions
    if (historique.length > 10) {
        historique.pop();
    }
    
    ecrireLocalStorage('admin_history', historique);
}

function afficherHistorique() {
    const container = document.getElementById('admin-history');
    if (!container) return;
    
    const historique = lireLocalStorage('admin_history', []);
    
    if (historique.length === 0) {
        container.innerHTML = '<p class="admin-empty">Aucune action récente.</p>';
        return;
    }
    
    container.innerHTML = historique.slice(0, 10).map(item => {
        const date = new Date(item.date);
        const icon = getIconForType(item.type);
        const actionLabel = getActionLabel(item.action);
        
        return `
            <div class="admin-history-item">
                <span class="admin-history-icon">${icon}</span>
                <div class="admin-history-content">
                    <div class="admin-history-action">
                        <strong>${actionLabel}</strong>
                        <span class="admin-history-entity">${item.nom}</span>
                    </div>
                    <span class="admin-history-date">
                        ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} 
                        à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function getActionLabel(action) {
    const labels = {
        'validé': 'Vendeur validé',
        'refusé': 'Vendeur refusé',
        'suspendu': 'Vendeur suspendu',
        'supprimé': 'Vendeur supprimé',
        'validée': 'Annonce validée',
        'masquée': 'Annonce masquée',
        'supprimée': 'Annonce supprimée',
        'marquée partenaire': 'Annonce marquée partenaire',
        'mise en avant': 'Annonce mise en avant',
        'activée': 'Campagne activée',
        'désactivée': 'Campagne désactivée',
        'emplacements modifiés': 'Emplacements campagne modifiés'
    };
    return labels[action] || action;
}

// Initialiser le bouton d'effacement de l'historique
function initialiserBoutonClearHistory() {
    const btn = document.getElementById('btn-clear-history');
    if (btn) {
        btn.addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des actions ?')) {
                localStorage.removeItem('admin_history');
                afficherHistorique();
                afficherMessage('message-history', 'Historique effacé.', 'success');
            }
        });
    }
}

function getIconForType(type) {
    const icons = {
        'vendeur': '👥',
        'partenaire': '🤝',
        'annonce': '📢',
        'campagne': '⭐'
    };
    return icons[type] || '📋';
}

