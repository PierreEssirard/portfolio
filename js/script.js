document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-container');
    const detailsContainer = document.getElementById('project-details'); 
    const modal = document.getElementById('map-modal');
    const modalFrame = document.getElementById('map-frame');
    const closeModal = document.querySelector('.close-modal');
    const modalHeader = document.querySelector('.modal-header h2');
    const mapControls = document.querySelector('.map-controls');
    const modalInstruction = document.querySelector('.modal-instruction');
    
    // NOUVEAU : Référence au loader de la modale
    const modalLoader = document.getElementById('modal-loader');

    // ---------------------------------------------------------
    // 1. CONFIGURATION SCROLL OBSERVER (ANIMATIONS D'APPARITION)
    // ---------------------------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Palette de couleurs pour les projets
    const projectColors = ['#4A90E2', '#FF6B6B', '#F5A623', '#2E7D32'];

    // ---------------------------------------------------------
    // 2. GÉNÉRATION DES PROJETS EN GRILLE
    // ---------------------------------------------------------
    if (typeof myProjects !== 'undefined') {
        container.innerHTML = ''; // Nettoyage
        
        myProjects.forEach((project, index) => {
            const card = document.createElement('div');
            card.classList.add('project-card');
            
            // Animation
            card.classList.add('reveal-on-scroll');
            scrollObserver.observe(card);

            // Couleur unique
            const accentColor = projectColors[index % projectColors.length];
            card.style.setProperty('--accent-color', accentColor);

            const shortTech = project.tech.slice(0, 3).map(t => `<span>${t}</span>`).join('');
            const projectNumber = String(index + 1).padStart(2, '0');
            const hintText = project.imageText ? project.imageText : "Explorer le projet";

            card.innerHTML = `
                <div>
                    <div class="project-number">PROJECT ${projectNumber}</div>
                    <h3>${project.title}</h3>
                </div>
                <div>
                    <div class="tech-stack-mini">${shortTech}</div>
                    <div class="details-link-hint" style="margin-top:10px; font-size:10px; opacity:0.8;">${hintText}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                showProjectDetails(project);
            });

            container.appendChild(card);
        });
    } else {
        console.error("Erreur: La variable 'myProjects' n'est pas définie (vérifiez project.js).");
    }

    // ---------------------------------------------------------
    // 3. FONCTION POUR AFFICHER LES DÉTAILS
    // ---------------------------------------------------------
    function showProjectDetails(project) {
        let interactiveSection = '';
        
        if (project.interactiveMap) {
            const btnLabel = project.buttonText || "Voir la visualisation";
            const contentType = project.type || 'iframe'; 
            
            // Gestion de l'affichage du petit texte d'aide en dessous du bouton
            const helperTextHTML = contentType === 'video' 
                ? '' // Pas d'indication pour la vidéo
                : `<p style="font-size: 0.75rem; color: #888; margin-top: 10px; text-align: center;">Mode interactif disponible</p>`;

            interactiveSection = `
                <div style="margin-top: 30px;">
                    <button class="btn-interactive" 
                            data-map="${project.interactiveMap}" 
                            data-type="${contentType}">
                        ${btnLabel}
                    </button>
                    ${helperTextHTML}
                </div>
            `;
        }

        const highlightsList = project.highlights.map(h => `<li>${h}</li>`).join('');
        const fullTech = project.tech.map(t => `<span style="background:#e5e5e5; padding:5px 10px; border-radius:4px; font-size:0.8rem; color:#000;">${t}</span>`).join(' ');

        detailsContainer.innerHTML = `
            <div class="details-header">
                <span class="tag" style="background:transparent; border:1px solid #000; color:#000;">Détails du projet</span>
                <h3>${project.title}</h3>
                <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">${fullTech}</div>
            </div>
            
            <div class="details-content">
                <div class="details-desc">
                    <p>${project.description}</p>
                    <p>Ce projet illustre une approche complète, de l'analyse des besoins à la mise en œuvre technique.</p>
                </div>
                
                <div class="details-highlights">
                    <h4>Points Techniques Clés</h4>
                    <ul>${highlightsList}</ul>
                    ${interactiveSection}
                </div>
            </div>
        `;

        detailsContainer.style.display = 'block';
        setTimeout(() => {
            detailsContainer.classList.add('visible');
        }, 10);

        detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ---------------------------------------------------------
    // 4. GESTION DU MODAL (VIDÉO VS IFRAME) & LOADER
    // ---------------------------------------------------------
    
    function clearModalContent() {
        if (modalFrame) {
            modalFrame.src = ""; // Arrête l'iframe
            modalFrame.style.display = 'none'; // Cache par défaut
        }
        
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) {
            existingVideo.pause();
            existingVideo.remove();
        }
    }

    function openModal(contentSrc, type) {
        clearModalContent(); // Reset avant ouverture
        
        modal.style.display = 'flex';
        
        // AFFICHER LE LOADER PAR DÉFAUT
        if (modalLoader) modalLoader.style.display = 'flex';

        setTimeout(() => {
            modal.classList.add('show');
            
            if (type === 'video') {
                // --- MODE VIDÉO (ANDROID) ---
                if (modalHeader) modalHeader.innerText = "Démonstration (Vidéo)";
                
                if (mapControls) mapControls.style.display = 'none';
                if (modalInstruction) modalInstruction.style.display = 'none';
                
                // Création dynamique du lecteur vidéo
                const video = document.createElement('video');
                video.id = 'dynamic-video';
                video.src = contentSrc;
                video.controls = true;
                video.autoplay = true;
                
                video.style.width = "100%";
                video.style.height = "100%";
                video.style.objectFit = "contain"; 
                video.style.outline = "none";
                video.style.background = "#000"; 
                
                // --- ÉVÉNEMENT CHARGEMENT VIDÉO ---
                video.onloadeddata = () => {
                    if (modalLoader) modalLoader.style.display = 'none';
                };
                
                // Sécurité
                setTimeout(() => { if(modalLoader) modalLoader.style.display = 'none'; }, 3000);

                modalFrame.parentNode.insertBefore(video, modalFrame);
                
            } else {
                // --- MODE IFRAME (CARTES DATA) ---
                if (modalHeader) modalHeader.innerText = "Visualisation Interactive";
                
                if (mapControls) mapControls.style.display = 'flex'; 
                if (modalInstruction) modalInstruction.style.display = 'block';
                
                // Cache iframe pour éviter l'écran blanc moche au chargement
                modalFrame.style.opacity = "0"; 
                modalFrame.style.display = 'block';
                
                // --- ÉVÉNEMENT CHARGEMENT IFRAME ---
                modalFrame.onload = () => {
                    modalFrame.style.transition = "opacity 0.5s ease";
                    modalFrame.style.opacity = "1";
                    if (modalLoader) modalLoader.style.display = 'none';
                };

                modalFrame.src = contentSrc;
            }
        }, 10);
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-interactive')) {
            e.preventDefault();
            const mapSrc = e.target.getAttribute('data-map');
            const type = e.target.getAttribute('data-type');
            openModal(mapSrc, type);
        }
    });

    function closeModalFunc() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            clearModalContent(); 
        }, 300);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModalFunc();
        }
    });

    window.changeMap = function(url) {
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) existingVideo.remove();
        
        // RE-AFFICHER LE LOADER POUR LE CHANGEMENT DE CARTE
        if (modalLoader) modalLoader.style.display = 'flex';
        
        modalFrame.style.opacity = "0";
        modalFrame.style.display = 'block';
        modalFrame.src = url;

        // On redéfinit onload pour être sûr (cas de changement manuel)
        modalFrame.onload = () => {
            modalFrame.style.opacity = "1";
            if (modalLoader) modalLoader.style.display = 'none';
        }
    };

    // ---------------------------------------------------------
    // 5. NAVIGATION FLUIDE (SMOOTH SCROLL)
    // ---------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---------------------------------------------------------
    // 6. ACTIVATION OBSERVER SUR LES ÉLÉMENTS STATIQUES
    // ---------------------------------------------------------
    const staticElements = document.querySelectorAll('.section-title, .timeline-item, .contact-grid, .hero-content > *');
    staticElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        scrollObserver.observe(el);
    });
});