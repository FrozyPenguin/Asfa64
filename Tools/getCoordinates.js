const fs = require('fs/promises');
const groupes = require('./groupes.infos');
const axios = require('axios');

let finalGroupes = groupes;

groupes.forEach((groupe, indexGroupe) => {
    groupe.villes.forEach((ville, indexVille) => {
        let city = ville.nom;
        axios.get(`https://api-adresse.data.gouv.fr/search/?q=${city.replace(/ /g, '%20').replace(/é/g, '%C3%A9')}&type=municipality&postcode=${ville.cp}&autocomplete=1`)
        .then(json => {
            json = json.data;
            if(!json.features.length) throw 'Nom de commune inconnu !';

            let coordinates = json.features[0].geometry.coordinates;

            finalGroupes[indexGroupe].villes[indexVille].coordinates = coordinates;

            finalGroupes[indexGroupe].villes[indexVille].citycode = json.features[0].properties.citycode;

            if(indexGroupe == groupes.length-1 && indexVille == groupe.villes.length-1) {
                fs.writeFile(`../frontend/js/groupes.infos.js`, 'export default ' + JSON.stringify(finalGroupes, null, 4).replace(/"([^"]+)":/g, '$1:'))
                .then(() => console.log(`Sauvegardé !`));
            }
        })
        .catch(error => console.error(error));
    })
})