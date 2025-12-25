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

// Fonction de mise à jour responsive de l'avion
function updateRafaleResponsive() {
    if (!rafale) return;

    if (window.innerWidth < 768) {
        // --- MOBILE ---
        // Avion tout petit et en haut
        rafale.scale.set(0.25, 0.25, 0.25);
    } else {
        // --- DESKTOP ---
        // Taille normale
        rafale.scale.set(0.6, 0.6, 0.6);
    }
}

// Éléments du DOM pour le loader
const globalLoader = document.getElementById('global-loader');
const progressBar = document.getElementById('progress-bar');
const progressPlane = document.getElementById('progress-plane');
const loadingText = document.getElementById('loading-text');

// États de chargement
let isModelLoaded = false;
let isTimeElapsed = false;

// --- LOGIQUE MINUTERIE 5 SECONDES ---
const duration = 2000; 
const intervalTime = 50; 
const step = 100 / (duration / intervalTime); 
let currentProgress = 0;

const timer = setInterval(() => {
    currentProgress += step;
    if (currentProgress >= 100) {
        currentProgress = 100;
        isTimeElapsed = true;
        clearInterval(timer); 
        checkLoadComplete();  
    }
    updateLoaderUI(currentProgress);
}, intervalTime);

function updateLoaderUI(percent) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPlane) progressPlane.style.left = `${percent}%`;
    if (loadingText) loadingText.innerText = `Initialisation des systèmes... ${Math.round(percent)}%`;
}

function checkLoadComplete() {
    if (isModelLoaded && isTimeElapsed) {
        if (globalLoader) {
            setTimeout(() => {
                globalLoader.classList.add('fade-out');
            }, 500); 
        }
    }
}

// --- CHARGEMENT RÉEL THREE.JS ---
const loader = new GLTFLoader();

loader.load(
    'dassault_rafale.glb', 
    (gltf) => {
        rafale = gltf.scene;
        
        // Appliquer la configuration initiale
        updateRafaleResponsive();
        rafale.position.set(4, 0, 0); 
        rafale.rotation.y = 1; 
        rafale.rotation.x = 1; 
        rafale.rotation.z = 0;

        scene.add(rafale);

        isModelLoaded = true;
        checkLoadComplete(); 
    },
    undefined,
    (error) => {
        console.error('Erreur chargement modèle:', error);
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
        const floatingY = Math.sin(time * 1.2) * 0.08;

        if (window.innerWidth < 768) {
            // --- MOBILE : FIXE AU DESSUS DU NOM ---
            // On le place assez haut (y = 1.6) et centré (x = 0)
            rafale.position.y = 1.6 + floatingY;
            rafale.position.x = 0; 
            
            // Rotation spécifique pour bien le voir de face/dessous
            rafale.rotation.y = 0; 
            rafale.rotation.x = 0.4; // Légèrement cabré
            rafale.rotation.z = Math.sin(time * 0.5) * 0.1; // Léger roulis
        } else {
            // --- DESKTOP : TRAVERSÉE NORMALE ---
            rafale.position.y = floatingY - 0.2; 
            rafale.position.x = 4 - (scrollY * 0.015);
            rafale.rotation.y = 0; 
            rafale.rotation.x = 0;
            rafale.rotation.z = 0;
        }
    }

    renderer.render(scene, camera);
}

animate();

// --- 8. Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateRafaleResponsive();
});