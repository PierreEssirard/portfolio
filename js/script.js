document.addEventListener('DOMContentLoaded', () => {
    // --- 0. INJECTION DE STYLES POUR LA GESTION DES PLANS (Z-INDEX) ---
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        /* La section portfolio doit servir de référence de positionnement */
        #portfolio {
            position: relative;
            overflow: hidden; /* Coupe les cubes qui sortent en bas */
            z-index: 1; /* Crée un contexte d'empilement */
        }

        /* Les cubes seront en arrière-plan absolu */
        .camo-cube {
            position: absolute !important;
            z-index: 0 !important; /* Derrière tout */
        }
        
        /* Tout le contenu important passe au-dessus (z-index: 2 min) */
        .section-title, 
        .hero-content, 
        .instruction-wrapper,
        .project-counter-badge,
        .carousel-scene,
        .carousel-controls,
        .timeline-container,
        .contact-grid,
        .socials,
        .copyright {
            position: relative;
            z-index: 10;
        }

        /* NOTE : J'ai retiré .scroll-indicator de la liste ci-dessus pour ne pas casser son position: absolute */
        .scroll-indicator {
            z-index: 10;
        }

        /* La barre de navigation doit rester FIXE et au-dessus de tout */
        nav { 
            position: fixed !important; 
            top: 0; 
            width: 100%; 
            z-index: 1000; 
        }

        .modal { z-index: 2000; }
        .mobile-warning-popup { z-index: 4000; }
    `;
    document.head.appendChild(styleSheet);

    // --- SÉLECTION DES ÉLÉMENTS DOM ---
    const container = document.getElementById('projects-container');
    const modal = document.getElementById('map-modal');
    const modalFrame = document.getElementById('map-frame');
    const closeModal = document.querySelector('.close-modal');
    const modalHeader = document.querySelector('.modal-header h2'); 
    const mapControls = document.querySelector('.map-controls');
    const modalInstruction = document.querySelector('.modal-instruction');
    const modalLoader = document.getElementById('modal-loader');
    
    // Conteneurs des vues de la modale
    const modalMediaView = document.getElementById('modal-media-view');
    const modalDetailsView = document.getElementById('modal-details-view');
    
    // Nouveaux éléments pour la pop-up mobile
    const mobileWarningPopup = document.getElementById('mobile-warning-popup');
    const closeWarningBtn = document.getElementById('close-warning-btn');
    
    // Nouveau bouton retour
    const btnBackFloating = document.getElementById('btn-back-floating');

    // Le badge d'instruction principal
    const instructionTextElement = document.querySelector('.instruction-text');

    const projectCounterBadge = document.getElementById('project-counter-badge');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // --- PATCH DE SÉCURITÉ : Empêcher le rechargement sur les boutons map ---
    const mapButtons = document.querySelectorAll('.map-controls button');
    mapButtons.forEach(btn => {
        // Pour le clic standard
        btn.addEventListener('click', (e) => {
            e.preventDefault();
        });
        // Pour le touchstart (mobile) pour être sûr
        btn.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, {passive: true});
    });

    // ---------------------------------------------------------
    // 1. SCROLL OBSERVER (Animations d'apparition)
    // ---------------------------------------------------------
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                if (entry.target.id === 'portfolio') {
                   startFallingCubes();
                }
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const staticElements = document.querySelectorAll('.section-title, .timeline-item, .contact-grid, .hero-content > *');
    staticElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        scrollObserver.observe(el);
    });
    
    const portfolioSection = document.getElementById('portfolio');
    if(portfolioSection) {
        scrollObserver.observe(portfolioSection);
    }

    // --- COULEURS DES PROJETS ---
    const projectColors = ['#334155', '#9F1239', '#92400E', '#065F46'];

    // ---------------------------------------------------------
    // 2. MOTEUR PHYSIQUE DU CARROUSEL OVALE 3D
    // ---------------------------------------------------------
    
    let currentAngle = 0; 
    let totalCards = 0;
    let hoveredCard = null;
    let cardElements = []; 
    
    let radiusX = 650; 
    let radiusZ = 350; 
    
    const BASE_SPEED = 0.005;   
    let currentSpeed = BASE_SPEED; 
    let speedDirection = 1;     
    
    const BOOST_FORCE = 0.08;   
    const FRICTION = 0.95;      

    // --- VARIABLES GESTION TACTILE ---
    let isDragging = false;
    let startTouchX = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let touchVelocity = 0;
    let hasMoved = false; 

    // Fonction de mise à jour des instructions
    function updateInstructionsText() {
        if (!instructionTextElement) return;

        if (window.innerWidth < 768) {
            instructionTextElement.innerText = "Touchez et glissez pour tourner • Tapez pour ouvrir";
        } else {
            instructionTextElement.innerText = "Survolez pour Zoomer • Cliquez pour Explorer";
        }
    }

    function updateRadii() {
        const count = (typeof myProjects !== 'undefined' && Array.isArray(myProjects)) ? myProjects.length : 4;
        updateInstructionsText();

        if (window.innerWidth < 768) {
            const minRadiusX = 130; 
            const spacingPerCard = 160; 
            const calculatedRadius = (count * spacingPerCard) / (2 * Math.PI);
            radiusX = Math.max(minRadiusX, calculatedRadius);
            radiusZ = radiusX * 0.7; 
        } else {
            const minRadiusX = 350; 
            const spacingPerCard = 400; 
            const calculatedRadius = (count * spacingPerCard) / (2 * Math.PI);
            radiusX = Math.max(minRadiusX, calculatedRadius);
            radiusZ = radiusX * 0.55; 
        }
    }
    
    window.addEventListener('resize', updateRadii);

    // Initialisation du carrousel
    if (typeof myProjects !== 'undefined') {
        container.innerHTML = ''; 
        updateRadii();

        if (projectCounterBadge) {
            projectCounterBadge.innerText = `${myProjects.length} PROJETS`;
        }

        const displayProjects = [...myProjects];
        totalCards = displayProjects.length;
        const angleStep = (Math.PI * 2) / totalCards;

        displayProjects.forEach((project, index) => {
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('project-card-container');
            cardContainer.dataset.baseAngle = angleStep * index;
            
            const accentColor = projectColors[index % projectColors.length];
            cardContainer.style.setProperty('--accent-color', accentColor);

            const shortTech = project.tech.slice(0, 3).map(t => `<span>${t}</span>`).join('');
            const realIndex = index % myProjects.length;
            const projectNumber = String(realIndex + 1).padStart(2, '0');
            const hintText = project.imageText ? project.imageText : "Explorer le projet";
            const randomDelay = Math.random() * -5;

            cardContainer.innerHTML = `
                <div class="project-card-inner" style="animation-delay: ${randomDelay}s;">
                    <div>
                        <div class="project-number">PROJET ${projectNumber}</div>
                        <h3>${project.title}</h3>
                    </div>
                    <div>
                        <div class="tech-stack-mini">${shortTech}</div>
                        <div class="details-link-hint">${hintText}</div>
                    </div>
                </div>
            `;

            // Events Desktop
            cardContainer.addEventListener('mouseenter', () => {
                hoveredCard = cardContainer;
                if (instructionTextElement && window.innerWidth >= 768) {
                    instructionTextElement.innerText = "CLIQUEZ POUR EXPLORER";
                }
            });

            cardContainer.addEventListener('mouseleave', () => {
                if (hoveredCard === cardContainer) hoveredCard = null;
                if (instructionTextElement && window.innerWidth >= 768) {
                    instructionTextElement.innerText = "Survolez pour Zoomer • Cliquez pour Explorer";
                }
            });

            // GESTION DU CLIC INTELLIGENTE
            cardContainer.addEventListener('click', (e) => {
                if (hasMoved && window.innerWidth < 768) {
                    return;
                }
                openDetailsModal(project, index);
            });

            container.appendChild(cardContainer);
            cardElements.push(cardContainer);
        });

        function animateCarousel() {
            if (!isDragging) {
                if (Math.abs(currentSpeed) > BASE_SPEED) {
                    currentSpeed *= FRICTION; 
                } else {
                    currentSpeed = BASE_SPEED * speedDirection; 
                }
                currentAngle -= currentSpeed;
            }

            cardElements.forEach(card => {
                const baseAngle = parseFloat(card.dataset.baseAngle);
                const theta = currentAngle + baseAngle;
                const x = radiusX * Math.sin(theta);
                const z = radiusZ * Math.cos(theta); 

                let rotationY, scale, zIndexOverride;
                
                if (card === hoveredCard) {
                    rotationY = 0; 
                    scale = 1.3;
                    zIndexOverride = 2000; 
                } else {
                    rotationY = theta; 
                    scale = 1;
                    zIndexOverride = null;
                }

                card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotationY}rad) scale(${scale})`;

                let opacity;
                if (card === hoveredCard) {
                    opacity = 1;
                } else {
                    const zIndexVal = z / radiusZ; 
                    opacity = 0.15 + (0.85 * (zIndexVal + 1) / 2);
                    opacity = Math.max(0, Math.min(1, opacity)); 
                }
                
                card.style.opacity = opacity;
                
                const zIndexVal = z / radiusZ;
                card.style.pointerEvents = (zIndexVal > 0.2 || card === hoveredCard) ? 'auto' : 'none';
                
                if (zIndexOverride) {
                    card.style.zIndex = zIndexOverride;
                } else {
                    card.style.zIndex = Math.round(z);
                }
            });
            requestAnimationFrame(animateCarousel);
        }
        animateCarousel();
    } else {
        console.error("Erreur: 'myProjects' manquant.");
    }

    // --- ACCÉLÉRATEURS CLAVIER/SOURIS (Desktop) ---
    if(prevBtn && nextBtn) {
        prevBtn.addEventListener('mousedown', () => { speedDirection = -1; currentSpeed = -BOOST_FORCE; });
        nextBtn.addEventListener('mousedown', () => { speedDirection = 1; currentSpeed = BOOST_FORCE; });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { speedDirection = -1; currentSpeed = -BOOST_FORCE; } 
        else if (e.key === 'ArrowRight') { speedDirection = 1; currentSpeed = BOOST_FORCE; }
    });

    // --- GESTION TACTILE AVANCÉE (MOBILE - TOTAL CONTROL) ---
    const carouselScene = document.querySelector('.carousel-scene');
    
    if (carouselScene) {
        carouselScene.addEventListener('touchstart', (e) => {
            isDragging = true;
            hasMoved = false; 
            startTouchX = e.touches[0].clientX;
            lastTouchX = startTouchX;
            lastTouchTime = Date.now();
            currentSpeed = 0;
        }, {passive: true});

        carouselScene.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            // --- FIX SCROLL MOBILE : BLOQUER LE SCROLL VERTICAL ---
            if(e.cancelable) {
                e.preventDefault(); 
            }

            const currentX = e.touches[0].clientX;
            const now = Date.now();
            const deltaX = currentX - lastTouchX; 
            const deltaTime = now - lastTouchTime;
            
            if (Math.abs(currentX - startTouchX) > 10) {
                hasMoved = true;
            }

            const sensitivity = 0.008; 
            currentAngle += deltaX * sensitivity; 
            
            if (deltaTime > 0) {
                touchVelocity = (deltaX * sensitivity) / deltaTime * 16; 
            }
            
            lastTouchX = currentX;
            lastTouchTime = now;
        }, {passive: false});

        carouselScene.addEventListener('touchend', () => {
            isDragging = false;
            
            const maxVelocity = 0.2; 
            if (touchVelocity > maxVelocity) touchVelocity = maxVelocity;
            if (touchVelocity < -maxVelocity) touchVelocity = -maxVelocity;
            
            currentSpeed = -touchVelocity;
            
            if (currentSpeed > 0) speedDirection = 1; 
            else if (currentSpeed < 0) speedDirection = -1;
            
            if (Math.abs(touchVelocity) < 0.002) {
                currentSpeed = BASE_SPEED * speedDirection;
            }
            touchVelocity = 0;
        });
    }

    // ---------------------------------------------------------
    // SYSTEME DE PARTICULES (CUBES CAMOUFLAGE)
    // ---------------------------------------------------------
    function startFallingCubes() {
        const portfolio = document.getElementById('portfolio');
        if(!portfolio) return;
        
        if(portfolio.dataset.cubesLaunched === "true") return;
        portfolio.dataset.cubesLaunched = "true";

        setTimeout(() => createFallingCube(portfolio), 0);
        setTimeout(() => createFallingCube(portfolio), 400);
        setTimeout(() => createFallingCube(portfolio), 800);
        setTimeout(() => createFallingCube(portfolio), 1200);
        setTimeout(() => createFallingCube(portfolio), 1600);
        
        setInterval(() => {
            if(document.visibilityState === 'visible') {
                createFallingCube(portfolio);
            }
        }, 1000);
    }

    function createFallingCube(targetContainer) {
        if (!targetContainer) return;

        const cube = document.createElement('div');
        cube.classList.add('camo-cube');
        cube.style.position = 'absolute';
        cube.style.top = '-50px'; 
        cube.style.zIndex = '0';
        
        for(let j=0; j<6; j++) {
            const face = document.createElement('div');
            face.classList.add('camo-cube-face');
            cube.appendChild(face);
        }
        
        let randomPos;
        if (Math.random() < 0.5) randomPos = Math.random() * 25;
        else randomPos = 75 + (Math.random() * 25);
        cube.style.left = randomPos + '%';
        
        const containerHeight = targetContainer.offsetHeight;
        const startY = -50;
        const endY = containerHeight + 50;
        const duration = 12000 + Math.random() * 8000; 
        const startTime = Date.now();
        
        let rotX = Math.random() * 360;
        let rotY = Math.random() * 360;
        let rotZ = Math.random() * 360;
        
        const speedX = 0.3 + Math.random() * 0.7;
        const speedY = 0.3 + Math.random() * 0.7;
        const speedZ = 0.3 + Math.random() * 0.7;
        
        targetContainer.appendChild(cube);
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1 || !cube.isConnected) {
                cube.remove();
                return;
            }
            
            const currentY = startY + (endY - startY) * progress;
            rotX += speedX; rotY += speedY; rotZ += speedZ;
            
            let opacity = 1;
            if (progress < 0.1) opacity = progress / 0.1;
            else if (progress > 0.9) opacity = (1 - progress) / 0.1;
            
            cube.style.transform = `perspective(1000px) translateY(${currentY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
            cube.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ---------------------------------------------------------
    // FONCTIONS MODALE & NAVIGATION
    // ---------------------------------------------------------
    function clearModalContent() {
        if (modalFrame) { modalFrame.src = ""; modalFrame.style.display = 'none'; }
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) { existingVideo.pause(); existingVideo.remove(); }
        const existingImg = document.getElementById('dynamic-image');
        if (existingImg) existingImg.remove();
        
        if(modalDetailsView) modalDetailsView.innerHTML = '';
        if(modalMediaView) modalMediaView.style.display = 'none';
        if(modalDetailsView) modalDetailsView.style.display = 'none';
        if(btnBackFloating) btnBackFloating.style.display = 'none';
        if(mobileWarningPopup) mobileWarningPopup.style.display = 'none';
    }

    // --- FIX GHOST CLICK & MODIF POPUP SYSTÉMATIQUE ---
    if (closeWarningBtn) {
        // Cette fonction ferme la popup SANS enregistrer le choix en mémoire
        const dismissWarning = (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            
            // J'ai supprimé la ligne : sessionStorage.setItem('mobileWarningDismissed', 'true');
            // Comme ça, au prochain chargement, la popup reviendra.
            if (mobileWarningPopup) mobileWarningPopup.style.display = 'none';
        };

        closeWarningBtn.addEventListener('touchend', dismissWarning);
        closeWarningBtn.addEventListener('click', dismissWarning);
    }

    function backToDetails() {
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) existingVideo.pause();
        modalMediaView.style.display = 'none';
        modalDetailsView.style.display = 'block';
        btnBackFloating.style.display = 'none';
        if(mobileWarningPopup) mobileWarningPopup.style.display = 'none';
    }
    if (btnBackFloating) btnBackFloating.addEventListener('click', backToDetails);

    function openDetailsModal(project, index) {
        clearModalContent();
        if (modalLoader) modalLoader.style.display = 'none';
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);

        const accentColor = projectColors[index % projectColors.length];
        let interactiveSection = '';
        if (project.interactiveMap) {
            const btnLabel = project.buttonText || "Voir la visualisation";
            const contentType = project.type || 'iframe'; 
            interactiveSection = `
                <div style="margin-top: 30px;">
                    <button class="btn-interactive" 
                            style="background: ${accentColor};" 
                            data-map="${project.interactiveMap}" 
                            data-type="${contentType}">
                        ${btnLabel}
                    </button>
                </div>`;
        }

        const highlightsList = project.highlights.map(h => `<li style="--bullet-color: ${accentColor}">${h}</li>`).join('');
        const fullTech = project.tech.map(t => `<span style="background: ${accentColor}15; color: ${accentColor}; border: 1px solid ${accentColor}30; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">${t}</span>`).join('');

        const styleInjection = `<style>.modal-details-highlights li::before { color: ${accentColor}; }</style>`;

        modalDetailsView.innerHTML = `
            ${styleInjection}
            <div class="modal-details-header" style="border-bottom-color: ${accentColor}30;">
                <span class="tag" style="background:transparent; border:1px solid ${accentColor}; color:${accentColor};">Détails du projet</span>
                <h2 class="modal-details-title" style="color: ${accentColor};">${project.title}</h2>
                <div class="modal-details-tech">${fullTech}</div>
            </div>
            <div class="modal-details-body">
                <div class="modal-details-desc"><p>${project.description}</p></div>
                <div class="modal-details-highlights" style="background: ${accentColor}08;">
                    <h4 style="color: ${accentColor}; opacity: 0.8;">Points Techniques Clés</h4>
                    <ul>${highlightsList}</ul>
                    ${interactiveSection}
                </div>
            </div>
        `;
        modalDetailsView.style.display = 'block';
    }

    function openMediaModal(contentSrc, type) {
        modalDetailsView.style.display = 'none';
        modalMediaView.style.display = 'flex';
        if(btnBackFloating) btnBackFloating.style.display = 'flex';

        if (modalFrame) { modalFrame.src = ""; modalFrame.style.display = 'none'; }
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) existingVideo.remove();
        const existingImg = document.getElementById('dynamic-image');
        if (existingImg) existingImg.remove();

        if (modalLoader) modalLoader.style.display = 'flex';

        // --- AFFICHAGE SYSTÉMATIQUE POPUP MOBILE ---
        if (window.innerWidth < 768 && type !== 'video' && type !== 'image') {
            // J'ai supprimé la vérification 'sessionStorage' ici aussi.
            if (mobileWarningPopup) mobileWarningPopup.style.display = 'flex';
        }

        const targetTitle = document.getElementById('modal-media-title');

        if (type === 'video') {
            if (targetTitle) targetTitle.innerText = "Démonstration (Vidéo)";
            if (mapControls) mapControls.style.display = 'none';
            if (modalInstruction) modalInstruction.style.display = 'none';
            
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
            
            video.onloadeddata = () => { if (modalLoader) modalLoader.style.display = 'none'; };
            setTimeout(() => { if(modalLoader) modalLoader.style.display = 'none'; }, 2000);
            
            modalFrame.parentNode.insertBefore(video, modalFrame);

        } else if (type === 'image') {
            if (targetTitle) targetTitle.innerText = "Aperçu de la Maquette";
            if (mapControls) mapControls.style.display = 'none';
            if (modalInstruction) modalInstruction.style.display = 'none';
            
            const img = document.createElement('img');
            img.id = 'dynamic-image';
            img.src = contentSrc;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "contain"; 
            img.style.display = "block";
            
            img.onload = () => { if (modalLoader) modalLoader.style.display = 'none'; };
            setTimeout(() => { if(modalLoader) modalLoader.style.display = 'none'; }, 2000);
            
            modalFrame.parentNode.insertBefore(img, modalFrame);

        } else {
            if (targetTitle) targetTitle.innerText = "Visualisation Interactive";
            if (mapControls) mapControls.style.display = 'flex'; 
            if (modalInstruction) modalInstruction.style.display = 'block';
            
            modalFrame.style.opacity = "0"; 
            modalFrame.style.display = 'block';
            window.changeMap(contentSrc);
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-interactive')) {
            e.preventDefault();
            const mapSrc = e.target.getAttribute('data-map');
            const type = e.target.getAttribute('data-type');
            openMediaModal(mapSrc, type);
        }
    });

    function closeModalFunc() {
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; clearModalContent(); }, 300);
    }

    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    window.addEventListener('click', (e) => { if (e.target == modal) closeModalFunc(); });

    window.changeMap = function(url) {
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) existingVideo.remove();
        const existingImg = document.getElementById('dynamic-image');
        if (existingImg) existingImg.remove();
        
        if (modalLoader) modalLoader.style.display = 'flex';
        modalFrame.style.opacity = "0";
        modalFrame.style.display = 'block';
        modalFrame.src = url;

        const instructionEl = document.querySelector('.modal-instruction');
        if (instructionEl) {
            const isMobile = window.innerWidth < 768; 

            if (!isMobile && (url.includes('carte_US_par_etat') || url.includes('carte_US_par_région'))) {
                instructionEl.innerHTML = "<strong>Astuce :</strong> Maintenez le <strong>clic droit</strong> pour déplacer la carte (Pan).";
                instructionEl.style.display = 'block';
            } else {
                instructionEl.innerText = "Interagissez avec le graphique pour voir les détails.";
            }
        }

        modalFrame.onload = () => {
            modalFrame.style.opacity = "1";
            if (modalLoader) modalLoader.style.display = 'none';
        }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        });
    });
});