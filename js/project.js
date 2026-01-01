const myProjects = [
    {
        title: "Analyse de Données - US Midterm Elections 2018",
        description: "Dans le cadre de ce projet d'analyse de données réalisé en binôme, nous avons exploré les résultats des élections américaines de mi-mandat de 2018 pour la Chambre des représentants. Notre objectif était de transformer un jeu de données brut et complexe en visualisations claires pour comprendre les dynamiques électorales des États-Unis. Ce travail a nécessité une phase majeure de 'Data Cleansing' avec Python (Pandas) pour traiter les valeurs manquantes et harmoniser les identifiants géographiques (FIPS) avant de pouvoir exploiter les 174 millions de votes estimés.<br><br><strong>Les axes majeurs de notre analyse sont les suivants :</strong><br>• <strong>Répartition Globale (Sunburst) :</strong> Nous avons mis en évidence une forte abstention (environ 1/3 des électeurs) et une polarisation extrême du paysage politique entre Démocrates et Républicains.<br>• <strong>Fracture Ville vs Campagne :</strong> Nos graphiques comparatifs révèlent une scission nette : les métropoles comme New York ou Los Angeles sont des bastions démocrates, tandis que les zones rurales (petites villes du Texas ou du Nebraska) votent massivement républicain.<br>• <strong>Géographie & Lieux de vote :</strong> Au-delà des cartes électorales classiques (Côtes bleues vs Centre rouge), nous avons analysé sémantiquement les noms des bureaux de vote pour découvrir que les écoles et les églises constituent les principales infrastructures de vote aux États-Unis.",
        highlights: [
            "Nettoyage de données massives (174M+ votes) et gestion des incohérences (FIPS codes, doublons).",
            "Visualisation 3D avancée avec PyDeck : Cartographie en relief selon le volume de votes par comté.",
            "Analyse textuelle pour la classification automatique des lieux de vote (Écoles, Églises, Casernes).",
            "Comparaison sociologique : Analyse des tendances de vote selon la densité de population (Urbain vs Rural).",
            "Création de tableaux de bord interactifs avec Plotly (Sunburst, Funnel Area, Cartes Choroplèthes)."
        ],
        tech: ["Python", "Pandas", "Plotly", "PyDeck", "Harvard Dataverse"],
        interactiveMap: "maps/carte_US_par_etat.html",
        type: "iframe",
        buttonText: "Voir la visualisation 3D",
        imageText: "Cartes interactives 3D disponibles",
        githubLink: "#"
    },
    {
        title: "Application Android - Suite de Mini-Jeux Compétitifs",
        description: "Dans le cadre de ce projet semestriel, nous avons travaillé en équipe de trois pour concevoir et développer une application Android. L'objectif pédagogique était de maîtriser l'environnement Android Studio tout en proposant une expérience ludique permettant à deux utilisateurs de s'affronter sur le même appareil. Nous avons structuré le projet autour d'une 'Fenêtre Principale' gérant les profils et la centralisation des scores, assurant ainsi la persistance des données entre les parties. Ce développement a constitué un véritable défi technique, notamment concernant l'ergonomie de l'interface en écran scindé (face-à-face) et la gestion rigoureuse du code collaboratif sous Git.<br><br><strong>Les règles des mini-jeux sont les suivantes :</strong><br>• <strong>Duel de Tap :</strong> Une épreuve de vitesse pure. Vous devez tapoter votre zone le plus rapidement possible. Chaque action inflige des dégâts à l'adversaire ; le premier dont la barre de vie atteint zéro perd la manche.<br>• <strong>Jeu de la Taupe :</strong> Un test de réflexes et de précision. Des cibles apparaissent aléatoirement pendant 30 secondes. Vous marquez un point en les touchant, mais une erreur de ciblage vous pénalise. La réactivité est primordiale.<br>• <strong>Simon :</strong> Un duel de mémoire séquentielle. À tour de rôle, vous devez reproduire une série de couleurs qui se complexifie à chaque étape. La moindre erreur offre le point à votre adversaire.",
        highlights: [
            "Architecture Étoile : Une MainActivity centrale distribue les données (Noms, Scores) vers les sous-activités de jeu.",
            "3 modes de jeu implémentés : 'Tap Battle' (Rapidité/Barre de vie), 'Mole Game' (Réflexes/Aléatoire) et 'Simon' (Mémoire séquentielle).",
            "Interface UI symétrique/inversée (LinearLayout) optimisée pour le face-à-face sur un seul téléphone.",
            "Travail collaboratif sous Git : Gestion des conflits de fusion et versionnement en équipe."
        ],
        tech: ["Java", "Android Studio", "XML Layouts", "Git"],
        interactiveMap: "assets/demo_game.mp4", 
        type: "video",
        buttonText: "Voir la démo vidéo",
        imageText: "Voir le gameplay (3 jeux)",
        githubLink: "" 
    },
    {
        title: "Smart FARM - Domotique Embarquée sur STM32",
        description: "Ce projet de systèmes embarqués (Microprocesseurs avancés), réalisé en binôme, visait à concevoir une maquette de ferme connectée entièrement autonome pilotée par un microcontrôleur STM32. L'objectif était d'automatiser la gestion de l'environnement agricole (climat, sécurité, accès) en exploitant les périphériques matériels de bas niveau sans OS. Nous avons développé une architecture logicielle modulaire en C capable de gérer des interruptions temps réel et de multiples protocoles de communication.<br><br><strong>Fonctionnalités clés implémentées :</strong><br>• <strong>Régulation Climatique (THCS) :</strong> Lecture I2C d'un capteur AHT20 (Temp/Hum). Si la température dépasse 24°C, un ventilateur s'active avec une vitesse proportionnelle à la température (PWM sur Timer 10).<br>• <strong>Sécurité & Alarme :</strong> Détection d'intrusion par capteur PIR via interruption externe (EXTI) déclenchant une alarme sonore (Buzzer) et visuelle.<br>• <strong>Smart Feeding & Accès :</strong> Une trappe motorisée (Servomoteur) s'ouvre/ferme intelligemment selon l'humidité (ADC Pluie) ou la commande manuelle, avec une sécurité anti-pincement par ultrasons (Timer 4).<br>• <strong>Monitoring :</strong> Affichage en temps réel des constantes sur écran LCD I2C et journalisation via liaison série UART.",
        highlights: [
            "Programmation bas niveau en C sur STM32 (Gestion directe des registres et HAL).",
            "Mise en œuvre des protocoles de communication série : I2C (Capteurs, LCD) et UART (Debug).",
            "Gestion avancée des Timers : PWM pour servomoteurs/ventilateurs et mesure de signal (Ultrasons).",
            "Acquisition de données : ADC multi-canaux (Luminosité, Pluie) et interruptions matérielles (EXTI).",
            "Logique de contrôle-commande : Asservissement proportionnel et machines à états."
        ],
        tech: ["C / C++", "STM32", "CubeIDE", "I2C / UART / PWM", "Hardware"],
        interactiveMap: "assets/thumbnails/femre.jpg",
        type: "image",
        buttonText: "Voir la maquette",
        imageText: "Photo du montage disponible",
        githubLink: ""
    },
    {
        title: "Robot Mobile Autonome - Navigation & Labyrinthe",
        description: "Dans le cadre de ce projet de robotique mobile, nous avons conçu et programmé un robot capable de naviguer de manière autonome dans un labyrinthe et d'en sortir en moins de 3 minutes. Basé sur une architecture Arduino (ATmega328P), le système repose sur une fusion de capteurs (infrarouges latéraux et capteur à ultrasons frontal) pour cartographier son environnement immédiat et prendre des décisions de trajectoire en temps réel.<br><br><strong>Défis techniques relevés :</strong><br>• <strong>Asservissement Moteur :</strong> Génération de signaux PWM précis (50Hz) via Timer Hardware pour piloter les servomoteurs à rotation continue.<br>• <strong>Détection Réactive :</strong> Utilisation d'interruptions externes pour les capteurs IR (réaction immédiate aux murs) et mesure de temps de vol par Timer pour l'ultrason.<br>• <strong>Algorithme de sortie :</strong> Implémentation d'une machine à états finis robuste gérant les cas complexes (impasse, couloir, intersection).<br><br><strong>🏆 Récompense :</strong><br>Ce projet a reçu le <strong>Certificat de Mérite</strong> pour avoir développé le robot avec le <strong>meilleur algorithme d'évitement d'obstacles</strong> de la promotion.<br><br><img src=\"assets/certificat.jpg\" alt=\"Certificat de Mérite\" style=\"width:100%; max-width:500px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1); border:1px solid #eee; margin-top:10px;\">",
        highlights: [
            "Programmation sur microcontrôleur (Registres, Timers, Interruptions).",
            "Algorithme de navigation autonome (Mur gauche/droit, détection d'impasses).",
            "Traitement du signal : Filtrage des données capteurs et gestion des rebonds.",
            "Optimisation du temps de réponse : Architecture pilotée par interruptions.",
            "Conception modulaire, création de librairies dédiées (moteur.h, ir.h, ultrasons.h)."
        ],
        tech: ["C / C++", "Arduino", "Robotique", "PWM / Timers", "Algorithmes"],
        interactiveMap: "assets/voiture.mp4",
        type: "video",
        buttonText: "Voir le robot en action",
        imageText: "Démo vidéo & Certificat",
        githubLink: ""
    }
];