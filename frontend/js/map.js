var map = L.map('map').setView([48.8534, 2.3488], 13);
	  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
}).addTo(map);

map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
document.querySelector(".leaflet-control-zoom").style.display = 'none';

let arrayOfLatLngs = [];

/**
 * Utilisation des groupes locaux
 */
groupesLocaux.forEach(groupe => {
    const color = '#' + groupe.match(/^.*-(.*).geojson$/i)[1];

    fetch(groupe)
    .then(response => response.json())
    .then(json => {
        let mapGeo = L.geoJson(json, {
            color
        }).addTo(map);

        arrayOfLatLngs.push(mapGeo.getBounds());

        let bounds = new L.LatLngBounds(arrayOfLatLngs);
        map.fitBounds(bounds);
    });
});