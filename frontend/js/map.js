import groupesLocaux from './groupes.border.js';

let map = null;

function createMap() {
    map = L.map('map', {
        zoomSnap: 0.1
    }).setView([48.8534, 2.3488], 10.7);
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(map);

    let arrayOfLatLngs = [];

    disableMoving();

    /**
    * Utilisation des groupes locaux
    */
    groupesLocaux.forEach((groupe, index) => {
        const color = '#' + groupe.url.match(/^.*-(.*).geojson$/i)[1];

        fetch(groupe.url)
        .then(response => response.json())
        .then(json => {
            let mapGeo = L.geoJson(json, {
                color
            }).addTo(map);

            const content = `
                <div style="text-align: center">
                    Equipe <span style="font-weight: bold; color: ${ color }; text-decoration: underline">${ groupe.name }</span>
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

            let bounds = new L.LatLngBounds(arrayOfLatLngs);
            //map.fitBounds(bounds).setZoom(10.6);
            map.setView(bounds.getCenter(), 10.7);
        });
    });
}

function tooltipZoneClick(event, groupe, color) {
    console.log(
        `%c Vous avez cliquez sur l'équipe %c${ groupe.name }`,
        `color: #000`,
        `font-weight: bold; color: ${ color }; text-decoration: underline`
    );

    // TODO: Redirection
}

function disableMoving() {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    document.querySelector(".leaflet-control-zoom").style.display = 'none';
}

function addMarker(lat, lon, color) {
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
        `
    })

    let latLng = new L.LatLng(lat, lon);
    let marker = new L.Marker(latLng, {
        icon: icon
    }).addTo(map);

    // TODO: open swall on click

    return marker;
}

function removeMarker(marker) {
    if(!marker) throw 'Marker invalide !';

    map.removeLayer(marker);
}

function addCityMarker(city, cp) {
    return new Promise((resolve, reject) => {
        fetch(`https://api-adresse.data.gouv.fr/search/?q=${city.replaceAll(' ', '%20').replaceAll('é', '%C3%A9')}&type=municipality&postcode=${cp}&autocomplete=1`)
        .then(response => response.json())
        .then(json => {
            if(!json.features.length) throw 'Nom de commune inconnu !';
    
            let coordinates = json.features[0].geometry.coordinates;
    
            resolve(addMarker(coordinates[1], coordinates[0], null));
        })
        .catch(error => reject(error));
    })
}

export {
    createMap,
    addMarker,
    removeMarker,
    addCityMarker
}