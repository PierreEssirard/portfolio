document.addEventListener('DOMContentLoaded', () => {
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
    
    // Nouveau bouton retour
    const btnBackFloating = document.getElementById('btn-back-floating');

    // Le badge d'instruction principal
    const instructionTextElement = document.querySelector('.instruction-text');

    const projectCounterBadge = document.getElementById('project-counter-badge');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // ---------------------------------------------------------
    // 1. SCROLL OBSERVER
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

    const staticElements = document.querySelectorAll('.section-title, .timeline-item, .contact-grid, .hero-content > *');
    staticElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        scrollObserver.observe(el);
    });

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

    function updateRadii() {
        const count = (typeof myProjects !== 'undefined' && Array.isArray(myProjects)) ? myProjects.length : 4;
        
        if (window.innerWidth < 768) {
            // --- MOBILE : CARTES PLUS PETITES ET SERRÉES ---
            const minRadiusX = 140; // Réduit (était 180)
            const spacingPerCard = 200; // Réduit (était 260)
            const calculatedRadius = (count * spacingPerCard) / (2 * Math.PI);
            radiusX = Math.max(minRadiusX, calculatedRadius);
            
            radiusZ = radiusX * 0.7; 
        } else {
            // --- DESKTOP ---
            const minRadiusX = 350; 
            const spacingPerCard = 400; 
            const calculatedRadius = (count * spacingPerCard) / (2 * Math.PI);
            radiusX = Math.max(minRadiusX, calculatedRadius);
            radiusZ = radiusX * 0.55; 
        }
    }
    
    window.addEventListener('resize', updateRadii);

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

            // ... (reste des event listeners inchangés) ...
            cardContainer.addEventListener('mouseenter', () => {
                hoveredCard = cardContainer;
                if (instructionTextElement) {
                    instructionTextElement.innerText = "CLIQUEZ POUR EXPLORER";
                }
            });

            cardContainer.addEventListener('mouseleave', () => {
                if (hoveredCard === cardContainer) {
                    hoveredCard = null;
                }
                if (instructionTextElement) {
                    instructionTextElement.innerText = "Survolez pour Zoomer • Cliquez pour Explorer";
                }
            });

            cardContainer.addEventListener('click', () => {
                openDetailsModal(project, index);
            });

            container.appendChild(cardContainer);
            cardElements.push(cardContainer);
        });

        function animateCarousel() {
            if (Math.abs(currentSpeed) > BASE_SPEED) {
                currentSpeed *= FRICTION;
            } else {
                currentSpeed = BASE_SPEED * speedDirection;
            }
            currentAngle -= currentSpeed;

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
        console.error("Erreur: La variable 'myProjects' n'est pas définie.");
    }

    if(prevBtn && nextBtn) {
        prevBtn.addEventListener('mousedown', () => {
            speedDirection = -1; currentSpeed = -BOOST_FORCE; 
        });
        nextBtn.addEventListener('mousedown', () => {
            speedDirection = 1; currentSpeed = BOOST_FORCE; 
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { speedDirection = -1; currentSpeed = -BOOST_FORCE; } 
        else if (e.key === 'ArrowRight') { speedDirection = 1; currentSpeed = BOOST_FORCE; }
    });

    // ... (reste du fichier avec les fonctions modal inchangées) ...
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
    }

    function backToDetails() {
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) existingVideo.pause();
        modalMediaView.style.display = 'none';
        modalDetailsView.style.display = 'block';
        btnBackFloating.style.display = 'none';
    }

    if (btnBackFloating) {
        btnBackFloating.addEventListener('click', backToDetails);
    }

    function openDetailsModal(project, index) {
        clearModalContent();
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

        const highlightsList = project.highlights.map(h => {
            return `<li style="--bullet-color: ${accentColor}">${h}</li>`;
        }).join('');

        const fullTech = project.tech.map(t => {
            return `<span style="
                background: ${accentColor}15; 
                color: ${accentColor}; 
                border: 1px solid ${accentColor}30;
                padding: 6px 12px; 
                border-radius: 6px; 
                font-size: 0.8rem; 
                font-weight: 600;">${t}</span>`;
        }).join('');

        const styleInjection = `<style>
            .modal-details-highlights li::before { color: ${accentColor}; }
        </style>`;

        modalDetailsView.innerHTML = `
            ${styleInjection}
            <div class="modal-details-header" style="border-bottom-color: ${accentColor}30;">
                <span class="tag" style="background:transparent; border:1px solid ${accentColor}; color:${accentColor};">Détails du projet</span>
                <h2 class="modal-details-title" style="color: ${accentColor};">${project.title}</h2>
                <div class="modal-details-tech">${fullTech}</div>
            </div>
            <div class="modal-details-body">
                <div class="modal-details-desc">
                    <p>${project.description}</p>
                    <p>Ce projet illustre une approche complète, de l'analyse des besoins à la mise en œuvre technique.</p>
                </div>
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
        if (existingVideo) { existingVideo.remove(); }
        const existingImg = document.getElementById('dynamic-image');
        if (existingImg) existingImg.remove();
        if (modalLoader) modalLoader.style.display = 'flex';
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
            modalFrame.onload = () => {
                modalFrame.style.transition = "opacity 0.5s ease";
                modalFrame.style.opacity = "1";
                if (modalLoader) modalLoader.style.display = 'none';
            };
            modalFrame.src = contentSrc;
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
        setTimeout(() => { 
            modal.style.display = 'none'; 
            clearModalContent(); 
        }, 300);
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