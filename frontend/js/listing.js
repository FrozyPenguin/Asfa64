import groupesInfos from './groupes.infos.js';
import { addCityMarker, airsIcons, citiesIcons, lacsIcons, map, removeMarker } from './map.js';
import { createElementFromHTML } from './utils/htmlToDom.js';

/**
 * Créer la liste à coté de la carte
 */
function createListing() {
    let airs = [];
    let lacs = [];
    let cities = [];

    // Villes à afficher au chargement de la page
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
        '<svg class="icons" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-tree" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 13l-2 -2" /><path d="M12 12l2 -2" /><path d="M12 21v-13" /><path d="M9.824 15.995a3 3 0 0 1 -2.743 -3.69a2.998 2.998 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a2.997 2.997 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h.001h-4z" /></svg>Aires de jeux': L.layerGroup(airs),
        '<svg class="icons" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-droplet" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.8 11a6 6 0 1 0 10.396 0l-5.197 -8l-5.2 8z" /></svg>Lacs': L.layerGroup(lacs),
        '<svg class="icons" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-ball-football" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9" /><path d="M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55z" /><path d="M12 7v-4m3 13l2.5 3m-.74 -8.55l3.74 -1.45m-11.44 7.05l-2.56 2.95m.74 -8.55l-3.74 -1.45" /></svg>City stade': L.layerGroup(cities)
    };

    // Cadre en haut à droite de la carte
    L.control.layers(null, additionMarkerOverlay, { collapsed: false }).addTo(map);
}

/**
 * Evenement déclenché lors d'un clique sur la liste à coté de la carte
 * @param {*} event
 * @returns
 */
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
        updateList(element.innerHTML, cp, element.marker);
    })
}

/**
 * Mets à jour la liste en fonction des markers sur la carte
 * @param {*} city Nom de la ville
 * @param {*} cp code postal de la ville
 * @param {*} marker Parametre optionnel correspondant au marker sur la carte à titre d'identification. Non définie si le marker doit être supprimé.
 */
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