var map = L.map('map').setView([48.8534, 2.3488], 13);
	  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
}).addTo(map);

// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.scrollWheelZoom.disable();
// map.boxZoom.disable();
// map.keyboard.disable();
document.querySelector(".leaflet-control-zoom").style.display = 'none';

let arrayOfLatLngs = [];

/**
 * Utilisation des groupes distant
 */
groupes.forEach((groupe, groupeIndex) => {
    let promises = [];

    let color = '#' + groupe.color;

    groupe.villes.forEach(ville => {
        ville.nom = ville.nom.replaceAll(' ', '%20').replaceAll('é', '%C3%A9');
        promises.push(fetch(`https://geo.api.gouv.fr/communes?nom=${ville.nom}&codePostal=${ville.cp}&format=geojson&geometry=contour`))
    })

    Promise.all(promises)
    .then(response => {
        let promiseResponseJson = [];
        response.forEach(res => {
            promiseResponseJson.push(res.json());
        })

        Promise.all(promiseResponseJson)
        .then(jsonArray => {
            let geoJson = jsonArray[0].features[0];
            jsonArray.forEach((json, index) => {
                if(!index) return;
                if(json.features[0]) {
                    // Utilisation de turf union pour fusionner les geoJson
                    geoJson = turf.union(geoJson, json.features[0]);
                }
            })

            let mapGeo = L.geoJson(geoJson, {
                color
            }).addTo(map);

            // Center
            arrayOfLatLngs.push(mapGeo.getBounds());

            if(groupeIndex == groupes.length - 1) {
                let bounds = new L.LatLngBounds(arrayOfLatLngs);
                map.fitBounds(bounds);
            }
        })
    })
})


/**
 * Utilisation des groupes locaux
 */
// groupesLocaux.forEach(groupe => {
//     const color = '#' + groupe.match(/^.*-(.*).geojson$/i)[1];

//     fetch(groupe)
//     .then(response => response.json())
//     .then(json => {
//         let mapGeo = L.geoJson(json, {
//             color
//         }).addTo(map);

//         arrayOfLatLngs.push(mapGeo.getBounds());

//         let bounds = new L.LatLngBounds(arrayOfLatLngs);
//         map.fitBounds(bounds);
//     })
// })