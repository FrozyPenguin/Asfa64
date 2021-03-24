import groupesInfos from './groupes.infos.js';
import { addCityMarker } from './map.js';
import { createElementFromHTML } from './utils/htmlToDom.js';
import { updateList } from './listing.js';

/**
 * Création de la barre de recherche des villes sur la carte
 */
function initSearchBox() {
    const searchBox = document.querySelector('#citySearchBox');
    const dataset = document.querySelector('#citiesList');
    const submitButton = document.querySelector('#search button[name="submit"]');

    groupesInfos.forEach(groupe => {
        groupe.villes.forEach(ville => {
            dataset.append(createElementFromHTML(`<option cp="${ville.cp}" value="${ville.nom}">`));
        });
    });

    submitButton.parentElement.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const datas = Array.from(dataset.options);

        const result = datas.filter(({ value }) => {
            return searchBox.value.toLowerCase() == value.toLowerCase();
        })

        if(result.length) {
            let matchingElements = document.querySelectorAll(`li.list-group-item[cp="${result[0].getAttribute('cp')}"][city="${result[0].value}"]`);
            if(matchingElements.length) {
                let markerExist = Array.from(matchingElements).filter(element => element.marker);
                if(!markerExist.length) {
                    addCityMarker(result[0].value, result[0].getAttribute('cp'))
                    .then(marker => {
                        updateList(result[0].value, result[0].getAttribute('cp'), marker)
                    })
                }
            }
        }
    })
}

export {
    initSearchBox
}