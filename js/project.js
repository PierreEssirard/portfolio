const myProjects = [
    {
        title: "Data Analyse - US Midterm Elections 2018",
        description: "Dans le cadre de ce projet d'analyse de données réalisé en binôme, nous avons exploré les résultats des élections américaines de mi-mandat de 2018 pour la Chambre des représentants. Notre objectif était de transformer un jeu de données brut et complexe en visualisations claires pour comprendre les dynamiques électorales des États-Unis. Ce travail a nécessité une phase majeure de 'Data Cleansing' avec Python (Pandas) pour traiter les valeurs manquantes et harmoniser les identifiants géographiques (FIPS) avant de pouvoir exploiter les 174 millions de votes estimés.<br><br><strong>Les axes majeurs de notre analyse sont les suivants :</strong><br>• <strong>Répartition Globale (Sunburst) :</strong> Nous avons mis en évidence une forte abstention (environ 1/3 des électeurs) et une polarisation extrême du paysage politique entre Démocrates et Républicains.<br>• <strong>Fracture Ville vs Campagne :</strong> Nos graphiques comparatifs révèlent une scission nette : les métropoles comme New York ou Los Angeles sont des bastions démocrates, tandis que les zones rurales (petites villes du Texas ou du Nebraska) votent massivement républicain.<br>• <strong>Géographie & Lieux de vote :</strong> Au-delà des cartes électorales classiques (Côtes bleues vs Centre rouge), nous avons analysé sémantiquement les noms des bureaux de vote pour découvrir que les écoles et les églises constituent l'infrastructure principale du vote américain.",
        highlights: [
            "Nettoyage de données massives (174M+ votes) et gestion des incohérences (FIPS codes, doublons).",
            "Visualisation 3D avancée avec PyDeck : Cartographie en relief selon le volume de votes par comté.",
            "Analyse textuelle pour la classification automatique des lieux de vote (Écoles, Églises, Casernes).",
            "Comparaison sociologique : Analyse des tendances de vote selon la densité de population (Urban vs Rural).",
            "Création de tableaux de bord interactifs avec Plotly (Sunburst, Funnel Area, Cartes Choroplèthes)."
        ],
        tech: ["Python", "Pandas", "Plotly", "PyDeck", "Harvard Dataverse"],
        interactiveMap: "maps/carte_US_par_etat.html",
        type: "iframe",
        buttonText: "Voir la visualisation 3D",
        imageText: "📊 Cartes interactives 3D disponibles",
        githubLink: "#"
    },
    {
        title: "Application Android - Suite de Mini-Jeux Compétitifs",
        description: "Dans le cadre de ce projet semestriel, nous avons travaillé en équipe de trois pour concevoir et développer une application Android native complète. L'objectif pédagogique était de maîtriser l'environnement Android Studio tout en proposant une expérience ludique permettant à deux utilisateurs de s'affronter sur le même appareil. Nous avons structuré le projet autour d'une 'Fenêtre Principale' gérant les profils et la centralisation des scores, assurant ainsi la persistance des données entre les parties. Ce développement a constitué un véritable défi technique, notamment concernant l'ergonomie de l'interface en écran scindé (face-à-face) et la gestion rigoureuse du code collaboratif sous Git.<br><br><strong>Les règles des mini-jeux sont les suivantes :</strong><br>• <strong>Duel de Tap :</strong> Une épreuve de vitesse pure. Vous devez solliciter votre personnage le plus rapidement possible. Chaque action inflige des dégâts à l'adversaire ; le premier dont la barre de vie atteint zéro perd la manche.<br>• <strong>Jeu de la Taupe :</strong> Un test de réflexes et de précision. Des cibles apparaissent aléatoirement pendant 30 secondes. Vous marquez un point en les touchant, mais une erreur de ciblage vous pénalise. La réactivité est primordiale.<br>• <strong>Simon :</strong> Un duel de mémoire séquentielle. À tour de rôle, vous devez reproduire une série de couleurs qui se complexifie à chaque étape. La moindre erreur offre le point à votre adversaire.",
        highlights: [
            "Architecture Étoile : Une Main Activity centrale distribue les données (Noms, Scores) vers les sous-activités de jeu.",
            "3 modes de jeu implémentés : 'Tap Battle' (Rapidité/Barre de vie), 'Mole Game' (Réflexes/Aléatoire) et 'Simon' (Mémoire séquentielle).",
            "Interface UI symétrique/inversée (LinearLayout) optimisée pour le face-à-face sur un seul téléphone.",
            "Logique algorithmique : Gestion de boucles temporelles (Threads/Handlers) et génération procédurale des séquences.",
            "Travail collaboratif sous Git : Gestion des conflits de fusion et versionnement en équipe."
        ],
        tech: ["Java", "Android Studio", "XML Layouts", "Git", "Design Patterns"],
        
        // Configuration Vidéo
        interactiveMap: "assets/demo_game.mp4", 
        type: "video",
        buttonText: "Voir la démo vidéo",
        imageText: "▶️ Voir le gameplay (3 jeux)",
        githubLink: "" 
    }
];