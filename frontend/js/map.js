import groupesLocaux from './groupes.local.js';

export default () => {
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
    groupesLocaux.forEach((groupe, index) => {
        const color = '#' + groupe.url.match(/^.*-(.*).geojson$/i)[1];

        fetch(groupe.url)
        .then(response => response.json())
        .then(json => {
            let mapGeo = L.geoJson(json, {
                color
            }).addTo(map);

            arrayOfLatLngs.push(mapGeo.getBounds());

            if(index === groupesLocaux.length - 1) {
                let bounds = new L.LatLngBounds(arrayOfLatLngs);
                map.fitBounds(bounds);
            }

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

            mapGeo.on('click', function(event) {
                console.log(
                    `%c Vous avez cliquez sur l'équipe %c${ groupe.name }`,
                    `color: #000`,
                    `font-weight: bold; color: ${ color }; text-decoration: underline`
                );

                // TODO: Redirection
            });
        });
    });
}