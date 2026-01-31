// Script unique pour le modal de publication d'annonce
// Utilisable sur toutes les pages

(function() {
    'use strict';
    
    // ===== GESTION INDEXEDDB POUR VIDÉOS ET AUDIOS =====
    const DB_NAME = 'TerangaBioMedia';
    const DB_VERSION = 1;
    const STORE_NAME = 'media';
    
    // Ouvrir la base de données IndexedDB
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }
    
    // Stocker un blob dans IndexedDB
    function storeBlobInIndexedDB(id, blob) {
        return openDB().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(blob, id);
                
                request.onsuccess = () => {
                    console.log('✅ Blob stocké dans IndexedDB:', id);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        });
    }
    
    // Récupérer un blob depuis IndexedDB
    function getBlobFromIndexedDB(id) {
        return openDB().then(db => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);
                
                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result);
                    } else {
                        reject(new Error('Blob non trouvé: ' + id));
                    }
                };
                request.onerror = () => reject(request.error);
            });
        });
    }
    
    // Exposer les fonctions globalement pour annonces.js
    window.getBlobFromIndexedDB = getBlobFromIndexedDB;
    
    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', function() {
        const modal = document.getElementById('modal-publication');
        if (!modal) {
            console.warn('Modal de publication non trouvé');
            return;
        }
        
        // Trouver tous les boutons "Publier une annonce"
        const btnIds = [
            'btn-publier-annonce',           // Page d'accueil
            'btn-publier-annonce-page',      // Page annonces
            'btn-publier-annonce-categories'  // Page catégories
        ];
        
        const btnClose = document.getElementById('modal-close');
        const btnCloseFinal = document.getElementById('btn-close-modal');
        
        let currentStep = 0; // Commencer à l'étape 0 (règles)
        let selectedMode = null; // 'record-video', 'record-audio', 'import'
        let selectedFormat = null; // 'video' ou 'audio' (déterminé après)
        let mediaRecorder = null;
        let recordedBlob = null;
        let stream = null;
        let timerInterval = null;
        let recordingTime = 0;
        const MAX_RECORDING_TIME = 90; // 90 secondes maximum
        
        // Variables pour l'acceptation des règles
        let rulesAccepted = false;
        let rulesTimerStart = null;
        let rulesTimerMinimum = 5000; // 5 secondes minimum
        let audioRulesPlayed = false;
        
        const formData = {
            mode: null,
            format: null,
            media: null,
            location: null,
            product: null,
            contact: null,
            rulesAccepted: false,
            rulesAcceptedDate: null,
            rulesVersion: '1.0'
        };
        
        // Ouvrir le modal
        function openModal() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            showStep(0); // Commencer par l'étape des règles
        }
        
        // Fermer le modal
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            resetForm();
        }
        
        // Attacher les événements à tous les boutons
        btnIds.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal();
                });
            }
        });
        
        if (btnClose) {
            btnClose.addEventListener('click', closeModal);
        }
        
        if (btnCloseFinal) {
            btnCloseFinal.addEventListener('click', closeModal);
        }
        
        // Fermer en cliquant sur le fond
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
        
        // Navigation entre les étapes
        function showStep(step) {
            document.querySelectorAll('.modal-step').forEach(s => {
                s.style.display = 'none';
            });
            const stepEl = document.getElementById('step-' + step);
            if (stepEl) {
                stepEl.style.display = 'block';
                currentStep = step;
                
                // Initialiser l'étape 0 (règles) si nécessaire
                if (step === 0) {
                    initRulesStep();
                }
                
                // Initialiser l'étape 3 (informations) si nécessaire
                if (step === 3) {
                    initStep3();
                }
            }
        }
        
        // Initialiser l'étape des règles
        function initRulesStep() {
            rulesAccepted = false;
            rulesTimerStart = Date.now();
            audioRulesPlayed = false;
            
            const acceptCheckbox = document.getElementById('accept-rules');
            const continueBtn = document.getElementById('btn-continue-rules');
            const timerInfo = document.getElementById('rules-timer-info');
            const btnAudioRules = document.getElementById('btn-audio-rules');
            const audioRules = document.getElementById('audio-rules');
            const audioStatus = document.getElementById('audio-status');
            
            // Réinitialiser l'état
            if (acceptCheckbox) {
                acceptCheckbox.checked = false;
            }
            if (continueBtn) {
                continueBtn.disabled = true;
            }
            if (timerInfo) {
                timerInfo.style.display = 'block';
            }
            if (audioStatus) {
                audioStatus.style.display = 'none';
            }
            
            // Gérer la case à cocher
            if (acceptCheckbox) {
                // Retirer les anciens listeners
                const newCheckbox = acceptCheckbox.cloneNode(true);
                acceptCheckbox.parentNode.replaceChild(newCheckbox, acceptCheckbox);
                newCheckbox.addEventListener('change', function() {
                    checkRulesAcceptance();
                });
            }
            
            // Gérer le bouton audio
            if (btnAudioRules && audioRules) {
                btnAudioRules.onclick = function() {
                    if (audioRules.paused || audioRules.ended || audioRules.readyState === 0) {
                        // Vérifier si le fichier audio existe
                        audioRules.load(); // Forcer le chargement
                        
                        audioRules.play().then(function() {
                            // Audio joué avec succès
                            if (audioStatus) {
                                audioStatus.style.display = 'flex';
                            }
                        }).catch(function(error) {
                            console.log('Erreur lecture audio:', error);
                            // Si l'audio n'existe pas, afficher un message et activer après le timer
                            if (audioStatus) {
                                audioStatus.innerHTML = '<span class="audio-playing-icon">⚠️</span><span>Fichier audio non disponible. Vous pouvez continuer après 5 secondes.</span>';
                                audioStatus.style.display = 'flex';
                                audioStatus.style.background = 'rgba(255, 193, 7, 0.1)';
                                audioStatus.style.color = '#f57c00';
                            }
                            // Ne pas bloquer si l'audio n'existe pas - le timer suffira
                        });
                    } else {
                        audioRules.pause();
                        audioRules.currentTime = 0;
                        if (audioStatus) {
                            audioStatus.style.display = 'none';
                        }
                    }
                };
                
                // Gérer les erreurs de chargement
                audioRules.addEventListener('error', function(e) {
                    console.log('Erreur chargement audio:', e);
                    if (audioStatus) {
                        audioStatus.innerHTML = '<span class="audio-playing-icon">⚠️</span><span>Fichier audio non disponible. Vous pouvez continuer après 5 secondes.</span>';
                        audioStatus.style.display = 'flex';
                        audioStatus.style.background = 'rgba(255, 193, 7, 0.1)';
                        audioStatus.style.color = '#f57c00';
                    }
                });
                
                // Quand l'audio se termine, activer le bouton
                audioRules.addEventListener('ended', function() {
                    audioRulesPlayed = true;
                    if (audioStatus) {
                        audioStatus.style.display = 'none';
                    }
                    checkRulesAcceptance();
                });
            }
            
            // Vérifier périodiquement si on peut activer le bouton
            const checkInterval = setInterval(function() {
                if (currentStep === 0) {
                    checkRulesAcceptance();
                } else {
                    clearInterval(checkInterval);
                }
            }, 500);
        }
        
        // Vérifier si on peut accepter les règles
        function checkRulesAcceptance() {
            const acceptCheckbox = document.getElementById('accept-rules');
            const continueBtn = document.getElementById('btn-continue-rules');
            const timerInfo = document.getElementById('rules-timer-info');
            
            if (!acceptCheckbox || !continueBtn) return;
            
            const timeElapsed = Date.now() - rulesTimerStart;
            const minimumTimePassed = timeElapsed >= rulesTimerMinimum;
            const checkboxChecked = acceptCheckbox.checked;
            
            // Activer le bouton si : case cochée ET (5 secondes passées OU audio terminé)
            if (checkboxChecked && (minimumTimePassed || audioRulesPlayed)) {
                continueBtn.disabled = false;
                if (timerInfo) {
                    timerInfo.style.display = 'none';
                }
            } else {
                continueBtn.disabled = true;
                if (timerInfo && !minimumTimePassed && !audioRulesPlayed) {
                    const remaining = Math.ceil((rulesTimerMinimum - timeElapsed) / 1000);
                    if (remaining > 0) {
                        timerInfo.textContent = `Veuillez prendre le temps de lire les règles (${remaining} seconde${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''})`;
                    }
                }
            }
        }
        
        // Gérer le bouton continuer des règles (une seule fois)
        let btnContinueRulesHandler = null;
        function setupContinueRulesButton() {
            const btnContinueRules = document.getElementById('btn-continue-rules');
            if (btnContinueRules && !btnContinueRulesHandler) {
                btnContinueRulesHandler = function() {
                    const acceptCheckbox = document.getElementById('accept-rules');
                    if (!acceptCheckbox || !acceptCheckbox.checked) {
                        const rulesError = document.getElementById('rules-error');
                        if (rulesError) {
                            rulesError.style.display = 'block';
                        }
                        return;
                    }
                    
                    // Enregistrer l'acceptation
                    rulesAccepted = true;
                    formData.rulesAccepted = true;
                    formData.rulesAcceptedDate = new Date().toISOString();
                    
                    // Sauvegarder dans localStorage (pour traçage)
                    try {
                        const acceptanceRecord = {
                            date: formData.rulesAcceptedDate,
                            version: formData.rulesVersion,
                            userAgent: navigator.userAgent
                        };
                        const existingRecords = JSON.parse(localStorage.getItem('rulesAcceptances') || '[]');
                        existingRecords.push(acceptanceRecord);
                        localStorage.setItem('rulesAcceptances', JSON.stringify(existingRecords));
                    } catch (e) {
                        console.log('Erreur sauvegarde acceptation:', e);
                    }
                    
                    // Passer à l'étape suivante
                    showStep(1);
                };
                btnContinueRules.addEventListener('click', btnContinueRulesHandler);
            }
        }
        
        // Initialiser le bouton au chargement
        setupContinueRulesButton();
        
        // ÉTAPE 1 : Choix du mode de publication
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                selectedMode = this.dataset.mode;
                formData.mode = selectedMode;
                
                // Déterminer le format selon le mode
                if (selectedMode === 'record-video') {
                    selectedFormat = 'video';
                } else if (selectedMode === 'record-audio') {
                    selectedFormat = 'audio';
                } else if (selectedMode === 'import') {
                    selectedFormat = null; // Sera déterminé lors de l'importation
                } else if (selectedMode === 'image-only') {
                    selectedFormat = 'image'; // Format image pour image-only
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
                } else if (selectedMode === 'image-only') {
                    this.style.borderColor = '#1e6b3a';
                    this.style.background = 'rgba(30, 107, 58, 0.1)';
                } else {
                    this.style.borderColor = '#2d8f4f';
                    this.style.background = 'rgba(45, 143, 79, 0.1)';
                }
                
                // Passer à l'étape 2 après un court délai
                setTimeout(() => {
                    showStep(2);
                    console.log('🔍 Mode sélectionné:', selectedMode); // Debug
                    if (selectedMode === 'import' || selectedMode === 'image-only') {
                        console.log('📁 Appel de setupImport()'); // Debug
                        setupImport();
                    } else {
                        console.log('🎥 Appel de setupRecording()'); // Debug
                        setupRecording();
                    }
                }, 300);
            });
        });
        
        // ÉTAPE 2 : Configuration de l'enregistrement
        function setupRecording() {
            const recordingSection = document.getElementById('recording-section');
            const importSection = document.getElementById('import-section');
            if (recordingSection) recordingSection.style.display = 'block';
            if (importSection) importSection.style.display = 'none';
            
            const videoPreview = document.getElementById('video-preview');
            const audioPreview = document.getElementById('audio-preview');
            const placeholder = document.getElementById('recording-placeholder');
            
            if (selectedFormat === 'video' && videoPreview) {
                videoPreview.style.display = 'block';
                if (audioPreview) audioPreview.style.display = 'none';
                if (placeholder) placeholder.style.display = 'none';
            } else if (selectedFormat === 'audio' && audioPreview) {
                if (videoPreview) videoPreview.style.display = 'none';
                audioPreview.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
            }
        }
        
        // ÉTAPE 2 : Configuration de l'importation
        function setupImport() {
            console.log('📁 setupImport() appelé'); // Debug
            const recordingSection = document.getElementById('recording-section');
            const importSection = document.getElementById('import-section');
            console.log('📁 recordingSection trouvé:', !!recordingSection); // Debug
            console.log('📁 importSection trouvé:', !!importSection); // Debug
            
            if (recordingSection) {
                recordingSection.style.display = 'none';
                console.log('📁 recordingSection masquée'); // Debug
            }
            if (importSection) {
                importSection.style.display = 'block';
                console.log('📁 importSection affichée'); // Debug
            } else {
                console.error('❌ import-section non trouvé dans le DOM'); // Debug
            }
            
            // Modifier l'accept du file input selon le mode
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                if (selectedMode === 'image-only') {
                    fileInput.setAttribute('accept', 'image/*');
                } else {
                    fileInput.setAttribute('accept', 'video/mp4,video/quicktime,audio/mpeg,audio/mp4,audio/x-m4a');
                }
            }
            
            // Mettre à jour le texte du bouton, du guide et du titre selon le mode
            const btnSelectFile = document.getElementById('btn-select-file');
            const stepGuide = importSection ? importSection.querySelector('.step-guide') : null;
            const stepTitle = importSection ? importSection.querySelector('h2') : null;
            
            if (selectedMode === 'image-only') {
                if (btnSelectFile) {
                    const span = btnSelectFile.querySelector('span');
                    const small = btnSelectFile.querySelector('small');
                    if (span) span.textContent = 'Choisir une image';
                    if (small) small.textContent = 'JPG, PNG';
                }
                if (stepGuide) {
                    stepGuide.textContent = 'Vous pouvez importer une image de votre produit';
                }
                if (stepTitle) {
                    stepTitle.textContent = 'Importez votre image';
                }
            } else {
                if (btnSelectFile) {
                    const span = btnSelectFile.querySelector('span');
                    const small = btnSelectFile.querySelector('small');
                    if (span) span.textContent = 'Choisir un fichier';
                    if (small) small.textContent = 'MP4, MOV, MP3, M4A';
                }
                if (stepGuide) {
                    stepGuide.textContent = 'Vous pouvez importer une vidéo ou un audio déjà enregistré';
                }
                if (stepTitle) {
                    stepTitle.textContent = 'Importez votre vidéo ou audio';
                }
            }
        }
        
        // Gestion de l'importation de fichiers
        const fileInput = document.getElementById('file-input');
        const btnSelectFile = document.getElementById('btn-select-file');
        const btnChangeFile = document.getElementById('btn-change-file');
        const importPreview = document.getElementById('import-preview');
        const importedVideoPreview = document.getElementById('imported-video-preview');
        const importedAudioPreview = document.getElementById('imported-audio-preview');
        const fileInfo = document.getElementById('file-info');
        
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
                
                // Vérifier le type de fichier
                const isVideo = file.type.startsWith('video/');
                const isAudio = file.type.startsWith('audio/');
                const isImage = file.type.startsWith('image/');
                
                // Si on est en mode image-only, accepter uniquement les images
                if (selectedMode === 'image-only' && !isImage) {
                    alert('Format non supporté. Veuillez choisir une image (JPG, PNG).');
                    return;
                }
                
                // Si on est en mode import normal, accepter vidéo/audio uniquement
                if (selectedMode === 'import' && !isVideo && !isAudio) {
                    alert('Format non supporté. Veuillez choisir un fichier vidéo (MP4, MOV) ou audio (MP3, M4A).');
                    return;
                }
                
                // Déterminer le format
                if (isImage) {
                    selectedFormat = 'image';
                } else {
                    selectedFormat = isVideo ? 'video' : 'audio';
                }
                formData.format = selectedFormat;
                
                // Créer un blob à partir du fichier
                recordedBlob = file;
                formData.media = recordedBlob;
                
                // Afficher la prévisualisation
                const fileURL = URL.createObjectURL(file);
                
                if (isImage) {
                    // Pour les images, créer un élément img si nécessaire
                    let importedImagePreview = document.getElementById('imported-image-preview');
                    if (!importedImagePreview) {
                        // Créer l'élément img s'il n'existe pas
                        importedImagePreview = document.createElement('img');
                        importedImagePreview.id = 'imported-image-preview';
                        importedImagePreview.style.display = 'none';
                        importedImagePreview.style.width = '100%';
                        importedImagePreview.style.maxHeight = '300px';
                        importedImagePreview.style.borderRadius = '10px';
                        importedImagePreview.style.objectFit = 'contain';
                        if (importPreview) {
                            importPreview.insertBefore(importedImagePreview, importPreview.firstChild);
                        }
                    }
                    importedImagePreview.src = fileURL;
                    importedImagePreview.style.display = 'block';
                    if (importedVideoPreview) importedVideoPreview.style.display = 'none';
                    if (importedAudioPreview) importedAudioPreview.style.display = 'none';
                } else if (isVideo && importedVideoPreview) {
                    importedVideoPreview.src = fileURL;
                    importedVideoPreview.style.display = 'block';
                    if (importedAudioPreview) importedAudioPreview.style.display = 'none';
                    const importedImagePreview = document.getElementById('imported-image-preview');
                    if (importedImagePreview) importedImagePreview.style.display = 'none';
                } else if (isAudio && importedAudioPreview) {
                    if (importedVideoPreview) importedVideoPreview.style.display = 'none';
                    importedAudioPreview.src = fileURL;
                    importedAudioPreview.style.display = 'block';
                    const importedImagePreview = document.getElementById('imported-image-preview');
                    if (importedImagePreview) importedImagePreview.style.display = 'none';
                }
                
                // Afficher les informations du fichier
                if (fileInfo) {
                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                    fileInfo.textContent = `Fichier: ${file.name} (${fileSizeMB} MB)`;
                }
                
                // Afficher la prévisualisation et masquer le bouton de sélection
                if (importPreview) importPreview.style.display = 'block';
                if (btnSelectFile) btnSelectFile.style.display = 'none';
                
                // Passer automatiquement à l'étape 3 après 1 seconde
                setTimeout(() => {
                    showStep(3);
                }, 1000);
            });
        }
        
        // Démarrer l'enregistrement
        const btnStartRecord = document.getElementById('btn-start-record');
        const btnStopRecord = document.getElementById('btn-stop-record');
        const btnRestartRecord = document.getElementById('btn-restart-record');
        const timer = document.getElementById('recording-timer');
        
        if (btnStartRecord) {
            btnStartRecord.addEventListener('click', startRecording);
        }
        
        if (btnStopRecord) {
            btnStopRecord.addEventListener('click', stopRecording);
        }
        
        if (btnRestartRecord) {
            btnRestartRecord.addEventListener('click', restartRecording);
        }
        
        async function startRecording() {
            try {
                const constraints = selectedFormat === 'video' 
                    ? { video: true, audio: true }
                    : { audio: true };
                
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                const videoPreview = document.getElementById('video-preview');
                const audioPreview = document.getElementById('audio-preview');
                
                if (selectedFormat === 'video' && videoPreview) {
                    videoPreview.srcObject = stream;
                    videoPreview.play();
                }
                
                const options = { mimeType: selectedFormat === 'video' ? 'video/webm' : 'audio/webm' };
                mediaRecorder = new MediaRecorder(stream, options);
                
                const chunks = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };
                
                mediaRecorder.onstop = () => {
                    recordedBlob = new Blob(chunks, { type: selectedFormat === 'video' ? 'video/webm' : 'audio/webm' });
                    formData.media = recordedBlob;
                };
                
                mediaRecorder.start();
                
                // Afficher/masquer les boutons
                if (btnStartRecord) btnStartRecord.style.display = 'none';
                if (btnStopRecord) btnStopRecord.style.display = 'flex';
                if (btnRestartRecord) btnRestartRecord.style.display = 'none';
                
                // Démarrer le timer
                recordingTime = 0;
                if (timerInterval) clearInterval(timerInterval);
                timerInterval = setInterval(() => {
                    recordingTime++;
                    const minutes = Math.floor(recordingTime / 60);
                    const seconds = recordingTime % 60;
                    if (timer) {
                        timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    }
                    
                    // Arrêter automatiquement à 90 secondes
                    if (recordingTime >= MAX_RECORDING_TIME) {
                        stopRecording();
                    }
                }, 1000);
                
            } catch (error) {
                alert('Erreur: Impossible d\'accéder à la caméra/microphone. Veuillez autoriser l\'accès dans les paramètres de votre navigateur.');
                console.error('Erreur d\'accès média:', error);
            }
        }
        
        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            if (btnStartRecord) btnStartRecord.style.display = 'none';
            if (btnStopRecord) btnStopRecord.style.display = 'none';
            if (btnRestartRecord) btnRestartRecord.style.display = 'flex';
            
            // Passer à l'étape 3
            setTimeout(() => {
                showStep(3);
            }, 500);
        }
        
        function restartRecording() {
            recordedBlob = null;
            formData.media = null;
            recordingTime = 0;
            if (timer) timer.textContent = '00:00';
            
            const finalVideo = document.getElementById('final-video-preview');
            const finalAudio = document.getElementById('final-audio-preview');
            const finalImagePreview = document.getElementById('final-image-preview');
            if (finalVideo) finalVideo.style.display = 'none';
            if (finalAudio) finalAudio.style.display = 'none';
            if (finalImagePreview) finalImagePreview.style.display = 'none';
            
            // Réinitialiser aussi les prévisualisations d'import
            const importPreview = document.getElementById('import-preview');
            const importedVideoPreview = document.getElementById('imported-video-preview');
            const importedAudioPreview = document.getElementById('imported-audio-preview');
            const importedImagePreview = document.getElementById('imported-image-preview');
            const btnSelectFile = document.getElementById('btn-select-file');
            const fileInput = document.getElementById('file-input');
            
            if (importPreview) importPreview.style.display = 'none';
            if (importedVideoPreview) {
                importedVideoPreview.src = '';
                importedVideoPreview.style.display = 'none';
            }
            if (importedAudioPreview) {
                importedAudioPreview.src = '';
                importedAudioPreview.style.display = 'none';
            }
            if (importedImagePreview) {
                importedImagePreview.src = '';
                importedImagePreview.style.display = 'none';
            }
            if (btnSelectFile) btnSelectFile.style.display = 'flex';
            if (fileInput) fileInput.value = '';
            
            if (btnStartRecord) btnStartRecord.style.display = 'flex';
            if (btnStopRecord) btnStopRecord.style.display = 'none';
            if (btnRestartRecord) btnRestartRecord.style.display = 'none';
            
            // Si on est en mode image-only ou import, utiliser setupImport, sinon setupRecording
            if (selectedMode === 'image-only' || selectedMode === 'import') {
                setupImport();
            } else {
                setupRecording();
            }
        }
        
        // Flag pour éviter les doublons d'initialisation
        let step3Initialized = false;
        
        // Initialiser l'étape 3 (informations)
        function initStep3() {
            console.log('📝 Initialisation de l\'étape 3'); // Debug
            
            // Utiliser un délai pour s'assurer que le DOM est prêt
            setTimeout(() => {
                // Chercher les éléments dans le contexte de l'étape 3
                const step3 = document.getElementById('step-3');
                if (!step3) {
                    console.warn('⚠️ Étape 3 non trouvée dans le DOM');
                    return;
                }
                
                // Chercher les éléments dans le contexte de step-3
                const btnLocation = step3.querySelector('#btn-location') || document.getElementById('btn-location');
                const locationInput = step3.querySelector('#location-input') || document.getElementById('location-input');
                const locationText = step3.querySelector('#location-text') || document.getElementById('location-text');
                const contactInput = step3.querySelector('#contact-input') || document.getElementById('contact-input');
                const btnContinueStep3 = step3.querySelector('#btn-continue-step3') || document.getElementById('btn-continue-step3');
                const productBtns = step3.querySelectorAll('.product-btn') || document.querySelectorAll('.product-btn');
                
                console.log('🔍 Éléments trouvés:', {
                    btnLocation: !!btnLocation,
                    locationInput: !!locationInput,
                    locationText: !!locationText,
                    contactInput: !!contactInput,
                    btnContinueStep3: !!btnContinueStep3,
                    productBtns: productBtns.length
                });
                
                // Si déjà initialisé, retirer les anciens listeners d'abord
                if (step3Initialized) {
                    // Retirer les listeners en clonant les éléments
                    if (btnLocation && btnLocation.parentNode) {
                        const newBtn = btnLocation.cloneNode(true);
                        btnLocation.parentNode.replaceChild(newBtn, btnLocation);
                    }
                    if (locationInput && locationInput.parentNode) {
                        const newInput = locationInput.cloneNode(true);
                        locationInput.parentNode.replaceChild(newInput, locationInput);
                    }
                    if (contactInput && contactInput.parentNode) {
                        const newInput = contactInput.cloneNode(true);
                        contactInput.parentNode.replaceChild(newInput, contactInput);
                    }
                    if (btnContinueStep3 && btnContinueStep3.parentNode) {
                        const newBtn = btnContinueStep3.cloneNode(true);
                        btnContinueStep3.parentNode.replaceChild(newBtn, btnContinueStep3);
                    }
                    productBtns.forEach(btn => {
                        if (btn.parentNode) {
                            const newBtn = btn.cloneNode(true);
                            btn.parentNode.replaceChild(newBtn, btn);
                        }
                    });
                }
                
                // Récupérer les nouveaux éléments après clonage
                const finalBtnLocation = step3.querySelector('#btn-location') || document.getElementById('btn-location');
                const finalLocationInput = step3.querySelector('#location-input') || document.getElementById('location-input');
                const finalLocationText = step3.querySelector('#location-text') || document.getElementById('location-text');
                const finalContactInput = step3.querySelector('#contact-input') || document.getElementById('contact-input');
                const finalBtnContinueStep3 = step3.querySelector('#btn-continue-step3') || document.getElementById('btn-continue-step3');
                const finalProductBtns = step3.querySelectorAll('.product-btn') || document.querySelectorAll('.product-btn');
                
                // Bouton de localisation
                if (finalBtnLocation) {
                    finalBtnLocation.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('📍 Clic sur bouton localisation');
                        
                        if (navigator.geolocation) {
                            const locationTextEl = step3.querySelector('#location-text') || document.getElementById('location-text');
                            if (locationTextEl) locationTextEl.textContent = 'Localisation en cours...';
                            
                            navigator.geolocation.getCurrentPosition(
                                function(position) {
                                    const lat = position.coords.latitude;
                                    const lng = position.coords.longitude;
                                    formData.location = `${lat}, ${lng}`;
                                    const locationTextEl = step3.querySelector('#location-text') || document.getElementById('location-text');
                                    if (locationTextEl) locationTextEl.textContent = 'Position actuelle utilisée';
                                    finalBtnLocation.style.background = 'rgba(30, 107, 58, 0.1)';
                                    finalBtnLocation.style.borderColor = '#1e6b3a';
                                    console.log('✅ Localisation obtenue:', formData.location);
                                },
                                function(error) {
                                    console.error('❌ Erreur géolocalisation:', error);
                                    const locationTextEl = step3.querySelector('#location-text') || document.getElementById('location-text');
                                    const locationInputEl = step3.querySelector('#location-input') || document.getElementById('location-input');
                                    if (locationTextEl) locationTextEl.textContent = 'Utiliser ma position actuelle';
                                    if (locationInputEl) locationInputEl.style.display = 'block';
                                    finalBtnLocation.style.display = 'none';
                                }
                            );
                        } else {
                            const locationInputEl = step3.querySelector('#location-input') || document.getElementById('location-input');
                            if (locationInputEl) locationInputEl.style.display = 'block';
                            finalBtnLocation.style.display = 'none';
                        }
                    }, { once: false });
                }
                
                // Champ de saisie de localisation
                if (finalLocationInput) {
                    finalLocationInput.addEventListener('input', function() {
                        formData.location = this.value;
                        console.log('📍 Lieu saisi:', formData.location);
                    }, { once: false });
                }
                
                // Sélection du type de produit
                finalProductBtns.forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const productBtnsAll = step3.querySelectorAll('.product-btn') || document.querySelectorAll('.product-btn');
                        productBtnsAll.forEach(b => b.classList.remove('selected'));
                        this.classList.add('selected');
                        formData.product = this.dataset.product || this.getAttribute('data-product');
                        console.log('📦 Produit sélectionné:', formData.product);
                    }, { once: false });
                });
                
                // Champ de contact
                if (finalContactInput) {
                    finalContactInput.addEventListener('input', function() {
                        formData.contact = this.value;
                        console.log('📞 Contact saisi:', formData.contact);
                    }, { once: false });
                }
                
                // Bouton de validation
                if (finalBtnContinueStep3) {
                    finalBtnContinueStep3.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔍 Validation étape 3 - formData:', formData);
                        
                        // Vérifier que tous les champs sont remplis
                        if (!formData.location) {
                            alert('Veuillez indiquer un lieu');
                            return;
                        }
                        if (!formData.product) {
                            alert('Veuillez sélectionner un type de produit');
                            return;
                        }
                        if (!formData.contact) {
                            alert('Veuillez indiquer un contact');
                            return;
                        }
                        
                        // Afficher les infos dans la prévisualisation
                        const previewLocation = document.getElementById('preview-location');
                        const previewProduct = document.getElementById('preview-product');
                        const previewContact = document.getElementById('preview-contact');
                        
                        if (previewLocation) previewLocation.textContent = formData.location;
                        if (previewProduct) {
                            const selectedProductBtn = step3.querySelector('.product-btn.selected') || document.querySelector('.product-btn.selected');
                            previewProduct.textContent = selectedProductBtn ? selectedProductBtn.textContent : '-';
                        }
                        if (previewContact) previewContact.textContent = formData.contact;
                        
                        // Mettre à jour la prévisualisation finale
                        updateFinalPreview();
                        
                        // Passer à l'étape 4
                        showStep(4);
                    }, { once: false });
                }
                
                step3Initialized = true;
            }, 100); // Petit délai pour s'assurer que le DOM est prêt
        }
        
        // Initialiser l'étape 3 au chargement (pour compatibilité)
        initStep3();
        
        // Mettre à jour la prévisualisation finale
        function updateFinalPreview() {
            const finalVideo = document.getElementById('final-video-preview');
            const finalAudio = document.getElementById('final-audio-preview');
            
            if (recordedBlob) {
                const url = URL.createObjectURL(recordedBlob);
                
                if (selectedFormat === 'video' && finalVideo) {
                    finalVideo.src = url;
                    finalVideo.style.display = 'block';
                    if (finalAudio) finalAudio.style.display = 'none';
                } else if (selectedFormat === 'audio' && finalAudio) {
                    if (finalVideo) finalVideo.style.display = 'none';
                    finalAudio.src = url;
                    finalAudio.style.display = 'block';
                } else if (selectedFormat === 'image') {
                    // Pour les images, créer ou utiliser un élément img
                    let finalImagePreview = document.getElementById('final-image-preview');
                    const step4 = document.getElementById('step-4');
                    if (step4 && !finalImagePreview) {
                        finalImagePreview = document.createElement('img');
                        finalImagePreview.id = 'final-image-preview';
                        finalImagePreview.style.width = '100%';
                        finalImagePreview.style.maxHeight = '300px';
                        finalImagePreview.style.borderRadius = '10px';
                        finalImagePreview.style.objectFit = 'contain';
                        finalImagePreview.style.marginBottom = '20px';
                        // Insérer avant les autres éléments de prévisualisation
                        const firstChild = step4.querySelector('.form-simple, .preview-container, h2');
                        if (firstChild) {
                            step4.insertBefore(finalImagePreview, firstChild);
                        } else {
                            step4.appendChild(finalImagePreview);
                        }
                    }
                    if (finalImagePreview) {
                        finalImagePreview.src = url;
                        finalImagePreview.style.display = 'block';
                    }
                    if (finalVideo) finalVideo.style.display = 'none';
                    if (finalAudio) finalAudio.style.display = 'none';
                }
            }
        }
        
        // ÉTAPE 4 : Boutons Modifier et Publier
        const btnModify = document.getElementById('btn-modify');
        const btnPublish = document.getElementById('btn-publish');
        
        console.log('🔍 Recherche des boutons:', {
            btnModify: !!btnModify,
            btnPublish: !!btnPublish
        });
        
        if (btnModify) {
            btnModify.addEventListener('click', function() {
                showStep(3);
            });
        }
        
        if (btnPublish) {
            console.log('✅ Bouton Publier trouvé et événement attaché');
            btnPublish.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ Bouton Publier cliqué!');
                
                // Debug : afficher l'état de formData
                console.log('🔍 État de formData avant sauvegarde:', {
                    location: formData.location,
                    product: formData.product,
                    contact: formData.contact,
                    media: formData.media ? 'présent' : 'absent',
                    recordedBlob: recordedBlob ? 'présent' : 'absent',
                    mode: selectedMode,
                    format: selectedFormat
                });
                
                // Vérifier que toutes les données requises sont présentes
                if (!formData.location) {
                    alert('Veuillez indiquer un lieu.');
                    console.error('❌ Lieu manquant');
                    return;
                }
                
                if (!formData.product) {
                    alert('Veuillez sélectionner un type de produit.');
                    console.error('❌ Type de produit manquant');
                    return;
                }
                
                if (!formData.contact) {
                    alert('Veuillez indiquer un contact.');
                    console.error('❌ Contact manquant');
                    return;
                }
                
                if (!formData.media && !recordedBlob) {
                    alert('Veuillez sélectionner ou enregistrer un média (image, vidéo ou audio).');
                    console.error('❌ Média manquant');
                    return;
                }
                
                // Récupérer la session utilisateur
                const session = JSON.parse(localStorage.getItem('user_session') || 'null');
                if (!session) {
                    alert('Session expirée. Veuillez vous reconnecter.');
                    closeModal();
                    window.location.href = 'vendeur.html';
                    return;
                }
                
                // Mapper les valeurs data-product vers les noms corrects avec accents
                const productMapping = {
                    'legumes': 'légumes',
                    'fruits': 'fruits',
                    'cereales': 'céréales',
                    'transformes': 'produits transformés',
                    'autre': 'autre'
                };
                
                // Convertir la valeur du produit en nom correct
                const productValue = formData.product || '';
                const productCorrect = productMapping[productValue.toLowerCase()] || productValue;
                
                // Créer l'objet annonce
                const annonce = {
                    id: Date.now(),
                    type: selectedMode === 'image-only' ? 'image_only' : (selectedFormat === 'image' ? 'image' : selectedFormat),
                    format: selectedFormat || (selectedMode === 'image-only' ? 'image' : null),
                    product: productCorrect,
                    location: formData.location,
                    contact: formData.contact,
                    vendeurId: session.id,
                    dateCreated: new Date().toISOString(),
                    dateCreation: new Date().toISOString(),
                    statut: 'en_attente'
                };
                
                // Fonction pour sauvegarder l'annonce
                const sauvegarderAnnonce = (annonceComplete) => {
                    try {
                        const annonces = JSON.parse(localStorage.getItem('annonces_locales') || '[]');
                        console.log('📦 Annonces existantes avant ajout:', annonces.length);
                        
                        annonces.push(annonceComplete);
                        localStorage.setItem('annonces_locales', JSON.stringify(annonces));
                        
                        // Vérifier que la sauvegarde a fonctionné
                        const annoncesVerifiees = JSON.parse(localStorage.getItem('annonces_locales') || '[]');
                        console.log('✅ Annonce sauvegardée avec succès!');
                        console.log('📊 Total annonces dans localStorage:', annoncesVerifiees.length);
                        console.log('📋 Dernière annonce sauvegardée:', annoncesVerifiees[annoncesVerifiees.length - 1]);
                        
                        // Vérification finale
                        if (annoncesVerifiees.length === annonces.length) {
                            console.log('✅ Vérification réussie: l\'annonce est bien dans localStorage');
                        } else {
                            console.error('❌ Problème: l\'annonce n\'a pas été sauvegardée correctement');
                        }
                        
                        // Passer à l'étape 5 (confirmation)
                        showStep(5);
                    } catch (e) {
                        console.error('❌ Erreur sauvegarde annonce:', e);
                        console.error('❌ Détails de l\'erreur:', e.message, e.stack);
                        alert('Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.\n\nErreur: ' + e.message);
                    }
                };
                
                // Ajouter le média
                if (recordedBlob) {
                    if (recordedBlob instanceof File) {
                        // C'est un fichier importé
                        if (selectedFormat === 'image' || selectedMode === 'image-only') {
                            annonce.image = recordedBlob.name;
                            // Pour les images, créer une URL base64 pour l'affichage immédiat
                            // En production, vous devrez uploader l'image sur un serveur
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                annonce.imageUrl = e.target.result; // URL base64 de l'image
                                console.log('📝 Annonce à sauvegarder (avec image):', annonce);
                                sauvegarderAnnonce(annonce);
                            };
                            reader.onerror = function(e) {
                                console.error('❌ Erreur lecture image:', e);
                                alert('Erreur lors de la lecture de l\'image. Veuillez réessayer.');
                            };
                            reader.readAsDataURL(recordedBlob);
                            return; // Ne pas continuer, attendre le callback du FileReader
                        } else if (selectedFormat === 'video') {
                            annonce.video = recordedBlob.name;
                            // Pour les vidéos, stocker dans IndexedDB (plus rapide que base64)
                            annonce.videoId = 'video_' + annonce.id; // ID unique pour IndexedDB
                            annonce.mediaUrl = annonce.videoId; // Référence pour récupération
                            
                            // Stocker le blob dans IndexedDB
                            storeBlobInIndexedDB(annonce.videoId, recordedBlob).then(() => {
                                console.log('📝 Annonce à sauvegarder (avec vidéo):', annonce);
                                sauvegarderAnnonce(annonce);
                            }).catch((error) => {
                                console.error('❌ Erreur stockage vidéo:', error);
                                alert('Erreur lors du stockage de la vidéo. Veuillez réessayer.');
                            });
                            return; // Ne pas continuer, attendre le callback
                        } else if (selectedFormat === 'audio') {
                            annonce.audio = recordedBlob.name;
                            // Pour les audios, stocker dans IndexedDB (plus rapide que base64)
                            annonce.audioId = 'audio_' + annonce.id; // ID unique pour IndexedDB
                            annonce.mediaUrl = annonce.audioId; // Référence pour récupération
                            
                            // Stocker le blob dans IndexedDB
                            storeBlobInIndexedDB(annonce.audioId, recordedBlob).then(() => {
                                console.log('📝 Annonce à sauvegarder (avec audio):', annonce);
                                sauvegarderAnnonce(annonce);
                            }).catch((error) => {
                                console.error('❌ Erreur stockage audio:', error);
                                alert('Erreur lors du stockage de l\'audio. Veuillez réessayer.');
                            });
                            return; // Ne pas continuer, attendre le callback
                        }
                    } else {
                        // C'est un blob enregistré (vidéo/audio)
                        if (selectedFormat === 'video') {
                            annonce.video = 'enregistrement_video.webm';
                            // Pour les vidéos enregistrées, stocker dans IndexedDB
                            annonce.videoId = 'video_' + annonce.id;
                            annonce.mediaUrl = annonce.videoId;
                            
                            // Stocker le blob dans IndexedDB
                            storeBlobInIndexedDB(annonce.videoId, recordedBlob).then(() => {
                                console.log('📝 Annonce à sauvegarder (avec vidéo enregistrée):', annonce);
                                sauvegarderAnnonce(annonce);
                            }).catch((error) => {
                                console.error('❌ Erreur stockage vidéo enregistrée:', error);
                                alert('Erreur lors du stockage de la vidéo. Veuillez réessayer.');
                            });
                            return; // Ne pas continuer, attendre le callback
                        } else if (selectedFormat === 'audio') {
                            annonce.audio = 'enregistrement_audio.webm';
                            // Pour les audios enregistrés, stocker dans IndexedDB
                            annonce.audioId = 'audio_' + annonce.id;
                            annonce.mediaUrl = annonce.audioId;
                            
                            // Stocker le blob dans IndexedDB
                            storeBlobInIndexedDB(annonce.audioId, recordedBlob).then(() => {
                                console.log('📝 Annonce à sauvegarder (avec audio enregistré):', annonce);
                                sauvegarderAnnonce(annonce);
                            }).catch((error) => {
                                console.error('❌ Erreur stockage audio enregistré:', error);
                                alert('Erreur lors du stockage de l\'audio. Veuillez réessayer.');
                            });
                            return; // Ne pas continuer, attendre le callback
                        }
                    }
                }
                
                // Debug : afficher l'annonce avant sauvegarde
                console.log('📝 Annonce à sauvegarder:', annonce);
                
                // Sauvegarder dans localStorage (sauf pour les médias qui sont gérés dans les callbacks FileReader)
                sauvegarderAnnonce(annonce);
            });
        }
        
        // Réinitialiser le formulaire
        function resetForm() {
            currentStep = 0;
            selectedMode = null;
            selectedFormat = null;
            recordedBlob = null;
            rulesAccepted = false;
            rulesTimerStart = null;
            audioRulesPlayed = false;
            formData.mode = null;
            formData.format = null;
            formData.media = null;
            formData.location = null;
            formData.product = null;
            formData.contact = null;
            formData.rulesAccepted = false;
            formData.rulesAcceptedDate = null;
            
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            recordingTime = 0;
            if (timer) timer.textContent = '00:00';
            
            // Réinitialiser les sections
            const recordingSection = document.getElementById('recording-section');
            const importSection = document.getElementById('import-section');
            if (recordingSection) recordingSection.style.display = 'none';
            if (importSection) importSection.style.display = 'none';
            
            // Réinitialiser les boutons d'enregistrement
            if (btnStartRecord) btnStartRecord.style.display = 'flex';
            if (btnStopRecord) btnStopRecord.style.display = 'none';
            if (btnRestartRecord) btnRestartRecord.style.display = 'none';
            
            // Réinitialiser l'importation
            if (fileInput) fileInput.value = '';
            if (importPreview) importPreview.style.display = 'none';
            if (btnSelectFile) btnSelectFile.style.display = 'flex';
            if (importedVideoPreview) {
                importedVideoPreview.src = '';
                importedVideoPreview.style.display = 'none';
            }
            if (importedAudioPreview) {
                importedAudioPreview.src = '';
                importedAudioPreview.style.display = 'none';
            }
            const importedImagePreview = document.getElementById('imported-image-preview');
            if (importedImagePreview) {
                importedImagePreview.src = '';
                importedImagePreview.style.display = 'none';
            }
            const finalImagePreview = document.getElementById('final-image-preview');
            if (finalImagePreview) {
                finalImagePreview.src = '';
                finalImagePreview.style.display = 'none';
            }
            if (fileInfo) fileInfo.textContent = '';
            
            // Réinitialiser les champs
            document.querySelectorAll('.product-btn').forEach(b => b.classList.remove('selected'));
            document.querySelectorAll('.format-btn').forEach(b => {
                b.style.borderColor = '#e0e0e0';
                b.style.background = '#f8f9fa';
            });
            
            if (locationInput) locationInput.value = '';
            if (contactInput) contactInput.value = '';
            if (btnLocation) {
                btnLocation.style.display = 'flex';
                if (locationText) locationText.textContent = 'Utiliser ma position actuelle';
            }
            if (locationInput) locationInput.style.display = 'none';
        }
    });
})();

