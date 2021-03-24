# Documentation concise de la réalisation

## Dépendance
Ce projet repose sur les librairie LeafletJS, Bootstrap, Axios et Sweet Alert 2 toute 4 actuellement inclus par CDN. Le code n'est bien entendu pas optimal dû fait du temps alloué.

## Fichier de données
Les données principales sont contenues dans des fichiers JS contenant des objets JS (donc facilement convertible en JSON) pour des raisons de simplicité dans le but d'éviter de faire trop de requêtes HTTP.

Ces fichiers sont au total de 3 contenu dans le dossier *frontend/js* :
* *groupes.border.js* contient les liens vers les fichiers contenant les bordures géographique au format GEOJSON de chaque zone ainsi que le nom des zones.
* *groupes.infos.js* contenant les différentes informations géographique des villes visitées par les stagiaires.
* *listeAssociations.js* contenant les informations de la carte d'identité de chaque ville.

En plus de ces 3 fichiers, 4 fichiers GEOJSON sont également présent pour tracer la bordure de chaque ville. Ces fichiers se trouves dans le dossier *frontend/groupes*. Leurs nom est formatté de sorte à avoir la couleur hexadécimal dans le nom du fichier pour des raisons de simplicité.

Les données sur les mairies (site, mail et téléphone) afficher sur la page de carte d'identité sont obtenu par l'API des établissement publics français fournie par le gouvernement.
En ce qui concerne les informations géographique des villes proviennent de la GéoAPI développer par le gouvernement. Pour des raisons d'instabilité aléatoire de l'api ainsi que pour éviter de faire une requête HTTP par ville, j'ai construit un petit script NodeJS disponible dans le dossier *Tools* dont l'utilisation et le fonctionnement sont disponible dans le paragraphe *Outils disponible*.

## Outils disponible
Les outils sont disponible dans le dossier *Tools*. Ils ont été construit construit avec NodeJS et le gestionnaire de paquet "Node Package Manager". De ce fait, toute les dépendances des scripts sont installable via la commande ***npm install***.

Ces outils sont au nombre de 2 :
* *getCoordinates.js* permettant d'obtenir les coordonnées villes, celles-ci n'étant pas censé bouger, ainsi que l'identifiant de ces villes (city code), nécessaire au fonctionnement de l'api des établissement publics. Les villes dont nous récupérons les coordonnées sont les villes du fichier *Tools/groupes.infos.js*. Ce script insère ensuite directement dans le fichier *frontend/js/groupes.infos.js* les informations récupérées.
* *mergeGeoGroup.js* permettant de créer les informations GEOJSON de la bordure des zones à partir des bordures des villes de chaque zone. Ce script crée directement nos 4 fichiers GEOJSON et les places dans le dossier *frontend/groupes* avec le bon nom de la forme ***"Groupe-COULEURHEXA.geojson"***. A cause de l'instabilité aléatoire de l'api utilisée (retournant aléatoirement une erreur 500), ce script peut ne pas aboutir à tout les coups et nécessite donc de temps en temps plusieurs lancement dans le but de générer l'intégralité des données. Cependant les fichiers ont déjà été générés et vous n'aurez donc pas besoin de vous en servir à moins qu'une ville ne soit ajouter dans une zone.

## Snowpack (optionnel)
Le projet est configuré pour pouvoir être obfusquer et minifier avec Snowpack via la commande _**npm run snowpack build**_. En plus de cela, un serveur de développement peut être lancé via la commande _**npm run snowpack dev**_. Une fois la commande build effectuée, le projet minifier est placé dans le dossier frontend/dist. Cette étape nécessite l'installation de Node JS et est parfaitement optionnel.