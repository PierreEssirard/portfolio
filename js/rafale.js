import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- 1. Configuration de la Scène ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Fond blanc

// Brouillard léger
scene.fog = new THREE.Fog(0xffffff, 20, 100);

// --- 2. Caméra ---
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; 
camera.position.y = -0.2;

// --- 3. Rendu ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- 4. Lumières ---
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- 5. Chargement du Modèle & Logique de Barre de Progression ---
let rafale;
const baseScale = 0.6; 
const startPositionX = 4; 

// Éléments du DOM pour le loader
const globalLoader = document.getElementById('global-loader');
const progressBar = document.getElementById('progress-bar');
const progressPlane = document.getElementById('progress-plane');
const loadingText = document.getElementById('loading-text');

// États de chargement
let isModelLoaded = false;
let isTimeElapsed = false;

// --- LOGIQUE MINUTERIE 5 SECONDES (MODIFIÉ) ---
const duration = 2000; // 2000 ms = 2 secondes
const intervalTime = 50; // Mise à jour toutes les 50ms pour fluidité
const step = 100 / (duration / intervalTime); // Pourcentage à ajouter par tick
let currentProgress = 0;

const timer = setInterval(() => {
    currentProgress += step;
    
    // Plafond à 100%
    if (currentProgress >= 100) {
        currentProgress = 100;
        isTimeElapsed = true;
        clearInterval(timer); // Arrêt de la minuterie
        checkLoadComplete();  // On vérifie si on peut fermer
    }

    // Mise à jour visuelle
    updateLoaderUI(currentProgress);

}, intervalTime);

function updateLoaderUI(percent) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPlane) progressPlane.style.left = `${percent}%`;
    if (loadingText) loadingText.innerText = `Initialisation des systèmes... ${Math.round(percent)}%`;
}

// Fonction finale de fermeture
function checkLoadComplete() {
    // Il faut que les DEUX conditions soient vraies
    if (isModelLoaded && isTimeElapsed) {
        if (globalLoader) {
            setTimeout(() => {
                globalLoader.classList.add('fade-out');
            }, 500); // Petit délai bonus pour la douceur
        }
    }
}

// --- CHARGEMENT RÉEL THREE.JS ---
const loader = new GLTFLoader();

loader.load(
    'dassault_rafale.glb', 
    (gltf) => {
        rafale = gltf.scene;
        
        rafale.scale.set(baseScale, baseScale, baseScale);
        rafale.position.set(startPositionX, 0, 0); 
        
        rafale.rotation.y = 1; 
        rafale.rotation.x = 1; 
        rafale.rotation.z = 0;

        scene.add(rafale);

        // Le modèle est prêt !
        isModelLoaded = true;
        checkLoadComplete(); 
    },
    undefined,
    (error) => {
        console.error('Erreur chargement modèle:', error);
        // En cas d'erreur, on force la fin pour ne pas bloquer l'utilisateur éternellement
        isModelLoaded = true;
        checkLoadComplete();
    }
);

// --- 6. Gestion du Scroll ---
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// --- 7. Animation ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    if (rafale) {
        // --- A. Effet APESANTEUR ---
        rafale.position.y = Math.sin(time * 1.2) * 0.08; 
        
        // --- B. Traversée DROITE -> GAUCHE ---
        rafale.position.x = startPositionX - (scrollY * 0.015);
        
        // --- C. Rotation sur lui-même ---
        rafale.rotation.y = 0; 
        
    }

    renderer.render(scene, camera);
}

animate();

// --- 8. Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});