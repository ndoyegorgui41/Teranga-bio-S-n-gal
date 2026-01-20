// Script unique pour le modal de publication d'annonce
// Utilisable sur toutes les pages

(function() {
    'use strict';
    
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
        
        let currentStep = 1;
        let selectedMode = null; // 'record-video', 'record-audio', 'import'
        let selectedFormat = null; // 'video' ou 'audio' (déterminé après)
        let mediaRecorder = null;
        let recordedBlob = null;
        let stream = null;
        let timerInterval = null;
        let recordingTime = 0;
        const MAX_RECORDING_TIME = 90; // 90 secondes maximum
        
        const formData = {
            mode: null,
            format: null,
            media: null,
            location: null,
            product: null,
            contact: null
        };
        
        // Ouvrir le modal
        function openModal() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            showStep(1);
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
            }
        }
        
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
                
                // Passer à l'étape 2 après un court délai
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
            const recordingSection = document.getElementById('recording-section');
            const importSection = document.getElementById('import-section');
            if (recordingSection) recordingSection.style.display = 'none';
            if (importSection) importSection.style.display = 'block';
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
                
                if (!isVideo && !isAudio) {
                    alert('Format non supporté. Veuillez choisir un fichier vidéo (MP4, MOV) ou audio (MP3, M4A).');
                    return;
                }
                
                // Déterminer le format
                selectedFormat = isVideo ? 'video' : 'audio';
                formData.format = selectedFormat;
                
                // Créer un blob à partir du fichier
                recordedBlob = file;
                formData.media = recordedBlob;
                
                // Afficher la prévisualisation
                const fileURL = URL.createObjectURL(file);
                
                if (isVideo && importedVideoPreview) {
                    importedVideoPreview.src = fileURL;
                    importedVideoPreview.style.display = 'block';
                    if (importedAudioPreview) importedAudioPreview.style.display = 'none';
                } else if (isAudio && importedAudioPreview) {
                    if (importedVideoPreview) importedVideoPreview.style.display = 'none';
                    importedAudioPreview.src = fileURL;
                    importedAudioPreview.style.display = 'block';
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
            if (finalVideo) finalVideo.style.display = 'none';
            if (finalAudio) finalAudio.style.display = 'none';
            
            if (btnStartRecord) btnStartRecord.style.display = 'flex';
            if (btnStopRecord) btnStopRecord.style.display = 'none';
            if (btnRestartRecord) btnRestartRecord.style.display = 'none';
            
            setupRecording();
        }
        
        // ÉTAPE 3 : Informations
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
                            btnLocation.style.background = 'rgba(30, 107, 58, 0.1)';
                            btnLocation.style.borderColor = '#1e6b3a';
                        },
                        function(error) {
                            if (locationText) locationText.textContent = 'Utiliser ma position actuelle';
                            if (locationInput) locationInput.style.display = 'block';
                            btnLocation.style.display = 'none';
                        }
                    );
                } else {
                    if (locationInput) locationInput.style.display = 'block';
                    btnLocation.style.display = 'none';
                }
            });
        }
        
        if (locationInput) {
            locationInput.addEventListener('input', function() {
                formData.location = this.value;
            });
        }
        
        // Sélection du type de produit
        document.querySelectorAll('.product-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.product-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                formData.product = this.dataset.product;
            });
        });
        
        // Contact
        const contactInput = document.getElementById('contact-input');
        if (contactInput) {
            contactInput.addEventListener('input', function() {
                formData.contact = this.value;
            });
        }
        
        // Validation de l'étape 3 et passage à l'étape 4
        const btnContinueStep3 = document.getElementById('btn-continue-step3');
        if (btnContinueStep3) {
            btnContinueStep3.addEventListener('click', function() {
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
                    const selectedProductBtn = document.querySelector('.product-btn.selected');
                    previewProduct.textContent = selectedProductBtn ? selectedProductBtn.textContent : '-';
                }
                if (previewContact) previewContact.textContent = formData.contact;
                
                // Mettre à jour la prévisualisation finale
                updateFinalPreview();
                
                // Passer à l'étape 4
                showStep(4);
            });
        }
        
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
                }
            }
        }
        
        // ÉTAPE 4 : Boutons Modifier et Publier
        const btnModify = document.getElementById('btn-modify');
        const btnPublish = document.getElementById('btn-publish');
        
        if (btnModify) {
            btnModify.addEventListener('click', function() {
                showStep(3);
            });
        }
        
        if (btnPublish) {
            btnPublish.addEventListener('click', function() {
                // Ici, on pourrait envoyer les données au serveur
                // Pour l'instant, on simule juste la publication
                console.log('Données de l\'annonce:', formData);
                
                // Passer à l'étape 5
                showStep(5);
            });
        }
        
        // Réinitialiser le formulaire
        function resetForm() {
            currentStep = 1;
            selectedMode = null;
            selectedFormat = null;
            recordedBlob = null;
            formData.mode = null;
            formData.format = null;
            formData.media = null;
            formData.location = null;
            formData.product = null;
            formData.contact = null;
            
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

