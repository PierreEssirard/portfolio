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

// --- 5. Chargement du Modèle ---
let rafale;
const baseScale = 0.6; 

// Départ à DROITE (positif)
const startPositionX = 4; 

const loader = new GLTFLoader();
loader.load(
    'dassault_rafale.glb', 
    (gltf) => {
        rafale = gltf.scene;
        
        rafale.scale.set(baseScale, baseScale, baseScale);
        rafale.position.set(startPositionX, 0, 0); 
        
        // --- ORIENTATION VERS LA GAUCHE (CORRECTION) ---
        // On inverse la rotation : 0 au lieu de Math.PI
        // Cela devrait faire pointer le nez vers la gauche
        rafale.rotation.y = 1; 
        
        rafale.rotation.x = 1; // Légère inclinaison
        rafale.rotation.z = 0;

        scene.add(rafale);
    },
    undefined,
    (error) => {
        console.error('Erreur chargement modèle:', error);
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
        // Le mouvement reste le même : il part de la droite et va vers la gauche
        rafale.position.x = startPositionX - (scrollY * 0.015);
        
        // --- C. Rotation sur lui-même (Effet Tonneau / Roulis) ---
        // On conserve l'orientation Y vers la gauche
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