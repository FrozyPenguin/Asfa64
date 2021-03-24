import cardinfo from './listesAssociations.js';
import { createElementFromHTML } from './utils/htmlToDom.js';

/**
 * Cette fonction permet de créer les cartes d'indentité de chaque ville
 * @param { String } citycode le code unique de la ville correspondante en accord avec la geo api du gouvernement
 * @param { String } color couleur hexadécimal correspondant au fond de la page
 */
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
        document.querySelector('.citycard header').style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
        document.querySelector('.citycard').style.boxShadow = `0px 0px 0px 6px rgba(${color.r}, ${color.g}, ${color.b}, 1) inset`;

        document.querySelector('#titre').innerHTML = info.nom;
        document.querySelector('#titre').style.fontWeight = 'bold';
        document.querySelector('#tel').innerHTML += json.telephone;
        document.querySelector('#mail').innerHTML += json.email;

        if(json.url)
            document.querySelector('#site a').href = json.url;
        else document.querySelector('#site').remove();

        // Ajout des infrastructures
        if(info.partenaires && info.partenaires.length && info.partenaires instanceof Array) {
            let htmlContent = document.createElement('ul');

            info.partenaires.forEach(partenaire => {
                let li = document.createElement('li');
                li.append(createElementFromHTML(`<p class="p-0 m-0">${partenaire.nom}</p>`));
                if(partenaire.tel) li.append(createElementFromHTML(`<p class="p-0 m-0 px-4"><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>${partenaire.tel}</p>`));
                if(partenaire.mail) li.append(createElementFromHTML(`<p class="p-0 m-0 px-4"><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>${partenaire.mail}</p>`));
                htmlContent.append(li);
            })

            let container = document.querySelector(`#infosContainer`);
            container.append(createElementFromHTML(`<h4>Partenaires potentiels</h4>`));
            container.append(htmlContent);
        }

        // Ajout des "Possibilité sur place"
        if(info.possibilite && info.possibilite.length && info.possibilite instanceof Array) {
            let htmlContent = document.createElement('ul');

            info.possibilite.forEach(association => {
                let li = document.createElement('li');
                li.append(createElementFromHTML(`<p class="p-0 m-0">${association.nom}</p>`));
                if(association.tel) li.append(createElementFromHTML(`<p class="p-0 m-0 px-4"><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>${association.tel}</p>`));
                if(association.mail) li.append(createElementFromHTML(`<p class="p-0 m-0 px-4"><svg class="icons" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>${association.mail}</p>`));
                htmlContent.append(li);
            })

            let container = document.querySelector(`#infosContainer`);
            container.append(createElementFromHTML(`<h4>Possibilité sur place</h4>`));
            container.append(htmlContent);
        }

        // Ajout des mobilités
        if(info.mobilite && info.mobilite.length && info.mobilite instanceof Array) {
            let container = document.querySelector('#mobilite');

            info.mobilite.forEach(mobilite => {
                container.append(createElementFromHTML(`<li>${mobilite.nom}</li>`));
            })
        }

        let pseudoElementStyle = document.head.appendChild(document.createElement("style"));
        pseudoElementStyle.innerHTML = `.citycard ul::before { background-color: rgba(${color.r}, ${color.g}, ${color.b}, 1) }`;
    })
    .catch(error => {
        throw error;
    })
}

const urlParams = new URLSearchParams(window.location.search);
let citycode = urlParams.get('citycode');
let color = (parseInt(urlParams.get('c')) / (20*50+9-8/2)).toString(16);

// Les paramètres corresponde au paramètre GET de la page pour plus de simplicité niveau traitement
createIdCard(citycode, color);

export {
    createIdCard
}