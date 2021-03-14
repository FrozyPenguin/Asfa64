const fs = require('fs/promises');
const groupes = require('./groupes');
const axios = require('axios');
const union = require('@turf/union').default;

/**
 * Génère un groupe de ville en fonction du fichier groupes.js
 */
groupes.forEach(groupe => {
    let promises = [];
    groupe.villes.forEach(ville => {
        promises.push(axios.get(`https://geo.api.gouv.fr/communes?nom=${ville.nom}&codePostal=${ville.cp}&format=geojson&geometry=contour`))
    })

    Promise.all(promises)
    .then((responses) => {
        let geoJson = [];
        responses.forEach(({ data }, index) => {
            if(data.features[0]) {
                if(geoJson instanceof Array) {
                    geoJson = data.features[0];
                    return;
                }

                // Utilisation de turf union pour fusionner les geoJson
                geoJson = union(geoJson, data.features[0]);
            }
        })

        fs.writeFile(`../frontend/groupes/Groupe-${groupe.color}.geojson`, JSON.stringify(geoJson))
        .then(() => console.log(`Groupe ${groupe.color} sauvegardé !`));
    })
})