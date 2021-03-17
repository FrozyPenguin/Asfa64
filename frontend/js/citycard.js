import cardinfo from './infoCard.js';
import { createElementFromHTML } from './utils/htmlToDom.js';

function createIdCard(citycode, color) {
    let info = cardinfo.filter(info => info.citycode == citycode);

    color = '#' + color;
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    color = result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;

    if(info.length && color) info = info[0];
    else {
        if(history.length > 1)
            history.back();
        else window.close();
    };

    axios.get(`https://etablissements-publics.api.gouv.fr/v3/communes/${citycode}/mairie`)
    .then(json => {
        json = json.data.features[0].properties;

        console.log(json)

        document.title = info.nom;
        document.body.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.25)`;

        document.querySelector('#titre').innerHTML = info.nom;
        document.querySelector('#titre').style.fontWeight = 'bold';
        document.querySelector('#tel').innerHTML += json.telephone;
        document.querySelector('#mail').innerHTML += json.email;
        if(json.url)
            document.querySelector('#site a').href = json.url;
        else document.querySelector('#site').remove();

        if(info.partenaires && info.partenaires.length && info.partenaires instanceof Array) {
            let htmlContent = document.createElement('ul');

            info.partenaires.forEach(partenaire => {
                htmlContent.append(createElementFromHTML(`<li>${partenaire.nom}</li>`))
            })

            let container = document.querySelector(`#infosContainer`);
            container.append(createElementFromHTML(`<h4>Partenaires potentiels</h4>`));
            container.append(htmlContent);
        }
    })
    .catch(error => {
        throw error;
    })
}

const urlParams = new URLSearchParams(window.location.search);
let citycode = urlParams.get('citycode');
let color = (parseInt(urlParams.get('c')) / (20*50+9-8/2)).toString(16);
createIdCard(citycode, color)

export {
    createIdCard
}