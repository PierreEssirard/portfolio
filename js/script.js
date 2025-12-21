document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-container');
    const detailsContainer = document.getElementById('project-details'); 
    const modal = document.getElementById('map-modal');
    const modalFrame = document.getElementById('map-frame');
    const closeModal = document.querySelector('.close-modal');
    const modalHeader = document.querySelector('.modal-header h2');
    const mapControls = document.querySelector('.map-controls');
    const modalInstruction = document.querySelector('.modal-instruction');
    const modalLoader = document.getElementById('modal-loader');
    
    // NOUVEAU: Récupération de l'élément du compteur
    const projectCounterBadge = document.getElementById('project-counter-badge');

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

    // --- COULEURS MISES À JOUR (Palette Mate/Élégante) ---
    // Bleu Ardoise, Rouge Antique, Ocre Doré, Vert Émeraude Profond
    const projectColors = ['#334155', '#9F1239', '#92400E', '#065F46'];

    // ---------------------------------------------------------
    // 2. GÉNÉRATION DES PROJETS (CARROUSEL INFINI)
    // ---------------------------------------------------------
    if (typeof myProjects !== 'undefined') {
        container.innerHTML = ''; 
        
        // MISE À JOUR DU COMPTEUR DE PROJETS
        if (projectCounterBadge) {
            projectCounterBadge.innerText = `${myProjects.length} PROJETS DISPONIBLES`;
        }

        // ASTUCE CARROUSEL : On double la liste des projets pour créer l'effet de boucle infinie
        const displayProjects = [...myProjects, ...myProjects];
        
        displayProjects.forEach((project, index) => {
            const card = document.createElement('div');
            card.classList.add('project-card');
            
            // On garde le reveal mais attention au carrousel (il bouge déjà)
            // On l'ajoute juste pour l'effet d'apparition initial
            card.classList.add('reveal-on-scroll');
            scrollObserver.observe(card);

            // --- AJOUT D'UN DÉLAI ALÉATOIRE POUR L'EFFET DE FLOTTEMENT ---
            // Cela permet que les cartes ne flottent pas toutes en même temps
            const randomDelay = Math.random() * 5; // Délai entre 0 et 5 secondes
            card.style.animationDelay = `-${randomDelay}s`; // Délai négatif pour commencer l'animation tout de suite à un moment différent

            const accentColor = projectColors[index % projectColors.length];
            card.style.setProperty('--accent-color', accentColor);

            const shortTech = project.tech.slice(0, 3).map(t => `<span>${t}</span>`).join('');
            // Calcul du vrai numéro (modulo la longueur originale)
            const realIndex = index % myProjects.length;
            const projectNumber = String(realIndex + 1).padStart(2, '0');
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
        console.error("Erreur: La variable 'myProjects' n'est pas définie.");
    }

    // ---------------------------------------------------------
    // 3. FONCTION DÉTAILS
    // ---------------------------------------------------------
    function showProjectDetails(project) {
        let interactiveSection = '';
        
        if (project.interactiveMap) {
            const btnLabel = project.buttonText || "Voir la visualisation";
            const contentType = project.type || 'iframe'; 
            
            const helperTextHTML = (contentType === 'video' || contentType === 'image')
                ? '' 
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

        // Scroll doux vers les détails (juste en dessous du carrousel)
        detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ---------------------------------------------------------
    // 4. GESTION DU MODAL
    // ---------------------------------------------------------
    
    function clearModalContent() {
        if (modalFrame) {
            modalFrame.src = ""; 
            modalFrame.style.display = 'none'; 
        }
        
        const existingVideo = document.getElementById('dynamic-video');
        if (existingVideo) {
            existingVideo.pause();
            existingVideo.remove();
        }

        const existingImg = document.getElementById('dynamic-image');
        if (existingImg) existingImg.remove();
    }

    function openModal(contentSrc, type) {
        clearModalContent(); 
        
        modal.style.display = 'flex';
        if (modalLoader) modalLoader.style.display = 'flex';

        setTimeout(() => {
            modal.classList.add('show');
            
            if (type === 'video') {
                if (modalHeader) modalHeader.innerText = "Démonstration (Vidéo)";
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
                setTimeout(() => { if(modalLoader) modalLoader.style.display = 'none'; }, 3000);
                modalFrame.parentNode.insertBefore(video, modalFrame);
                
            } else if (type === 'image') {
                if (modalHeader) modalHeader.innerText = "Aperçu de la Maquette";
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
                setTimeout(() => { if(modalLoader) modalLoader.style.display = 'none'; }, 3000);

                modalFrame.parentNode.insertBefore(img, modalFrame);

            } else {
                if (modalHeader) modalHeader.innerText = "Visualisation Interactive";
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
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const staticElements = document.querySelectorAll('.section-title, .timeline-item, .contact-grid, .hero-content > *');
    staticElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        scrollObserver.observe(el);
    });
});