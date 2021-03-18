import groupesInfos from './groupes.infos.js';
import { addCityMarker, airsIcons, citiesIcons, lacsIcons, map, removeMarker } from './map.js';
import { createElementFromHTML } from './utils/htmlToDom.js';

function createListing() {
    let airs = [];
    let lacs = [];
    let cities = [];

    const toShow = ['Orthez', 'Artix', 'Arthez de Béarn', 'Puyoo', 'Mourenx', 'Monein'];

    // Trie global par ordre alphabétique
    let villes = [];
    const listingAlphabeticOnly = document.querySelector('#listing').querySelector('ul');

    groupesInfos.forEach(groupe => {
        groupe.villes.forEach(ville => {
            villes.push(ville);
        })
    })

    villes.sort((a, b) => {
        let nameA = a.nom.toUpperCase();
        let nameB = b.nom.toUpperCase();
        return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
    })

    villes.forEach(ville => {
        listingAlphabeticOnly.appendChild(
            createElementFromHTML(`<li class="list-group-item" city="${ville.nom}" cp="${ville.cp}">${ville.nom}</li>`)
        )
        .addEventListener('click', liClickEvent);

        if(toShow.includes(ville.nom)) {
            addCityMarker(ville.nom, ville.cp)
            .then(marker =>updateList(ville.nom, ville.cp, marker));
        }

        // Airs de jeu
        ville.airs?.forEach(air => {
            let latLng = new L.LatLng(air[0], air[1]);
            let marker = new L.Marker(latLng, {
                icon: airsIcons
            });
            airs.push(marker);
        });

        // Lacs
        ville.lac?.forEach(lac => {
            let latLng = new L.LatLng(lac[0], lac[1]);
            let marker = new L.Marker(latLng, {
                icon: lacsIcons
            });
            lacs.push(marker);
        });

        // Cities
        ville.cities?.forEach(city => {
            let latLng = new L.LatLng(city[0], city[1]);
            let marker = new L.Marker(latLng, {
                icon: citiesIcons
            });
            cities.push(marker);
        })
    })

    let additionMarkerOverlay = {
        "Airs": L.layerGroup(airs),
        "Lacs": L.layerGroup(lacs),
        "Cities": L.layerGroup(cities)
    };

    L.control.layers(null, additionMarkerOverlay).addTo(map);
}

function liClickEvent(event) {
    const element = event.target;
    const ville = element.innerHTML;
    const cp = element.getAttribute('cp');

    if(!cp) throw "L'élément est invalide !";

    if(element.marker) {
        removeMarker(element.marker);
        updateList(element.innerHTML, cp, null);
        return;
    }

    addCityMarker(ville, cp)
    .then(marker => {
        element.marker = marker;
        marker.addEventListener("click", (e) => {

        })
        updateList(element.innerHTML, cp, element.marker);
    })
}

function updateList(city, cp, marker) {
    let matchingElements = document.querySelectorAll(`li.list-group-item[cp="${cp}"][city="${city}"]`);

    matchingElements.forEach(element => {
        if(!marker) {
            delete element.marker;
            element.classList.remove('active');
        }
        else {
            element.marker = marker;
            element.classList.add('active');
        }
    });
}

export {
    createListing,
    updateList
}