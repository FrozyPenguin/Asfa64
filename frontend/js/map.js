import groupesLocaux from './groupes.border.js';
import groupesInfos from './groupes.infos.js';

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

        axios.get(groupe.url)
        .then(json => {
            json = json.data;
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
        `%c Vous avez cliqué sur l'équipe %c${ groupe.name }`,
        `color: #000`,
        `font-weight: bold; color: ${ color }; text-decoration: underline`
    );

    // Création de map
    Swal.fire({
        title: `<strong>Zone ${groupe.name}</strong>`,
        html: `<div id="swallMap" class="map" style="width: 40vw; height: 60vh"></div>`,
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
        focusConfirm: false,
        didOpen: (popupDom) => {
            let swalMap = L.map('swallMap', {
                zoomSnap: 0.1
            }).setView([48.8534, 2.3488], 10.7);
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            }).addTo(swalMap);

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
                //map.fitBounds(bounds).setZoom(10.6);
                swalMap.setView(bounds.getCenter(), 10.9);
            });

            let groupeVilles = groupesInfos.filter(groupeInfo => groupeInfo.nom == groupe.name);

            if(!groupeVilles.length) throw `Le groupe n'existe pas !`;

            let markerPromises = [];
            // Ajoute les marker
            groupeVilles[0].villes.forEach(ville => {
                let city = ville.nom.replaceAll(' ', '-').replaceAll('é', '%C3%A9');
                markerPromises.push(axios.get(`https://api-adresse.data.gouv.fr/search/?q=${city}&type=municipality&postcode=${ville.cp}&autocomplete=1`));
            })

            Promise.all(markerPromises)
            .then(responseArray => {
                responseArray.forEach(({ data }) => {
                    let json = data;
                    if(!json.features.length) throw 'Nom de commune inconnu !';

                    const icon = L.divIcon({
                        className: "customMarker",
                        iconAnchor: [0, 24],
                        labelAnchor: [-6, 0],
                        popupAnchor: [0, -36],
                        html: `
                        <div style="background-color: ${color};" class="marker-pin-zoom">
                        </div>
                        <span class="marker-label" style="font-size: .6rem; top:250%">${json.features[0].properties.name}</span>
                        `
                    })

                    let coordinates = json.features[0].geometry.coordinates;

                    let latLng = new L.LatLng(coordinates[1], coordinates[0]);
                    let marker = new L.Marker(latLng, {
                        icon: icon
                    }).addTo(swalMap);

                    marker.addEventListener("click", () => {
                        axios.get(`https://etablissements-publics.api.gouv.fr/v3/communes/${json.features[0].properties.citycode}/mairie`)
                        .then(json => {
                            json = json.data.features[0].properties;

                            Swal.fire({
                                title: '<strong>Ressources</strong>',
                                html:
                                `
                                <div class="row" style="min-width: 30vw">
                                    <div class="col-sm-12 col-md-7 text-start">
                                        <h2> ${ json.adresses[0].commune }</h2>
                                        <h4>Associations :</h4>
                                        <p> TODO : Mettre coord </p>
                                        <p>Dispositif Public (TODO)</p>
                                        <p>Infrastructure (TODO)</p>
                                    </div>
                                    <div class="coordMairie col-sm-12 col-md-5 text-start">
                                        <hr class="d-md-none" />
                                        <p>Mairie :</p>
                                        <p><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>${ json.telephone }</p>
                                        <p><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>${ json.email }</p>
                                        <p><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg><a href="${ json.url }">Site</a></p>
                                    </div>
                                </div>
                                `,
                                showCloseButton: true,
                                showCancelButton: false,
                                showConfirmButton: false,
                                focusConfirm: false
                            })
                        })
                        .catch(error => {
                            throw error;
                        })
                    });
                })
            })
            .catch(error => {
                throw error;
            })
        }

    })
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

function removeMarker(marker) {
    if(!marker) throw 'Marker invalide !';

    map.removeLayer(marker);
}

function addCityMarker(city, cp) {
    return new Promise((resolve, reject) => {
        axios.get(`https://api-adresse.data.gouv.fr/search/?q=${city.replaceAll(' ', '%20').replaceAll('é', '%C3%A9')}&type=municipality&postcode=${cp}&autocomplete=1`)
        .then(json => {
            json = json.data;
            if(!json.features.length) throw 'Nom de commune inconnu !';

            let coordinates = json.features[0].geometry.coordinates;

            resolve(addMarker(coordinates[1], coordinates[0], city, null));
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