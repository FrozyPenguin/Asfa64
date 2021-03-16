import groupesInfos from './groupes.infos.js';
import { addCityMarker, removeMarker } from './map.js';
import { createElementFromHTML } from './utils/htmlToDom.js';

function createListing() {
    let villes = [];
    const toShow = ['Orthez', 'Artix', 'Arthez de Béarn', 'Puyoo', 'Mourenx', 'Monein'];
    const listingAlphabeticGroup = document.querySelector('#alphaPlusGroupe');
    // Trie par groupe et par ordre alphabetique
    groupesInfos.forEach(groupe => {
        groupe.villes.sort((a, b) => {
            let nameA = a.nom.toUpperCase();
            let nameB = b.nom.toUpperCase();
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
        })

        let accordionItem = `
        <div class="accordion-item">
            <h2 class="accordion-header" id="head${groupe.color}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#target${groupe.color}" aria-expanded="false" aria-controls="target${groupe.color}">
                    ${groupe.nom}
                </button>
            </h2>
            <div id="target${groupe.color}" class="accordion-collapse collapse" aria-labelledby="head${groupe.color}" data-bs-parent="#alphaPlusGroupe">
                <div class="accordion-body">
                    <ul class="list-group listing">
                    </ul>
                </div>
            </div>
        </div>
        `;

        const accordionBody = listingAlphabeticGroup.appendChild(createElementFromHTML(accordionItem)).querySelector('.accordion-body ul');

        groupe.villes.forEach(ville => {
            accordionBody.appendChild(createElementFromHTML(`<li class="list-group-item" city="${ville.nom}" cp="${ville.cp}">${ville.nom}</li>`))
            .addEventListener('click', liClickEvent);

            if(toShow.includes(ville.nom)) villes.push(ville);
        })
    })

    villes.forEach(ville => {
        addCityMarker(ville.nom, ville.cp);
    })
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