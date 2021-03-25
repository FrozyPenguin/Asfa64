import groupesLocaux from './groupes.border.js';
import groupesInfos from './groupes.infos.js';

let map = null;

/**
 * Créer la carte sur la page principal et ajoute les grosses bordures
 */
function createMap() {
    map = L.map('map', {
        zoomSnap: 0.1
    }).setView([48.8534, 2.3488], 10.7);
        L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    let arrayOfLatLngs = [];

    disableMoving();

    let scaleCnt = 0;

    /**
    * Utilisation des groupes locaux
    */
    groupesLocaux.forEach((groupe) => {
        const color = '#' + groupe.url.match(/^.*-(.*).geojson$/i)[1];

        axios.get(groupe.url)
        .then(json => {
            json = json.data;
            let mapGeo = L.geoJson(json, {
                color
            }).addTo(map);

            const content = `
            <div style="text-align: center">
                <span style="font-weight: bold; color: ${ color }; text-decoration: underline">${ groupe.name }</span>
                </br>
                Cliquez pour en savoir plus !
            </div>
            `;

            mapGeo.bindTooltip(content, {
                sticky: true,
                interactive: true,
                opacity: 1
            });

            mapGeo.on('click', (event) => tooltipZoneClick(event, groupe, color));

            arrayOfLatLngs.push(mapGeo.getBounds());
            //map.fitBounds(bounds).setZoom(10.6);
            scaleCnt++;

            if(scaleCnt == groupesLocaux.length) {
                let bounds = new L.LatLngBounds(arrayOfLatLngs);
                map.setView(bounds.getCenter(), 10.7);
                map.fitBounds(bounds);
            }
        });
    });
}

/**
 * Evènement déclencher lors du clique sur une zone
 * C'est cette fonction qui vient créer le popup et ajouter la carte à l'intérieur
 * @param {*} event
 * @param {Object} groupe Données JSON corespondante a la zone
 * @param {String} color Couleur de la zone correspondante
 */
function tooltipZoneClick(event, groupe, color) {
    // Création de map
    Swal.fire({
        title: `<strong>${groupe.name}</strong>`,
        html: `<div id="swallMap" class="map" style="width: 40vw; height: 60vh"></div>`,
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
        focusConfirm: false,
        didOpen: (popupDom) => {
            let swalMap = L.map('swallMap', {
                zoomSnap: 0.1
            }).setView([48.8534, 2.3488], 10.7);
                L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            }).addTo(swalMap);

            // Désactivation de la carte du popup de zone pour la rendre statique
            swalMap.dragging.disable();
            swalMap.touchZoom.disable();
            swalMap.doubleClickZoom.disable();
            swalMap.scrollWheelZoom.disable();
            swalMap.boxZoom.disable();
            swalMap.keyboard.disable();
            popupDom.querySelector(".leaflet-control-zoom").style.display = 'none';

            // Tracer le contour
            axios.get(`groupes/Groupe-${color.replaceAll('#', '').toUpperCase()}.geojson`)
            .then(json => {
                json = json.data;
                let mapGeo = L.geoJson(json, {
                    color
                }).addTo(swalMap);

                let bounds = new L.LatLngBounds([mapGeo.getBounds()]);
                swalMap.setView(bounds.getCenter(), 10.9);
                swalMap.fitBounds(bounds);
            });

            let groupeVilles = groupesInfos.filter(groupeInfo => groupeInfo.color == groupe.url.match(/^.*-(.*).geojson$/i)[1]);

            if(!groupeVilles.length) throw `Le groupe n'existe pas !`;

            // Ajoute les marker
            groupeVilles[0].villes.forEach(ville => {
                const icon = L.divIcon({
                    className: "customMarker",
                    iconAnchor: [0, 24],
                    labelAnchor: [-6, 0],
                    popupAnchor: [0, -36],
                    html: `
                    <div style="background-color: ${color};" class="marker-pin-zoom">
                    </div>
                    <span class="marker-label" style="font-size: .6rem; top:250%">${ville.nom}</span>
                    `
                })

                let latLng = new L.LatLng(ville.coordinates[1], ville.coordinates[0]);
                let marker = new L.Marker(latLng, {
                    icon: icon
                }).addTo(swalMap);

                marker.addEventListener("click", () => {
                    window.location.href = `citycard.html?citycode=${ville.citycode}&c=${parseInt(color.replace('#', ''), 16) * (20*50+9-8/2)}`;
                });
            })
        }

    })
}

/**
 * Désactivation de certain control au niveau de la carte principal
 * Peut être supprimé sans impact
 */
function disableMoving() {
    // map.dragging.disable();
    // map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    // document.querySelector(".leaflet-control-zoom").style.display = 'none';
    document.querySelector(".leaflet-control-zoom").parentElement.style.top = '4em';
}

/**
 * Créer un marker et l'ajoute à la carte
 * @param {*} lat Latitude où placer le marker
 * @param {*} lon Longitude où placer le marker
 * @param {*} name Le nom associé au marker (affiché en dessous de celui-ci)
 * @param {*} color La couleur de fond du market
 * @returns Le marker nouvellement crée
 */
function addMarker(lat, lon, name, color) {
    if(!map) throw 'Carte non existante !';

    if(isNaN(lat) || isNaN(lon))
    return

    const icon = L.divIcon({
        className: "customMarker",
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `
        <div style="background-color: ${color}" class="marker-pin">
        </div>
        <span class="marker-label">${name}</span>
        `
    })

    let latLng = new L.LatLng(lat, lon);
    let marker = new L.Marker(latLng, {
        icon: icon
    }).addTo(map);

    return marker;
}

/**
 * Supprime un markeur donnée de la carte
 * @param {*} marker le markeur à supprimer
 */
function removeMarker(marker) {
    if(!marker) throw 'Marker invalide !';

    map.removeLayer(marker);
}

/**
 * Ajoute un markeur sur une ville donnée à partir des informations stockées dans les fichiers
 * @param {String} city Nom de la ville
 * @param {String} cp Code postal de la ville
 * @returns Markeur nouvellement créé
 */
function addCityMarker(city, cp) {
    return new Promise((resolve, reject) => {
        let findVille = null;
        groupesInfos.forEach(groupe => {
            groupe.villes.forEach(ville => {
                if(ville.nom === city && ville.cp === cp) findVille = ville;
            })
        })

        if(!findVille) reject('Inconnu');
        resolve(addMarker(findVille.coordinates[1], findVille.coordinates[0], city, null));
    })
}

/**
 * Déclaration des markeurs correspondant aux disponibilité public (aires de jeux, lacs, city stade)
 */
let airsIcons = L.divIcon({
    className: "customMarker",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `
    <div class="marker-pin airsMarker">
    </div>
    `
})

let lacsIcons = L.divIcon({
    className: "customMarker",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `
    <div class="marker-pin lacsMarker">
    </div>
    `
})

let citiesIcons = L.divIcon({
    className: "customMarker",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `
    <div class="marker-pin citiesMarker">
    </div>
    `
})

export {
    createMap,
    addMarker,
    removeMarker,
    addCityMarker,
    map,
    citiesIcons,
    lacsIcons,
    airsIcons
}